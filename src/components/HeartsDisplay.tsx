import { Heart } from 'lucide-react';

export const MAX_HEARTS = 3;

interface HeartsDisplayProps {
  hearts: number;
  maxHearts?: number;
  size?: 'sm' | 'md';
}

export const HeartsDisplay = ({ hearts, maxHearts = MAX_HEARTS, size = 'md' }: HeartsDisplayProps) => {
  const iconSize = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <div className="flex items-center gap-1" aria-label={`${hearts} of ${maxHearts} hearts remaining`}>
      {Array.from({ length: maxHearts }, (_, i) => {
        const filled = i < hearts;
        return (
          <Heart
            key={i}
            className={`${iconSize} transition-all duration-300 ${
              filled
                ? 'fill-red-500 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                : 'fill-transparent text-muted-foreground/40'
            }`}
            aria-hidden
          />
        );
      })}
    </div>
  );
};
