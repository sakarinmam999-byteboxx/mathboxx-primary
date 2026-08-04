import React from 'react';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  onClick,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Official MathBoxx 3D Vector Logo */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconDimensions[size]} shrink-0 transition-transform duration-200 group-hover:scale-105`}
      >
        {/* Floating Math Symbols Top */}
        {/* Multiply Symbol (Blue) */}
        <path d="M35 24 L43 32 M43 24 L35 32" stroke="#0052CC" strokeWidth="4.5" strokeLinecap="round" />
        
        {/* Divide Symbol (Yellow) */}
        <circle cx="51" cy="18" r="2.2" fill="#FFC700" />
        <line x1="45" y1="24" x2="57" y2="24" stroke="#FFC700" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="51" cy="30" r="2.2" fill="#FFC700" />

        {/* Equals Symbol (Blue) */}
        <line x1="60" y1="27" x2="68" y2="27" stroke="#0052CC" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="60" y1="32" x2="68" y2="32" stroke="#0052CC" strokeWidth="3.5" strokeLinecap="round" />

        {/* Open Yellow Box Top Interior */}
        <polygon points="50,34 71,40 50,47 29,40" fill="#FFC700" />
        <polygon points="50,34 50,47 29,40" fill="#F59E0B" />
        <polygon points="50,34 50,47 71,40" fill="#D97706" />

        {/* Box Panels Container */}
        {/* Left Blue Panel with Plus (+) */}
        <path
          d="M29 41 L49 48 L49 67 L29 59 Z"
          fill="#003896"
          stroke="#002D7A"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        {/* Plus Symbol (+) */}
        <path d="M35 53.5 H43 M39 49.5 V57.5" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />

        {/* Right Blue Panel with Minus (-) */}
        <path
          d="M51 48 L71 41 L71 59 L51 67 Z"
          fill="#0047BA"
          stroke="#002D7A"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        {/* Minus Symbol (-) */}
        <path d="M57 54 H65" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
      </svg>

      {/* Official Typography: Mathboxx Primary */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-tight ${titleSizes[size]}`}>
            <span className="text-[#002466]">Math</span>
            <span className="text-[#0052CC]">boxx</span>
            <span className="text-orange-500 font-extrabold text-[0.72em] ml-1 tracking-normal">Primary</span>
          </span>
          <span className="text-[9px] text-slate-500 font-bold tracking-normal mt-0.5">
            ระบบสร้างใบงานคณิตศาสตร์ (ป.1 - ป.6)
          </span>
        </div>
      )}
    </div>
  );
};
