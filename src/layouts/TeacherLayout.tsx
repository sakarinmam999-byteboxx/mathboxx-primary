import React, { useState } from 'react';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { Sidebar } from '../components/layout/Sidebar';
import { useUserContext } from '../hooks/useUserContext';

export interface TeacherLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const TeacherLayout: React.FC<TeacherLayoutProps> = ({ currentPath, onNavigate, children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const userCtx = useUserContext();

  const isUrgent = userCtx.daysRemaining !== null && userCtx.daysRemaining <= 3;
  const isExpired = userCtx.daysRemaining !== null && userCtx.daysRemaining <= 0;

  return (
    <div className="min-h-screen flex flex-col bg-pastel-warm-white">
      <AppHeader
        userRole={userCtx.role}
        teacherName={userCtx.isLoading ? '—' : userCtx.teacherName}
        schoolName={userCtx.isLoading ? '—' : userCtx.schoolName}
        planCode={userCtx.isLoading ? undefined : userCtx.planCode}
        currentPath={currentPath}
        onNavigate={onNavigate}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Subscription Expiration Warning Banner (User Side) */}
      {userCtx.expiryWarningMessage && (
        <div
          className={`px-4 py-2.5 flex items-center justify-between text-xs font-bold transition-all border-b ${
            isExpired
              ? 'bg-rose-600 text-white border-rose-700'
              : isUrgent
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-amber-100 text-amber-900 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              {isUrgent ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Clock className="w-4 h-4 shrink-0" />}
              <span>
                {userCtx.expiryWarningMessage}
                {userCtx.formattedEndDate && ` (หมดอายุวันที่ ${userCtx.formattedEndDate})`}
              </span>
            </div>

            <button
              onClick={() => onNavigate('/app/payment')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 shrink-0 transition-colors ${
                isUrgent || isExpired
                  ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-2xs'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              <span>{isExpired ? 'ต่ออายุทันที' : 'ต่ออายุแพ็กเกจ'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
        </div>

        {/* Mobile Drawer Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative z-10 w-64 bg-white">
              <Sidebar
                currentPath={currentPath}
                onNavigate={(path) => {
                  onNavigate(path);
                  setMobileSidebarOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
