import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', label = 'กำลังโหลดข้อมูล...' }) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div className={`relative ${sizeMap[size]}`}>
        <div className="absolute inset-0 rounded-full border-4 border-pastel-mint-100" />
        <div className="absolute inset-0 rounded-full border-4 border-pastel-mint-600 border-t-transparent animate-spin" />
      </div>
      {label && <p className="text-sm font-medium text-slate-500 animate-pulse">{label}</p>}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200/70 rounded-xl ${className}`} />
);
