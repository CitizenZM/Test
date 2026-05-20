import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  className?: string;
}

const variantClasses = {
  default: 'bg-slate-100 text-slate-600 ring-slate-200/60',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200/60',
  danger: 'bg-red-50 text-red-700 ring-red-200/60',
  info: 'bg-blue-50 text-blue-700 ring-blue-200/60',
  purple: 'bg-violet-50 text-violet-700 ring-violet-200/60',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
