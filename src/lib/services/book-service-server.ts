import { prisma } from '../prisma';
import { ReadingStatus } from '@prisma/client';

export class BookServiceServer {
  async getBookById(id: string) {
    return await prisma.book.findUnique({
      where: { id },
      include: {
        loans: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    });
  }

  async getBooks(filters?: { search?: string; genre?: string; readingStatus?: ReadingStatus }) {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { author: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.genre) {
      where.genre = filters.genre;
    }

    if (filters?.readingStatus) {
      where.reading_status = filters.readingStatus;
    }

    return await prisma.book.findMany({
      where,
      orderBy: { title: 'asc' },
      include: {
        loans: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    });
  }

  async getGenres() {
    const genres = await prisma.book.findMany({
      distinct: ['genre'],
      select: { genre: true },
      where: { genre: { not: null } },
      orderBy: { genre: 'asc' }
    });

    return genres.map(g => g.genre).filter(Boolean);
  }

  async updateBook(id: string, data: any) {
    return await prisma.book.update({
      where: { id },
      data: {
        ...data,
        available_copies: data.total_copies
      }
    });
  }

  async deleteBook(id: string) {
    return await prisma.book.delete({
      where: { id }
    });
  }

  async createBook(data: any) {
    return await prisma.book.create({
      data: {
        ...data,
        available_copies: data.total_copies || 1
      }
    });
  }
}

export const bookServiceServer = new BookServiceServer();