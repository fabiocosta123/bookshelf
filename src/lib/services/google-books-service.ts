export interface GoogleBook {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        publishedDate?: string;
        description?: string;
        industryIdentifiers?: Array<{
            type: string;
            identifier: string;
        }>;
        pageCount?: number;
        categories?: string[];
        imageLinks?: {
            thumbnail?: string;
            smallThumbnail?: string;
        };
        averageRating?: number;
        ratingsCount?: number;
    }
}

export class GoogleBookService {
    private baseURL = 'https://www.googleapis.com/books/v1';

    async searchBooks(query: string, maxResults: number = 20) : Promise<GoogleBook[]> {
        try {
            const response = await fetch(
                `${this.baseURL}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&printType=books`
            )

            if (!response.ok) {
                throw new Error('Erro ao buscar livros');
            }

            const data = await response.json()
            return data.items || [];

        } catch(error) {
            console.error('Erro no Google Books Service.', error);
            throw error;
        }
    }

    async getBookById(bookId: string) : Promise<GoogleBook | null> {
        try {
            const response = await fetch(`${this.baseURL}/volumes/${bookId}`)

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error('Erro ao buscar livro')
            }

            return await response.json();

        } catch (error) {
            console.error('Erro ao buscar livro por ID:', error)
            throw error;
        }
    }

    // converte livro da Google Books para o formato do sistema
    formatBookForImport(googleBook: GoogleBook) {
        const volumeInfo = googleBook.volumeInfo;

        return {
            title: volumeInfo.title || 'Título desconhecido',
            author: volumeInfo.authors?.join(', ') || 'Autor desconhecido',
            genre: volumeInfo.categories?.[0] || null,
            year: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : null,
            pages: volumeInfo.pageCount || null,
            synopsis: volumeInfo.description || null,
            cover: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://'),
            isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                  volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || null,
            rating: volumeInfo.averageRating || null,
        }
    }
}

export const googleBooksService = new GoogleBookService();