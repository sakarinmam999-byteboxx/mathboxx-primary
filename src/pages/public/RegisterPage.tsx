import React, { useState } from 'react';
import { User, Mail, Lock, School, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/ui/Logo';
import { authService } from '../../services/auth.service';
import { PageProps } from './LandingPage';

export const RegisterPage: React.FC<PageProps> = ({ onNavigate }) => {
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Form Client Validations
    if (!teacherName.trim()) {
      setErrorMessage('กรุณากรอกชื่อ - นามสกุลครูผู้สอน');
      return;
    }
    if (!schoolName.trim()) {
      setErrorMessage('กรุณากรอกชื่อโรงเรียน');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.signUpTeacher({
        email,
        password,
        teacherName,
        schoolName,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี ก่อนเข้าสู่ระบบ');
      setIsLoading(false);

      // Redirect user to login page after 2.5 seconds
      setTimeout(() => {
        onNavigate('/login');
      }, 2500);
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">ลงทะเบียนสมาชิกครูผู้สอน</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-semibold">
            สมัครสมาชิกเพื่อเริ่มใช้งานระบบสร้างและพิมพ์ใบงานฟรีทันที
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ชื่อ - นามสกุลครูผู้สอน"
            placeholder="เช่น คุณครูสมชาย ใจดี"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="ชื่อโรงเรียน"
            placeholder="เช่น โรงเรียนอนุบาลประถมศึกษา"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            leftIcon={<School className="w-4 h-4" />}
            required
          />

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
            label="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            size="lg"
            isLoading={isLoading}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            ยืนยันสมัครสมาชิกฟรี
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-amber-100/60 text-center text-xs text-slate-500 font-semibold">
          มีบัญชีผู้ใช้งานแล้ว?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="font-bold text-orange-600 hover:underline inline-flex items-center gap-1"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </Card>
    </div>
  );
};
