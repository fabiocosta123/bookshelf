import { NextRequest, NextResponse } from "next/server";
import { googleBooksService } from "@/lib/services/google-books-service";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const maxResults =  searchParams.get('maxResults') || '20';

        if (!query) {
            return NextResponse.json(
                { error: 'Parâmetro de busca (q) é obrigatório'},
                { status: 400}
            );
        }

        const books = await googleBooksService.searchBooks(query, parseInt(maxResults));

        return NextResponse.json(books);

    } catch(error: any) {
        console.error('Erro na API Google Books:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor'},
            { status: 500 }
        )
    }
}