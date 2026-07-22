import { cn } from '../../utils';

export default function Card({ className, children, ...props }) {
  return (
    <div className={cn('rounded-xl bg-white p-5 shadow-sm border border-slate-200', className)} {...props}>
      {children}
    </div>
  );
}
