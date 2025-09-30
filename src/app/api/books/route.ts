import { NextRequest, NextResponse } from 'next/server';
import { bookService } from '@/lib/services/book-service';
import { ReadingStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      title,
      author,
      genre,
      year,
      pages,
      total_copies,
      rating,
      synopsis,
      cover,
      reading_status,
      isbn
    } = body;

    // Validação básica
    if (!title || !author) {
      return NextResponse.json(
        { error: 'Título e autor são obrigatórios' },
        { status: 400 }
      );
    }

    const book = await bookService.createBook({
      title,
      author,
      genre,
      year: year ? Number(year) : undefined,
      pages: pages ? Number(pages) : undefined,
      total_copies: Number(total_copies) || 1,
      rating: rating ? Number(rating) : undefined,
      synopsis,
      cover,
      reading_status: reading_status as ReadingStatus,
      isbn
    });

    return NextResponse.json(book, { status: 201 });
    
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}