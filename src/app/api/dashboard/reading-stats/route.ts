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

    const readingStats = await prisma.book.groupBy({
      by: ["reading_status"],
      _count: {
        _all: true,
      },
    });

    // Transformar para o formato esperado
    const stats = readingStats.reduce((acc, item) => {
      acc[item.reading_status] = item._count._all;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas de leitura:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}