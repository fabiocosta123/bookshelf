'use client';

import { BookPlus } from 'lucide-react';
import Link from 'next/link';
import { BookCard } from '@/components/books/book-card';
import { bookService, GENRES, type BookFilter } from '@/lib/services/book-service';
import { SearchAndFilter } from '@/components/books/search-and-filter';
import { ReadingStatus } from '@prisma/client';
import { useAuth } from '@/hooks/use-auth';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

// Definir tipo para os livros
interface Book {
  id: string;
  title: string;
  author: string;
  genre?: string | null;
  year?: number | null;
  pages?: number | null;
  total_copies: number;
  available_copies: number;
  rating?: number | null;
  cover?: string | null;
  reading_status: string;
  loans: Array<{
    id: string;
    user: { name: string };
  }>;
}

export default function BooksPage() {
  useRequireAuth();
  const { isClient } = useAuth();
  
  // Usar useSearchParams
  const searchParams = useSearchParams();
  const search = searchParams.get('search');
  const genre = searchParams.get('genre');
  const status = searchParams.get('status');
  
  // Tipar os estados
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Definir os filters
  const filters: BookFilter = {
    search: search || undefined,
    genre: genre && GENRES.includes(genre as any) 
      ? genre as any 
      : undefined,
    readingStatus: status && [
      'QUERO_LER', 'LENDO', 'LIDO', 'PAUSADO', 'ABANDONADO'
    ].includes(status)
      ? status as ReadingStatus
      : undefined
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [booksData, genresData] = await Promise.all([
          bookService.getBooks(filters),
          bookService.getGenres()
        ]);
        setBooks(booksData);
        setGenres(genresData);
      } catch (error) {
        console.error('Erro ao carregar livros:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [search, genre, status]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca</h1>
          <p className="text-gray-600 mt-2">
            {isClient ? 'Explore nossa coleção' : 'Gerencie sua coleção de livros'} ({books.length} livros)
          </p>
        </div>
        
        {/* Botão "Adicionar Livro" - Só para não-clientes */}
        {!isClient && (
          <Link
            href="/books/new"
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200 flex items-center"
          >
            <BookPlus className="h-5 w-5 mr-2" />
            Adicionar Livro
          </Link>
        )}
      </div>

      {/* Busca e Filtros - CORRIGIDO: usar search, genre, status em vez de params */}
      <SearchAndFilter 
        genres={genres} 
        initialFilter={{
          search: search || undefined, 
          genre: genre || undefined,     
          status: status || undefined  
        }} 
      />

      {/* Lista de Livros */}
      {books.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum livro encontrado
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {filters.search || filters.genre || filters.readingStatus 
              ? 'Tente ajustar os filtros de busca.'
              : isClient 
                ? 'A biblioteca está vazia no momento.'
                : 'Comece adicionando seu primeiro livro à biblioteca.'
            }
          </p>
          
          {/* Botão só para não-clientes */}
          {!isClient && (
            <Link
              href="/books/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200 inline-flex items-center"
            >
              <BookPlus className="h-5 w-5 mr-2" />
              Adicionar Primeiro Livro
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Grid de Livros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                showAdminActions={!isClient}
              />
            ))}
          </div>

          {/* Contador */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Mostrando {books.length} livro{books.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
}