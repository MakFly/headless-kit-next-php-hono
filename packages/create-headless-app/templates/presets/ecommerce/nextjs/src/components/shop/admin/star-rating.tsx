import { Star } from 'lucide-react';

type StarRatingProps = {
  rating: number;
  size?: number;
};

export function StarRating({ rating, size = 16 }: StarRatingProps) {
  return (
    <span className="inline-flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-muted-foreground/30'
          }
          style={{ width: size, height: size }}
        />
      ))}
    </span>
  );
}
