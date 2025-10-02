// Client-side service - usa fetch para APIs
export const bookService = {
  async getBooks(filters?: any) {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.genre) params.append('genre', filters.genre);
    if (filters?.readingStatus) params.append('readingStatus', filters.readingStatus);

    const response = await fetch(`/api/books?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar livros');
    }

    return response.json();
  },

  async getGenres() {
    const response = await fetch('/api/books/genres', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar gêneros');
    }

    return response.json();
  },
};

// Manter os tipos
export type BookFilter = {
  search?: string;
  genre?: string;
  readingStatus?: string;
};

export const GENRES = [
  'Romance',
  'Ficção Científica',
  'Fantasia',
  'Suspense',
  'Terror',
  'Biografia',
  'História',
  'Autoajuda',
  'Negócios',
  'Tecnologia',
  'Programação',
  'Literatura Brasileira',
  'Infantil',
  'Young Adult'
] as const;