import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar estatísticas
    const [
      totalBooks,
      totalUsers,
      activeLoans,
      completedLoans,
      recentBooks
    ] = await Promise.all([
      prisma.book.count(),
      prisma.user.count(),
      prisma.loan.count({ where: { status: "ACTIVE" } }),
      prisma.loan.count({ where: { status: "RETURNED" } }),
      prisma.book.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          author: true,
          cover: true,
          reading_status: true,
        },
      }),
    ]);

    const stats = {
      totalBooks,
      totalUsers,
      activeLoans,
      completedLoans,
      recentBooks,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}