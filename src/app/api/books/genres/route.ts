import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const genres = await prisma.book.findMany({
      distinct: ['genre'],
      select: { genre: true },
      where: { genre: { not: null } },
      orderBy: { genre: 'asc' }
    });

    const genreList = genres.map(g => g.genre).filter(Boolean);

    return NextResponse.json(genreList);
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}