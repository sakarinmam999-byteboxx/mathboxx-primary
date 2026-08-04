import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/ui/Logo';
import { authService } from '../../services/auth.service';
import { PageProps } from './LandingPage';

export const ForgotPasswordPage: React.FC<PageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const result = await authService.resetPasswordForEmail(email, redirectUrl);

      if (!result.success) {
        setErrorMessage(result.error || 'เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ตรหัสผ่าน');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Card className="p-8 shadow-sm border border-amber-100/90 bg-white">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex justify-center mb-1">
            <Logo size="lg" showText={false} onClick={() => onNavigate('/')} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">ลืมรหัสผ่านใช่ไหม?</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-semibold">
            กรอกอีเมลที่คุณใช้สมัครสมาชิก ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังกล่องข้อความของคุณ
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success State */}
        {isSuccess ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-base text-slate-900">ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว!</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                ระบบได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมล <span className="font-bold text-slate-900">{email}</span> เรียบร้อยแล้ว
                <br />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  (กรุณาตรวจสอบใน Inbox หรือโฟลเดอร์ จดหมายขยะ/Spam)
                </span>
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
              >
                ระบุอีเมลอื่นเพื่อส่งใหม่
              </Button>

              <Button
                variant="ghost"
                className="w-full text-xs text-slate-600"
                onClick={() => onNavigate('/login')}
              >
                กลับไปหน้าเข้าสู่ระบบ
              </Button>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="อีเมลที่ลงทะเบียน (Email Address)"
              type="email"
              placeholder="teacher@school.ac.th"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-sm font-bold"
              isLoading={isLoading}
              leftIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            >
              ส่งลิงก์รีเซ็ตรหัสผ่าน
            </Button>
          </form>
        )}

        <div className="mt-8 pt-5 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-bold hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับไปหน้าเข้าสู่ระบบ</span>
          </button>
        </div>
      </Card>
    </div>
  );
};
