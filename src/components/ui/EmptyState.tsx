import React from 'react';
import { FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderOpen className="w-12 h-12 text-pastel-mint-500" />,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-white border border-dashed border-pastel-warm-border my-4 space-y-4">
      <div className="p-4 rounded-full bg-pastel-mint-50 border border-pastel-mint-100 shadow-pastel-sm">
        {icon}
      </div>
      <div className="max-w-sm space-y-1">
        <h4 className="text-base font-bold text-slate-800 tracking-tight">{title}</h4>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
