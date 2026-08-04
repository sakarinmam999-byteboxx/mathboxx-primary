import React from 'react';
import { Settings, Lock, Save, LogOut, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageProps } from '../public/LandingPage';

export const AccountSettingsPage: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>การตั้งค่าบัญชี (Account Settings)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">จัดการความปลอดภัย การเชื่อมต่อ Google Sign-in และการเข้าสู่ระบบ</p>
      </div>

      {/* Google Sign-in & Authentication status */}
      <Card className="p-6 space-y-4 shadow-sm border-slate-200/90">
        <h3 className="font-bold text-slate-900 text-base border-b pb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>การเชื่อมต่อบัญชี & การเข้าสู่ระบบ</span>
        </h3>
        
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-2xs">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900">Google Sign-in</p>
                <Badge variant="mint" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>เชื่อมต่อแล้ว</Badge>
              </div>
              <p className="text-xs text-slate-500">teacher.somchai@mathboxx.com</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Password Management */}
      <Card className="p-8 space-y-6 shadow-sm border-slate-200/90">
        <h3 className="font-bold text-slate-900 text-base border-b pb-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-600" />
          <span>เปลี่ยนรหัสผ่าน (Change Password)</span>
        </h3>

        <form onSubmit={(e) => { e.preventDefault(); alert('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว'); }} className="space-y-4">
          <Input
            label="รหัสผ่านปัจจุบัน"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="รหัสผ่านใหม่"
            type="password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="ยืนยันรหัสผ่านใหม่"
            type="password"
            placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="pt-4 flex justify-end">
            <Button variant="primary" size="lg" leftIcon={<Save className="w-4 h-4" />}>
              บันทึกรหัสผ่านใหม่
            </Button>
          </div>
        </form>
      </Card>

      {/* Logout Action */}
      <Card className="p-6 flex items-center justify-between border-rose-100 bg-rose-50/40">
        <div>
          <h4 className="font-bold text-rose-900 text-sm">ออกจากระบบ</h4>
          <p className="text-xs text-rose-700/80">ออกจากเซสชันการใช้งาน MathBoxx Primary บนอุปกรณ์นี้</p>
        </div>
        <Button
          variant="outline"
          className="border-rose-200 text-rose-700 hover:bg-rose-100/60"
          leftIcon={<LogOut className="w-4 h-4" />}
          onClick={() => onNavigate('/login')}
        >
          ออกจากระบบ
        </Button>
      </Card>
    </div>
  );
};

