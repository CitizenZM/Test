import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md';
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600 bg-green-50 ring-green-200';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 ring-yellow-200';
  if (score >= 40) return 'text-orange-600 bg-orange-50 ring-orange-200';
  return 'text-red-600 bg-red-50 ring-red-200';
}

export function ScoreBadge({ score, label, size = 'md' }: ScoreBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'flex items-center justify-center rounded-full ring-1 font-bold',
          getScoreColor(score),
          size === 'sm' ? 'h-8 w-8 text-xs' : 'h-12 w-12 text-sm'
        )}
      >
        {score}
      </div>
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </div>
  );
}
