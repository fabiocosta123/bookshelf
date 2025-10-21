import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { reviewServiceServer } from '@/lib/services/review-service-server';

// GET /api/reviews - Buscar observações do usuário para um livro
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json(
        { error: 'ID do livro é obrigatório' },
        { status: 400 }
      );
    }

    const reviews = await reviewServiceServer.getUserReviews(
      bookId,
      session.user.id
    );

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Erro ao buscar observações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Criar nova observação
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { content, page, bookId, isPrivate } = body;

    if (!content || !bookId) {
      return NextResponse.json(
        { error: 'Conteúdo e ID do livro são obrigatórios' },
        { status: 400 }
      );
    }

    const review = await reviewServiceServer.createReview({
      content,
      page: page ? Number(page) : undefined,
      bookId,
      userId: session.user.id,
      isPrivate
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar observação:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('já tem uma observação')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}