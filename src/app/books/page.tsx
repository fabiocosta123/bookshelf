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

export default function BooksPage({
  searchParams
}: {
  searchParams: { search?: string; genre?: string; status?: string }
}) {
  useRequireAuth(); // Protege a página
  const { isClient } = useAuth();
  
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Definir os filters
  const filters: BookFilter = {
    search: searchParams.search,
    genre: searchParams.genre && GENRES.includes(searchParams.genre as any) 
      ? searchParams.genre as any 
      : undefined,
    readingStatus: searchParams.status && [
      'QUERO_LER', 'LENDO', 'LIDO', 'PAUSADO', 'ABANDONADO'
    ].includes(searchParams.status)
      ? searchParams.status as ReadingStatus
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
  }, [searchParams.search, searchParams.genre, searchParams.status]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

      {/* Busca e Filtros */}
      <SearchAndFilter 
        genres={genres} 
        initialFilter={{
          search: searchParams.search,
          genre: searchParams.genre,
          status: searchParams.status
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
                showAdminActions={!isClient} // ← AQUI ESTÁ A CORREÇÃO!
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