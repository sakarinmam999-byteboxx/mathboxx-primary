import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Crown,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
} from 'lucide-react';

export interface AdminSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentPath, onNavigate }) => {
  const menuItems = [
    { path: '/admin', label: 'ภาพรวมระบบ', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/admin/users', label: 'ผู้ใช้งาน', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/payments', label: 'การชำระเงิน', icon: <CreditCard className="w-5 h-5" /> },
    { path: '/admin/question-bank', label: 'คลังข้อสอบ', icon: <BookOpen className="w-5 h-5" /> },
    { path: '/admin/usage-stats', label: 'สถิติการใช้งาน', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-4 space-y-4">
      <div className="px-3 py-2 border-b border-slate-800">
        <p className="text-xs font-bold uppercase tracking-wider text-pastel-coral-300">
          Admin Control Center
        </p>
      </div>

      <div className="space-y-1">
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-pastel-coral-400 text-white shadow-pastel-sm font-bold'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
