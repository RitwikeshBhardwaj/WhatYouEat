import { cn } from '../../utils';

export default function Card({ className, children, ...props }) {
  return (
    <div className={cn('rounded-xl bg-surface-900/90 p-5 shadow-lg border border-white/10 backdrop-blur-sm', className)} {...props}>
      {children}
    </div>
  );
}
