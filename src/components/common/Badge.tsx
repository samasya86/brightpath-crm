import React from 'react';

export type BadgeVariant = 
  | 'default'
  | 'blue' 
  | 'green' 
  | 'amber' 
  | 'rose' 
  | 'purple' 
  | 'slate';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor: string }> = {
    default: { bg: 'bg-slate-100', text: 'text-slate-700', dotColor: 'bg-slate-500' },
    blue: { bg: 'bg-blue-50 border border-blue-200/60', text: 'text-blue-700', dotColor: 'bg-blue-500' },
    green: { bg: 'bg-emerald-50 border border-emerald-200/60', text: 'text-emerald-700', dotColor: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50 border border-amber-200/60', text: 'text-amber-700', dotColor: 'bg-amber-500' },
    rose: { bg: 'bg-rose-50 border border-rose-200/60', text: 'text-rose-700', dotColor: 'bg-rose-500' },
    purple: { bg: 'bg-purple-50 border border-purple-200/60', text: 'text-purple-700', dotColor: 'bg-purple-500' },
    slate: { bg: 'bg-slate-100 border border-slate-200', text: 'text-slate-600', dotColor: 'bg-slate-400' },
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const selected = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeStyles[size]} ${selected.bg} ${selected.text} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 mr-1.5 rounded-full ${selected.dotColor}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
