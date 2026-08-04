import React from 'react';
import {
  User,
  FilePlus,
  Files,
  Settings,
} from 'lucide-react';

export interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const menuItems = [
    {
      path: '/app/profile',
      label: 'ข้อมูลผู้ใช้งาน',
      icon: <User className="w-4 h-4" />,
      colorType: 'pink',
    },
    {
      path: '/app/builder',
      label: 'สร้างใบงาน',
      icon: <FilePlus className="w-4 h-4" />,
      colorType: 'orange',
      highlight: true,
    },
    {
      path: '/app/worksheets',
      label: 'ใบงานของฉัน',
      icon: <Files className="w-4 h-4" />,
      colorType: 'blue',
    },
    {
      path: '/app/settings',
      label: 'การตั้งค่าบัญชี',
      icon: <Settings className="w-4 h-4" />,
      colorType: 'yellow',
    },
  ];

  return (
    <aside className="w-64 bg-white/90 backdrop-blur-md border-r border-amber-100/60 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-4 space-y-4 shadow-2xs">
      <div className="px-3 text-[11px] font-extrabold tracking-wider text-amber-900/50 uppercase">
        เมนูหลัก (Main Navigation)
      </div>
      <div className="space-y-1.5">
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;

          // Feature Color Styles Mapping by Theme Spec
          let buttonStyles = '';

          if (item.colorType === 'orange') {
            // Action / Builder: Pastel Orange
            buttonStyles = isActive
              ? 'bg-orange-500 text-white shadow-xs font-extrabold'
              : 'bg-orange-50/70 text-orange-950 hover:bg-orange-100/80 hover:text-orange-950 border border-orange-200/60 font-bold';
          } else if (item.colorType === 'pink') {
            // Profile: Pastel Pink
            buttonStyles = isActive
              ? 'bg-rose-500 text-white shadow-xs font-extrabold'
              : 'bg-rose-50/60 text-slate-700 hover:bg-rose-100/70 hover:text-rose-950 border border-rose-200/50 font-semibold';
          } else if (item.colorType === 'blue') {
            // History: Pastel Blue
            buttonStyles = isActive
              ? 'bg-sky-500 text-white shadow-xs font-extrabold'
              : 'bg-sky-50/60 text-slate-700 hover:bg-sky-100/70 hover:text-sky-950 border border-sky-200/50 font-semibold';
          } else if (item.colorType === 'yellow') {
            // Settings/Tools: Pastel Yellow
            buttonStyles = isActive
              ? 'bg-amber-500 text-white shadow-xs font-extrabold'
              : 'bg-amber-50/60 text-slate-700 hover:bg-amber-100/70 hover:text-amber-950 border border-amber-200/50 font-semibold';
          }

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 active:scale-[0.985] ${buttonStyles}`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
