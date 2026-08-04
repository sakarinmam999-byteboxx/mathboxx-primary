import React, { useState } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { AdminSidebar } from '../components/layout/AdminSidebar';

export interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, onNavigate, children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <AppHeader
        userRole="admin"
        teacherName="Admin User"
        onNavigate={onNavigate}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Admin Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar currentPath={currentPath} onNavigate={onNavigate} />
        </div>

        {/* Mobile Drawer Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative z-10 w-64 bg-slate-900">
              <AdminSidebar
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
