import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/ui/Logo';
import { authService } from '../../services/auth.service';
import { PageProps } from './LandingPage';

export const ResetPasswordPage: React.FC<PageProps> = ({ onNavigate }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Parse recovery error parameters if link expired or invalid
    const hash = window.location.hash || '';
    const search = window.location.search || '';

    if (hash.includes('error=') || search.includes('error=')) {
      const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
      const searchParams = new URLSearchParams(search);
      const desc =
        hashParams.get('error_description') ||
        searchParams.get('error_description') ||
        'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่อีกครั้ง';
      setErrorMessage(decodeURIComponent(desc));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Password validation
    if (newPassword.length < 6) {
      setErrorMessage('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.updatePassword(newPassword);

      if (!result.success) {
        setErrorMessage(
          result.error || 'ไม่สามารถอัปเดตรหัสผ่านได้ ลิงก์รีเซ็ตรหัสผ่านอาจหมดอายุแล้ว'
        );
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      // Auto navigate to login after 3 seconds
      setTimeout(() => {
        onNavigate('/login');
      }, 3000);
    } catch (err: any) {
      setErrorMessage('เกิดข้อผิดพลาดที่ไม่คาดคิดในการอัปเดตรหัสผ่าน');
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">ตั้งรหัสผ่านใหม่</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-semibold">
            กรุณากำหนดรหัสผ่านใหม่สำหรับเข้าใช้งานระบบ MathBoxx Primary
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
              <h3 className="font-extrabold text-base text-slate-900">เปลี่ยนรหัสผ่านสำเร็จ!</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                รหัสผ่านใหม่ของคุณได้รับการอัปเดตเรียบร้อยแล้ว
                <br />
                <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                  กำลังนำท่านไปยังหน้าเข้าสู่ระบบอัตโนมัติใน 3 วินาที...
                </span>
              </p>
            </div>

            <Button
              variant="primary"
              className="w-full py-3 text-xs font-bold"
              onClick={() => onNavigate('/login')}
            >
              เข้าสู่ระบบด้วยรหัสผ่านใหม่
            </Button>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                label="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 p-1"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="ยืนยันรหัสผ่านใหม่"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-sm font-bold"
              isLoading={isLoading}
              leftIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            >
              บันทึกรหัสผ่านใหม่
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};
