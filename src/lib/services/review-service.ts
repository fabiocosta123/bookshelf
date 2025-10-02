// Client-side service para observações
export const reviewService = {
  // Buscar observações do usuário para um livro
  async getUserReviews(bookId: string) {
    const response = await fetch(`/api/reviews?bookId=${bookId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar observações');
    }

    return response.json();
  },

  // Criar nova observação
  async createReview(data: {
    content: string;
    page?: number;
    bookId: string;
    isPrivate?: boolean;
  }) {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar observação');
    }

    return response.json();
  },

  // Atualizar observação
  async updateReview(id: string, data: {
    content: string;
    page?: number;
    isPrivate?: boolean;
  }) {
    const response = await fetch(`/api/reviews/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar observação');
    }

    return response.json();
  },

  // Excluir observação
  async deleteReview(id: string) {
    const response = await fetch(`/api/reviews/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao excluir observação');
    }

    return response.json();
  }
};

export type Review = {
  id: string;
  content: string;
  page?: number;
  isPrivate: boolean;
  bookId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  book?: {
    title: string;
    author: string;
    cover?: string;
  };
};