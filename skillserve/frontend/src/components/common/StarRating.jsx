import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, maxRating = 5 }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;

        return (
          <div key={i} className="relative">
            <Star className="w-4 h-4 text-gray-200" fill="#E5E7EB" />
            {filled && (
              <Star className="w-4 h-4 text-yellow-400 absolute inset-0" fill="#FACC15" />
            )}
            {partial && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <Star className="w-4 h-4 text-yellow-400" fill="#FACC15" />
              </div>
            )}
          </div>
        );
      })}
      {rating > 0 && (
        <span className="text-sm font-medium text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
