import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md';
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 ring-emerald-200/60';
  if (score >= 60) return 'text-amber-600 bg-amber-50 ring-amber-200/60';
  if (score >= 40) return 'text-orange-600 bg-orange-50 ring-orange-200/60';
  return 'text-red-500 bg-red-50 ring-red-200/60';
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
      {label && <span className="text-[11px] font-medium text-slate-500">{label}</span>}
    </div>
  );
}
