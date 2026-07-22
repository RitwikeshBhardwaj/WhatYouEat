import { cn } from '../../utils';

const COLORS = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-100 text-brand-700',
};

export default function Badge({ color = 'gray', children, className }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', COLORS[color], className)}>
      {children}
    </span>
  );
}
