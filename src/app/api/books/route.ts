import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const genre = searchParams.get('genre');
    const readingStatus = searchParams.get('readingStatus');

    // Construir where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
      ];
    }

    if (genre) {
      where.genre = genre;
    }

    if (readingStatus) {
      where.reading_status = readingStatus;
    }

    const books = await prisma.book.findMany({
      where,
      orderBy: { title: 'asc' },
      include: {
        loans: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}