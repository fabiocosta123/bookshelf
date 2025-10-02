import { prisma } from '../prisma';

export class ReviewServiceServer {
  // Buscar observações de um usuário específico para um livro
  async getUserReviews(bookId: string, userId: string) {
    return await prisma.review.findMany({
      where: {
        bookId,
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        book: {
          select: {
            title: true,
            author: true
          }
        }
      }
    });
  }

  // Buscar uma observação específica
  async getReviewById(id: string) {
    return await prisma.review.findUnique({
      where: { id },
      include: {
        book: {
          select: {
            title: true,
            author: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  }

  // Criar nova observação
  async createReview(data: {
    content: string;
    page?: number;
    bookId: string;
    userId: string;
    isPrivate?: boolean;
  }) {
    // Verificar se já existe uma observação para mesma página
    const existingReview = await prisma.review.findMany({
      where: {
        bookId: data.bookId,
        userId: data.userId
        }
    });

    if (existingReview) {
      throw new Error('Você já tem uma observação para esta página.');
    }

    return await prisma.review.create({
      data: {
        content: data.content,
        page: data.page,
        bookId: data.bookId,
        userId: data.userId,
        isPrivate: data.isPrivate ?? true
      },
      include: {
        book: {
          select: {
            title: true,
            author: true
          }
        }
      }
    });
  }

  // Atualizar observação
  async updateReview(id: string, userId: string, data: {
    content?: string;
    page?: number;
    isPrivate?: boolean;
  }) {
    // Verificar se a observação pertence ao usuário
    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      throw new Error('Observação não encontrada.');
    }

    if (existingReview.userId !== userId) {
      throw new Error('Você não tem permissão para editar esta observação.');
    }

    return await prisma.review.update({
      where: { id },
      data: {
        content: data.content,
        page: data.page,
        isPrivate: data.isPrivate
      },
      include: {
        book: {
          select: {
            title: true,
            author: true
          }
        }
      }
    });
  }

  // Excluir observação
  async deleteReview(id: string, userId: string) {
    // Verificar se a observação pertence ao usuário
    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      throw new Error('Observação não encontrada.');
    }

    if (existingReview.userId !== userId) {
      throw new Error('Você não tem permissão para excluir esta observação.');
    }

    return await prisma.review.delete({
      where: { id }
    });
  }

  // Buscar todas as observações de um usuário (para perfil)
  async getUserAllReviews(userId: string) {
    return await prisma.review.findMany({
      where: { userId },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        book: {
          select: {
            title: true,
            author: true,
            cover: true
          }
        }
      }
    });
  }
}

export const reviewServiceServer = new ReviewServiceServer();