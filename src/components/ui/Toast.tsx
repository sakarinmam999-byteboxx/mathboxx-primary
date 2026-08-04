import React from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type = 'success', title, message, onClose }) => {
  const typeConfig = {
    success: {
      bg: 'bg-pastel-mint-50 border-pastel-mint-200 text-pastel-mint-700',
      icon: <CheckCircle2 className="w-5 h-5 text-pastel-mint-600 shrink-0" />,
    },
    error: {
      bg: 'bg-pastel-coral-50 border-pastel-coral-200 text-pastel-coral-400',
      icon: <XCircle className="w-5 h-5 text-pastel-coral-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-pastel-yellow-50 border-pastel-yellow-200 text-pastel-yellow-500',
      icon: <AlertCircle className="w-5 h-5 text-pastel-yellow-400 shrink-0" />,
    },
    info: {
      bg: 'bg-pastel-sky-50 border-pastel-sky-200 text-pastel-sky-600',
      icon: <Info className="w-5 h-5 text-pastel-sky-500 shrink-0" />,
    },
  };

  const config = typeConfig[type];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border shadow-pastel-md ${config.bg} max-w-md w-full`}>
      {config.icon}
      <div className="flex-1">
        <h4 className="text-sm font-bold">{title}</h4>
        {message && <p className="text-xs opacity-90 mt-0.5">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity p-0.5">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
