// app/books/page.tsx
import { BookPlus } from 'lucide-react';
import Link from 'next/link';
import { BookCard } from '@/components/books/book-card';
import { bookService } from '@/lib/services/book-service';
import { SearchAndFilters } from '@/components/books/search-and-filters';

export default async function BooksPage({
  searchParams
}: {
  searchParams: { search?: string; genre?: string; status?: string }
}) {
  const filters = {
    search: searchParams.search,
    genre: searchParams.genre,
    readingStatus: searchParams.status
  };

  const [books, genres] = await Promise.all([
    bookService.getBooks(filters),
    bookService.getGenres()
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca</h1>
          <p className="text-gray-600 mt-2">
            Gerencie sua coleção de livros ({books.length} livros)
          </p>
        </div>
        
        <Link
          href="/books/new"
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200 flex items-center"
        >
          <BookPlus className="h-5 w-5 mr-2" />
          Adicionar Livro
        </Link>
      </div>

      {/* Busca e Filtros */}
      <SearchAndFilters genres={genres} initialFilters={filters} />

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
              : 'Comece adicionando seu primeiro livro à biblioteca.'
            }
          </p>
          <Link
            href="/books/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200 inline-flex items-center"
          >
            <BookPlus className="h-5 w-5 mr-2" />
            Adicionar Primeiro Livro
          </Link>
        </div>
      ) : (
        <>
          {/* Grid de Livros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
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