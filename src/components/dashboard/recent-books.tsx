// components/dashboard/recent-books.tsx - DEVE existir
'use client';

import Image from 'next/image';
import { Book } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  reading_status: string;
}

interface RecentBooksProps {
  books: Book[];
}

export function RecentBooks({ books }: RecentBooksProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Book className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Nenhum livro cadastrado ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {books.map((book) => (
        <div key={book.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
          <div className="flex-shrink-0 w-10 h-14 bg-gray-200 rounded flex items-center justify-center">
            {book.cover ? (
              <Image
                src={book.cover}
                alt={book.title}
                width={40}
                height={56}
                className="rounded object-cover"
              />
            ) : (
              <Book className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{book.title}</p>
            <p className="text-xs text-gray-500 truncate">{book.author}</p>
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize mt-1">
              {book.reading_status.toLowerCase().replace('_', ' ')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}