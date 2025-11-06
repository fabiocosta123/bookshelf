import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") ?? "month";

    const now = new Date();
    const startDate =
      range === "year" ? subMonths(now, 12) :
      range === "quarter" ? subMonths(now, 3) :
      subMonths(now, 1);

    // Estatísticas gerais
    const [totalBooks, totalUsers, activeLoans, completedLoans, overdueLoans, pendingLoans] = await Promise.all([
      prisma.book.count(),
      prisma.user.count(),
      prisma.loan.count({ where: { status: "ACTIVE" } }),
      prisma.loan.count({ where: { status: "RETURNED" } }),
      prisma.loan.count({ where: { status: "OVERDUE" } }),
      prisma.loan.count({ where: { status: "PENDING" } }),
    ]);

    // Livros mais populares
    const popularRaw = await prisma.loan.groupBy({
      by: ["bookId"],
      _count: { bookId: true },
      orderBy: { _count: { bookId: "desc" } },
      take: 5,
    });

    const popularBooks = await Promise.all(
      popularRaw.map(async (entry) => {
        const book = await prisma.book.findUnique({
          where: { id: entry.bookId },
          select: { id: true, title: true, author: true, available_copies: true },
        });
        return {
          id: book?.id ?? entry.bookId,
          title: book?.title ?? "Livro desconhecido",
          author: book?.author ?? "Autor desconhecido",
          loanCount: entry._count.bookId,
          available: (book?.available_copies ?? 0) > 0,
        };
      })
    );

    // Usuários mais ativos
    const activeRaw = await prisma.loan.groupBy({
      by: ["userId"],
      _count: { userId: true },
      orderBy: { _count: { userId: "desc" } },
      take: 5,
    });

    const activeUsers = await Promise.all(
      activeRaw.map(async (entry) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: { id: true, name: true, email: true, role: true },
        });
        return {
          id: user?.id ?? entry.userId,
          name: user?.name ?? "Usuário desconhecido",
          email: user?.email ?? "email@desconhecido.com",
          role: user?.role ?? "CLIENT",
          loanCount: entry._count.userId,
        };
      })
    );

    // Crescimento mensal
    const monthsMap = new Map<string, { newUsers: number; newLoans: number; returns: number }>();

    const users = await prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    });

    const loans = await prisma.loan.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, status: true, returnedAt: true },
    });

    users.forEach((user) => {
      const key = format(user.createdAt, "MMM", { locale: ptBR });
      const stats = monthsMap.get(key) ?? { newUsers: 0, newLoans: 0, returns: 0 };
      stats.newUsers += 1;
      monthsMap.set(key, stats);
    });

    loans.forEach((loan) => {
      const createdKey = format(loan.createdAt, "MMM", { locale: ptBR });
      const statsCreated = monthsMap.get(createdKey) ?? { newUsers: 0, newLoans: 0, returns: 0 };
      statsCreated.newLoans += 1;
      monthsMap.set(createdKey, statsCreated);

      if (loan.status === "RETURNED" && loan.returnedAt) {
        const returnedKey = format(loan.returnedAt, "MMM", { locale: ptBR });
        const statsReturned = monthsMap.get(returnedKey) ?? { newUsers: 0, newLoans: 0, returns: 0 };
        statsReturned.returns += 1;
        monthsMap.set(returnedKey, statsReturned);
      }
    });

    const monthlyGrowth = Array.from(monthsMap.entries())
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => {
        const order = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        return order.indexOf(a.month) - order.indexOf(b.month);
      });

    return NextResponse.json({
      generalStats: {
        totalBooks,
        totalUsers,
        activeLoans,
        completedLoans,
        overdueLoans,
        pendingLoans,
      },
      popularBooks,
      activeUsers,
      monthlyGrowth,
    });
  } catch (error) {
    console.error("Erro ao gerar relatórios:", error);
    return NextResponse.json({ error: "Erro ao gerar relatórios" }, { status: 500 });
  }
}