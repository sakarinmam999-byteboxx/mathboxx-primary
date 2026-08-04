import React from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { PageProps } from './LandingPage';

export const ForgotPasswordPage: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-md mx-auto py-8">
      <Card className="p-8 shadow-pastel-lg border-pastel-mint-200">
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-pastel-sky-100 text-pastel-sky-600 shadow-pastel-sm">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">ขอลิงก์ตั้งรหัสผ่านใหม่</h2>
          <p className="text-xs text-slate-500">กรอกอีเมลที่ใช้ลงทะเบียน ระบบจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้คุณ</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); alert('ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว'); onNavigate('/login'); }} className="space-y-4">
          <Input
            label="อีเมลที่ลงทะเบียน"
            type="email"
            placeholder="teacher@school.ac.th"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            leftIcon={<Send className="w-4 h-4" />}
          >
            ส่งลิงก์รีเซ็ตรหัสผ่าน
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-pastel-warm-border text-center">
          <button
            onClick={() => onNavigate('/login')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-semibold hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับไปหน้าเข้าสู่ระบบ</span>
          </button>
        </div>
      </Card>
    </div>
  );
};
