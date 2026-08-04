import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'mint' | 'sky' | 'yellow' | 'peach' | 'coral' | 'lavender' | 'neutral' | 'purple' | 'orange' | 'pink';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'mint',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const variantStyles = {
    mint: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
    sky: 'bg-sky-50 text-sky-800 border-sky-200 font-bold',
    yellow: 'bg-amber-50 text-amber-900 border-amber-200 font-bold',
    peach: 'bg-orange-50 text-orange-950 border-orange-200 font-bold',
    orange: 'bg-orange-50 text-orange-950 border-orange-200 font-bold',
    coral: 'bg-rose-50 text-rose-950 border-rose-200 font-bold',
    pink: 'bg-rose-50 text-rose-950 border-rose-200 font-bold',
    purple: 'bg-purple-50 text-purple-950 border-purple-200 font-bold',
    lavender: 'bg-slate-50 text-slate-800 border-slate-200 font-bold',
    neutral: 'bg-slate-50 text-slate-800 border-slate-200 font-bold',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
