import { toast } from 'sonner';

// Client-side service para observações
export const reviewService = {
  // Buscar observações do usuário para um livro
  async getUserReviews(bookId: string) {
    try {
      const response = await fetch(`/api/reviews?bookId=${bookId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar observações');
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar observações:', error);
      toast.error('Erro ao carregar observações', {
        description: 'Tente novamente mais tarde.',
      });
      throw error;
    }
  },

  // Criar nova observação
  async createReview(data: {
    content: string;
    page?: number;
    bookId: string;
    isPrivate?: boolean;
  }) {
    try {
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

      const result = await response.json();
      
      toast.success('Observação criada com sucesso!', {
        description: 'Sua anotação foi salva.',
      });

      return result;
    } catch (error) {
      console.error('Erro ao criar observação:', error);
      
      if (error instanceof Error) {
        toast.error('Erro ao criar observação', {
          description: error.message,
        });
      } else {
        toast.error('Erro ao criar observação', {
          description: 'Tente novamente mais tarde.',
        });
      }
      
      throw error;
    }
  },

  // Atualizar observação
  async updateReview(id: string, data: {
    content: string;
    page?: number;
    isPrivate?: boolean;
  }) {
    try {
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

      const result = await response.json();
      
      toast.success('Observação atualizada!', {
        description: 'Sua anotação foi atualizada com sucesso.',
      });

      return result;
    } catch (error) {
      console.error('Erro ao atualizar observação:', error);
      
      if (error instanceof Error) {
        toast.error('Erro ao atualizar observação', {
          description: error.message,
        });
      } else {
        toast.error('Erro ao atualizar observação', {
          description: 'Tente novamente mais tarde.',
        });
      }
      
      throw error;
    }
  },

  // Excluir observação
  async deleteReview(id: string) {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir observação');
      }

      const result = await response.json();
      
      toast.success('Observação excluída!', {
        description: 'Sua anotação foi removida.',
      });

      return result;
    } catch (error) {
      console.error('Erro ao excluir observação:', error);
      
      if (error instanceof Error) {
        toast.error('Erro ao excluir observação', {
          description: error.message,
        });
      } else {
        toast.error('Erro ao excluir observação', {
          description: 'Tente novamente mais tarde.',
        });
      }
      
      throw error;
    }
  },

  // Buscar todas as observações de um usuário (para perfil)
  async getUserAllReviews(userId: string) {
    try {
      const response = await fetch(`/api/users/${userId}/reviews`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar observações');
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar observações do usuário:', error);
      toast.error('Erro ao carregar observações', {
        description: 'Não foi possível carregar suas anotações.',
      });
      throw error;
    }
  },
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