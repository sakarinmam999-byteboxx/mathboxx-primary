import React from 'react';
import {
  Crown,
  School,
  LogOut,
  Menu,
  MessageCircle,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Logo } from '../ui/Logo';

export interface AppHeaderProps {
  userRole?: 'teacher' | 'admin';
  teacherName?: string;
  schoolName?: string;
  planCode?: 'free' | 'premium' | 'premium_pro';
  onNavigate?: (path: string) => void;
  onToggleSidebar?: () => void;
  currentPath?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userRole = 'teacher',
  teacherName = '—',
  schoolName = '—',
  planCode,
  onNavigate,
  onToggleSidebar,
  currentPath = '/app/profile',
}) => {
  const handleNav = (path: string) => {
    if (onNavigate) onNavigate(path);
  };

  const planBadge = planCode
    ? {
        free: { label: 'Free Plan', variant: 'mint' as const },
        premium: { label: 'Premium Teacher', variant: 'yellow' as const },
        premium_pro: { label: 'Premium Pro', variant: 'purple' as const },
      }[planCode]
    : { label: '—', variant: 'neutral' as const };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100/80 min-h-16 px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between py-2 gap-3 shadow-xs">
      {/* Left: Mobile Menu Toggle & Brand */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Logo
            size="sm"
            onClick={() => handleNav(userRole === 'admin' ? '/admin' : '/app/profile')}
          />
        </div>

        {/* Mobile School Name */}
        {schoolName && userRole === 'teacher' && (
          <div className="md:hidden flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 border border-amber-200/60 rounded-full text-[11px] font-semibold text-amber-900">
            <School className="w-3 h-3 text-amber-700" />
            <span className="truncate max-w-[130px]">{schoolName}</span>
          </div>
        )}
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-2.5">

        {/* Subscription Plan Badge */}
        {userRole === 'teacher' && (
          <div
            className="cursor-pointer"
            onClick={() => handleNav('/app/subscription')}
          >
            <Badge variant={planBadge.variant} icon={<Crown className="w-3.5 h-3.5" />}>
              {planBadge.label}
            </Badge>
          </div>
        )}

        {/* User Profile Info Pill */}
        <div
          className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-rose-50 cursor-pointer transition-colors border border-transparent hover:border-rose-200/60"
          onClick={() => handleNav(userRole === 'admin' ? '/admin/settings' : '/app/profile')}
        >
          <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            {teacherName ? teacherName.charAt(0) : 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">{teacherName}</p>
          </div>
        </div>

        {/* Contact Admin LINE OA Button */}
        <a
          href="https://lin.ee/pDK0KwT"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-2xs transition-colors shrink-0"
          title="ติดต่อ Admin ผ่าน LINE OA"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>ติดต่อ Admin</span>
        </a>

        {/* Logout Button (Direct Reference Alignment) */}
        <button
          onClick={() => handleNav('/login')}
          className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-2xs transition-colors shrink-0"
          title="ออกจากระบบ"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ออกจากระบบ</span>
        </button>
      </div>
    </header>
  );
};
