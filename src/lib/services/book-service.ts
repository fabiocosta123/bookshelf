import { prisma } from "@/lib/database";
import { Book, ReadingStatus } from "@prisma/client";

export const GENRES = [
  "Literatura Brasileira",
  "Ficção Científica",
  "Realismo Mágico",
  "Ficção",
  "Fantasia",
  "Romance",
  "Biografia",
  "História",
  "Autoajuda",
  "Tecnologia",
  "Programação",
  "Negócios",
  "Psicologia",
  "Filosofia",
  "Poesia",
] as const;

export type Genre = (typeof GENRES)[number];

export interface BookFilter {
  search?: string;
  genre?: Genre;
  readingStatus?: ReadingStatus;
  author?: string;
}

export class BookService {
  async getBooks(filters: BookFilter = {}) {
    const where: any = {};

    // filtrar por autor ou titulo
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { author: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // filtrar por genero
    if (filters.genre) {
      where.genre = filters.genre;
    }

    // filtrar por status de leitura
    if (filters.readingStatus) {
      where.reading_status = filters.readingStatus;
    }

    return await prisma.book.findMany({
      where,
      orderBy: { title: "asc" },
      include: {
        loans: {
          where: { status: "ACTIVE" },
          include: { user: true },
        },

        conditions: {
          orderBy: { reported_at: "desc" },
          take: 1,
        },
      },
    });
  }

  async getGenres(): Promise<string[]> {
    const books = await prisma.book.findMany({
      select: { genre: true },
      distinct: ["genre"],
    });

    return books
      .map((book) => book.genre)
      .filter((genre): genre is string => !!genre)
      .sort();
  }

  async createBook(data: {
    title: string;
    author: string;
    genre?: string;
    year?: number;
    pages?: number;
    total_copies?: number;
    rating?: number;
    synopsis?: string;
    cover?: string;
    reading_status?: ReadingStatus;
    isbn?: string;
  }) {
    return await prisma.book.create({
      data: {
        ...data,
        available_copies: data.total_copies || 1,
      },
    });
  }

  async updateBook(id: string, data: any) {
    return await prisma.book.update({
      where: { id },
      data,
    });
  }

  async deleteBook(id: string) {
    return await prisma.book.delete({
      where: { id },
    });
  }
}

export const bookService = new BookService();
