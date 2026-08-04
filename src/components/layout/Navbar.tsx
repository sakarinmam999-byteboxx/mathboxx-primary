import React from 'react';
import { User, LogIn } from 'lucide-react';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

export interface NavbarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath = '/', onNavigate }) => {
  const handleNav = (path: string) => {
    if (onNavigate) onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Official Brand Logo */}
        <Logo
          size="md"
          onClick={() => handleNav('/')}
        />

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => handleNav('/')}
            className={`text-sm font-bold transition-colors ${
              currentPath === '/' ? 'text-orange-600 font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            หน้าแรก
          </button>
          <button
            onClick={() => handleNav('/pricing')}
            className={`text-sm font-bold transition-colors ${
              currentPath === '/pricing' ? 'text-orange-600 font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            แพ็กเกจราคา
          </button>
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<LogIn className="w-4 h-4" />}
            onClick={() => handleNav('/login')}
          >
            เข้าสู่ระบบ
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<User className="w-4 h-4" />}
            onClick={() => handleNav('/register')}
          >
            สมัครสมาชิกฟรี
          </Button>
        </div>
      </div>
    </header>
  );
};
