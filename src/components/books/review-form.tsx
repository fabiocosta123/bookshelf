'use client';

import { useState } from 'react';
import { reviewService } from '@/lib/services/review-service';
import { Save, X, Lock, LockOpen } from 'lucide-react';

interface ReviewFormProps {
  bookId: string;
  review?: {
    id: string;
    content: string;
    page?: number;
    isPrivate: boolean;
  };
  onCancel: () => void;
  onSuccess: (review: any) => void;
}

export function ReviewForm({ bookId, review, onCancel, onSuccess }: ReviewFormProps) {
  const [content, setContent] = useState(review?.content || '');
  const [page, setPage] = useState(review?.page?.toString() || '');
  const [isPrivate, setIsPrivate] = useState(review?.isPrivate ?? true);
  const [loading, setLoading] = useState(false);

  const isEditing = !!review;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        const updatedReview = await reviewService.updateReview(review.id, {
          content: content.trim(),
          page: page ? parseInt(page) : undefined,
          isPrivate
        });
        onSuccess(updatedReview);
      } else {
        const newReview = await reviewService.createReview({
          content: content.trim(),
          page: page ? parseInt(page) : undefined,
          bookId,
          isPrivate
        });
        onSuccess(newReview);
      }
    } catch (error) {
      // Erro já é tratado no service
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Sua Observação *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva suas anotações sobre o livro..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={4}
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="page" className="block text-sm font-medium text-gray-700 mb-2">
            Página (opcional)
          </label>
          <input
            type="number"
            id="page"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="Ex: 45"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visibilidade
          </label>
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex items-center w-full px-3 py-2 border rounded-lg transition-colors ${
              isPrivate
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
            disabled={loading}
          >
            {isPrivate ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Privada (só você vê)
              </>
            ) : (
              <>
                <LockOpen className="h-4 w-4 mr-2" />
                Pública
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <X className="h-4 w-4 inline mr-1" />
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
        >
          <Save className="h-4 w-4 inline mr-1" />
          {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}