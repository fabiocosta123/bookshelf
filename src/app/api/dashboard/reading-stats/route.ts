import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const readingStats = await prisma.book.groupBy({
      by: ['reading_status'],
      _count: { id: true },
    });

    const totalPagesRead = await prisma.book.aggregate({
      where: { reading_status: 'LIDO' },
      _sum: { pages: true },
    });

    const stats = Object.fromEntries(
      readingStats.map(stat => [stat.reading_status, stat._count.id])
    );

    return NextResponse.json({
      ...stats,
      totalPagesRead: totalPagesRead._sum.pages ?? 0,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de leitura:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
