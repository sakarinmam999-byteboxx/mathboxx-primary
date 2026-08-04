import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'mint' | 'sky' | 'peach' | 'lavender' | 'pink' | 'yellow' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variantStyles = {
    // 1. Pastel Orange (Action / Primary CTA "สร้างใบงาน")
    primary: "bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-xs focus-visible:ring-orange-400",
    
    // 2. Pastel Mint Green (Home / Status / Success / Free Plan)
    mint: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs focus-visible:ring-emerald-400",

    // 3. Pastel Blue (History / Information)
    sky: "bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white shadow-xs focus-visible:ring-sky-400",

    // 4. Pastel Pink (Profile)
    pink: "bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white shadow-xs focus-visible:ring-rose-400",

    // 5. Pastel Yellow (Tools / Settings / Premium)
    yellow: "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-xs focus-visible:ring-amber-400",

    // 6. Pastel Purple (Premium Pro Only)
    purple: "bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-xs focus-visible:ring-purple-400",

    secondary: "bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/60 focus-visible:ring-slate-400",
    outline: "border border-slate-200 hover:border-emerald-300 bg-white text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-950 focus-visible:ring-emerald-400",
    ghost: "bg-transparent hover:bg-slate-100/80 text-slate-700 hover:text-slate-950 focus-visible:ring-slate-400",
    danger: "bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200/80 focus-visible:ring-rose-400 font-bold",
    peach: "bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200/80 focus-visible:ring-orange-400 font-bold",
    lavender: "bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 focus-visible:ring-purple-400 font-bold",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5 shadow-2xs",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-sm sm:text-base gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
