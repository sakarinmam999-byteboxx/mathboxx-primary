import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/ui/Logo';
import { authService } from '../../services/auth.service';
import { PageProps } from './LandingPage';

export const LoginPage: React.FC<PageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await authService.signInWithEmail(email, password);

      if (!result.success) {
        setErrorMessage(result.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        setIsLoading(false);
        return;
      }

      // Check user role for redirection
      const userRole = result.profile?.role;

      if (userRole === 'admin') {
        onNavigate('/admin');
      } else {
        onNavigate('/app/profile');
      }
    } catch (err: any) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Card className="p-8 shadow-sm border border-amber-100/90 bg-white">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex justify-center">
            <Logo size="lg" showText={false} onClick={() => onNavigate('/')} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">เข้าสู่ระบบ MathBoxx Primary</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-semibold">
            ระบบสร้างและจัดการใบงานคณิตศาสตร์ประถมศึกษา สำหรับครูมืออาชีพ
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="อีเมล"
            type="email"
            placeholder="teacher@school.ac.th"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="รหัสผ่าน"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-600">
              <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-400 w-4 h-4" />
              <span>จดจำฉันในระบบ</span>
            </label>
            <button type="button" onClick={() => onNavigate('/forgot-password')} className="text-orange-600 font-bold hover:underline">
              ลืมรหัสผ่าน?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            size="lg"
            isLoading={isLoading}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            เข้าสู่ระบบ
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-amber-100/60 text-center text-xs text-slate-500 font-semibold">
          ยังไม่มีบัญชีผู้ใช้งาน?{' '}
          <button
            onClick={() => onNavigate('/register')}
            className="font-bold text-orange-600 hover:underline inline-flex items-center gap-1"
          >
            สมัครสมาชิกฟรี
          </button>
        </div>
      </Card>
    </div>
  );
};
