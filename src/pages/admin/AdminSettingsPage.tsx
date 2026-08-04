import React from 'react';
import { Settings, Save, Building } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageProps } from '../public/LandingPage';

export const AdminSettingsPage: React.FC<PageProps> = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-pastel-coral-400" />
          <span>ตั้งค่าระบบกลาง (System Settings)</span>
        </h1>
        <p className="text-xs text-slate-500">จัดการข้อมูลบัญชีธนาคารสำหรับโอนเงิน คอนฟิกกลางของแพลตฟอร์ม</p>
      </div>

      <Card className="p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Building className="w-4 h-4 text-pastel-sky-600" />
          <span>บัญชีธนาคารสำหรับรับชำระเงิน</span>
        </h3>
        <Input label="ชื่อธนาคาร" defaultValue="ธนาคารกสิกรไทย (KBANK)" />
        <Input label="ชื่อบัญชี" defaultValue="บจก. ไบท์บ็อกซ์ โซลูชั่น" />
        <Input label="เลขที่บัญชี" defaultValue="123-4-56789-0" />
        <div className="pt-2 flex justify-end">
          <Button variant="primary" leftIcon={<Save className="w-4 h-4" />}>
            บันทึกการตั้งค่า
          </Button>
        </div>
      </Card>
    </div>
  );
};
