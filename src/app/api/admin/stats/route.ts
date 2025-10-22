import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET Lista estatistica de usuários
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso Negado" }, { status: 403 });
    }

    // buscar estatisticas
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      clients,
      employees,
      admins,
      usersWithLoans,
      newUsersThisMonth,
    ] = await Promise.all([
      // total de usuarios
      prisma.user.count(),

      // usuarios ativos
      prisma.user.count({ where: { status: "ACTIVE" } }),

      // usuarios suspensos
      prisma.user.count({ where: { status: "SUSPENDED" } }),

      // clientes
      prisma.user.count({ where: { role: "CLIENT" } }),

      // funcionários
      prisma.user.count({ where: { role: "EMPLOYEE" } }),

      // administradores
      prisma.user.count({ where: { role: "ADMIN" } }),

      // usuarios com empréstimos ativos
      prisma.user.count({
        where: {
          loans: {
            some: {
              status: { in: ["APPROVED", "ACTIVE"] },
            },
          },
        },
      }),

      // novos usuarios dentro do mes
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      suspendedUsers,
      clients,
      employees,
      admins,
      usersWithLoans,
      newUsersThisMonth,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
