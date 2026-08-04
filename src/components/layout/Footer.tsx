import React from 'react';
import { BookOpen, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-pastel-warm-border py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pastel-mint-100 text-pastel-mint-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">MathBoxx Primary</p>
              <p className="text-xs text-slate-500">ระบบสร้างและพิมพ์ใบงานคณิตศาสตร์สำหรับครูประถมศึกษา</p>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
            สร้างด้วย <Heart className="w-3.5 h-3.5 text-pastel-coral-300 fill-pastel-coral-300 inline" /> เพื่อคุณครูคณิตศาสตร์ไทยทั่วประเทศ
          </div>

          <div className="text-xs text-slate-400">
            © 2026 MathBoxx Primary. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
