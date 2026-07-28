import { cn } from '../../utils';

const VARIANTS = {
  primary: 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-sm shadow-brand-500/30',
  secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
  danger: 'bg-accent-500 hover:bg-accent-600 text-white',
  ghost: 'bg-transparent hover:bg-white/5 text-white/70 hover:text-white',
};

export default function Button({ variant = 'primary', className, children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
