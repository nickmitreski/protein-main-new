import { Star } from 'lucide-react';
import { colors } from '../utils/design-system';

interface StarRatingProps {
  rating: number;
  size?: number;
}

export default function StarRating({ rating, size = 13 }: StarRatingProps) {
  return (
    <div className="flex" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          fill={s <= Math.round(rating) ? colors.red : 'none'}
          color={s <= Math.round(rating) ? colors.red : colors.gray400}
        />
      ))}
    </div>
  );
}
