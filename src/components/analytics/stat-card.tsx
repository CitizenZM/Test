import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { memo } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

export const StatCard = memo(function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, iconColor = 'text-indigo-600 bg-indigo-50' }: StatCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
          {change && (
            <p
              className={cn(
                'text-[12px] font-medium',
                changeType === 'positive' && 'text-emerald-600',
                changeType === 'negative' && 'text-red-500',
                changeType === 'neutral' && 'text-slate-400'
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110', iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
});
