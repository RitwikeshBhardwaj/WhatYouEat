import { cn } from '../../utils';

export default function ProgressBar({ value, max = 100, className, color = 'bg-brand-500' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const over = value > max;
  return (
    <div className={cn('h-3 w-full rounded-full bg-slate-200 overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all', over ? 'bg-red-500' : color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
