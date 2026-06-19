import { HTMLAttributes, forwardRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  removable?: boolean;
  onRemove?: () => void;
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant = 'default', removable, onRemove, children, ...props }, ref) => {
    const variants = {
      default: 'bg-dark-100 text-dark-700',
      primary: 'bg-brand-50 text-brand-700',
      success: 'bg-success-50 text-success-700',
      warning: 'bg-warning-50 text-warning-700',
      danger: 'bg-danger-50 text-danger-700',
    };
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 hover:opacity-70 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </span>
    );
  }
);

Tag.displayName = 'Tag';
