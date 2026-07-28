import { forwardRef } from 'react';
import { cn } from '../../utils';

const Input = forwardRef(({ label, error, className, id, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-white/60 mb-1">
        {label}
      </label>
    )}
    <input
      ref={ref}
      id={id}
      className={cn(
        'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm outline-none transition placeholder:text-white/30 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
        error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
