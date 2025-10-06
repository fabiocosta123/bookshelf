import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { googleBooksService } from "@/lib/services/google-books-service";
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // apenas funcionarios e admin poder importar livros
        if (!session?.user?.id || (session.user.role !== 'EMPLOYEE' && session.user.role !== 'ADMIN')) {
            return NextResponse.json(
                { error: 'Não autorizado'},
                { status: 401}
            )
        }

        const { googleBookId } = await request.json();

        if(!googleBookId) {
            return NextResponse.json(
                { error: 'ID do livro do google Books é obrigatório'},
                { status: 400 }
            )
        }

        // busca libro no google books
        const googleBook = await googleBooksService.getBookById(googleBookId);

        if(!googleBook) {
            return NextResponse.json(
                { error: 'Livro não encontrado no Google Books'},
                { status: 404 }
            )
        }

        // formata para o modelo do sistema
        const bookData = googleBooksService.formatBookForImport(googleBook);

        // verifica se o livro já existe (pesquisa por ISBN)
        if (bookData.isbn) {
            const existingBook = await prisma.book.findFirst({
                where: { isbn: bookData.isbn }
            })

            if (existingBook) {
                return NextResponse.json(
                    { error: 'Livro já existe na biblioteca', book: existingBook},
                    { status: 409}
                )
            }
        }

        // cria livro no banco de dados
        const newBook = await prisma.book.create({
            data: {
                ...bookData,
                total_copies: 1,
                available_copies: 1,
                createdById: session.user.id,
            }
        })

        return NextResponse.json(newBook)


    } catch (error: any) {
        console.error('Erro ao importar livro:', error)
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor'},
            { status: 500 }
        )
    }
}