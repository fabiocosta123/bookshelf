"use client";

import { useState } from "react";
import { Review, reviewService } from "@/lib/services/review-service";
import { ReviewForm } from "./review-form";
import { DeleteReviewConfirmation } from "./delete-review-confirmation";
import {
  Edit2,
  Trash2,
  Lock,
  Calendar,
  BookOpen,
  Check,
  X,
} from "lucide-react";

interface ReviewItemProps {
  review: Review;
  onUpdated: (review: Review) => void;
  onDeleted: (reviewId: string) => void;
}

export function ReviewItem({ review, onUpdated, onDeleted }: ReviewItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await reviewService.deleteReview(review.id);
      onDeleted(review.id);
      setIsDeleteModalOpen(false);
    } catch (error) {
      // Erro já é tratado no service
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = (updatedReview: Review) => {
    onUpdated(updatedReview);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isEditing) {
    return (
      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
        <ReviewForm
          bookId={review.bookId}
          review={review}
          onCancel={() => setIsEditing(false)}
          onSuccess={handleEditSuccess}
        />
      </div>
    );
  }

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {review.page && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                <BookOpen className="h-3 w-3 mr-1" />
                Página {review.page}
              </span>
            )}

            <span
              className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                review.isPrivate
                  ? "bg-purple-100 text-purple-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {review.isPrivate ? (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Privada
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Pública
                </>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              disabled={isDeleting}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
              title="Editar observação"
            >
              <Edit2 className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isDeleting}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Excluir observação"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {review.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(review.updatedAt)}
            {review.createdAt !== review.updatedAt && (
              <span className="ml-1 text-orange-600">(editada)</span>
            )}
          </div>

          {review.book && (
            <div className="text-gray-400">em "{review.book.title}"</div>
          )}
        </div>
      </div>
      {/* MODAL DE CONFIRMAÇÃO */}
      <DeleteReviewConfirmation
        isOpen={isDeleteModalOpen} // ← CONTROLA SE O MODAL ESTÁ ABERTO
        onClose={() => setIsDeleteModalOpen(false)} // ← FECHA O MODAL
        onConfirm={handleDeleteConfirm} // ← CHAMA A FUNÇÃO DE EXCLUSÃO
        isLoading={isDeleting}
      />
    </>
  );
}
