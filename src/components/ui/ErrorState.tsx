import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
  message = 'ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาลองใหม่อีกครั้ง',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-pastel-coral-50 border border-pastel-coral-200 my-4 space-y-3">
      <div className="p-3 rounded-full bg-white text-pastel-coral-400 shadow-pastel-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-bold text-slate-800">{title}</h4>
        <p className="text-sm text-slate-600 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button variant="danger" size="sm" onClick={onRetry}>
            ลองใหม่อีกครั้ง
          </Button>
        </div>
      )}
    </div>
  );
};
