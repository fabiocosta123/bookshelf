'use client';

import { Review } from '@/lib/services/review-service';
import { ReviewItem } from './review-item';

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  onReviewUpdated: (review: Review) => void;
  onReviewDeleted: (reviewId: string) => void;
}

export function ReviewList({ reviews, loading, onReviewUpdated, onReviewDeleted }: ReviewListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return null; // Já tratamos o estado vazio no ReviewSection
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          onUpdated={onReviewUpdated}
          onDeleted={onReviewDeleted}
        />
      ))}
    </div>
  );
}