"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { reviewService, type Review } from "@/lib/services/review-service";
import { ReviewForm } from "./review-form";
import { ReviewList } from "./review-list";
import { MessageSquare, Plus } from "lucide-react";

interface ReviewSectionProps {
  bookId: string;
}

export function ReviewSection({ bookId }: ReviewSectionProps) {
  const { user, isClient } = useAuth();
  const [review, setReview] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // carregar observaçoes do usuário
  const loadReviews = async () => {
    try {
      const userReviews = await reviewService.getUserReviews(bookId);
      setReview(userReviews);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isClient) {
      loadReviews();
    }
  }, [bookId, user, isClient]);

  // clientes não podem fazer observações
  if (!isClient) {
    return null;
  }

  const handleReviewCreated = (newReview: Review) => {
    setReview((prev) => [newReview, ...prev]);
    setShowForm(false);
  };

  const handleReviewUpdated = (updatedReview: Review) => {
    setReview((prev) =>
      prev.map((review) =>
        review.id === updatedReview.id ? updatedReview : review
      )
    );
  };

  const handleReviewDeleted = (reviewId: string) => {
    setReview((prev) => prev.filter((review) => review.id !== reviewId));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Minhas Observações
          </h3>
          <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {review.length}
          </span>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg
                        hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Observação
          </button>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="mb-6">
          <ReviewForm
            bookId={bookId}
            onCancel={() => setShowForm(false)}
            onSuccess={handleReviewCreated}
          />
        </div>
      )}

      {/* Lista de Observações */}
      <ReviewList
        reviews={review}
        loading={loading}
        onReviewUpdated={handleReviewUpdated}
        onReviewDeleted={handleReviewDeleted}
      />

      {/* Estado Vazio */}
      {!loading && review.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-sm">
            Nenhuma observação ainda.
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 hover:text-blue-700 ml-1 font-medium"
            >
              Faça sua primeira anotação!
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
