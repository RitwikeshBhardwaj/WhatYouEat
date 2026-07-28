import { cn } from '../../utils';

const COLORS = {
  green: 'bg-green-500/15 text-green-400',
  red: 'bg-red-500/15 text-red-400',
  amber: 'bg-amber-500/15 text-amber-400',
  blue: 'bg-blue-500/15 text-blue-400',
  gray: 'bg-white/10 text-white/60',
  brand: 'bg-brand-500/15 text-brand-400',
};

export default function Badge({ color = 'gray', children, className }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', COLORS[color], className)}>
      {children}
    </span>
  );
}
