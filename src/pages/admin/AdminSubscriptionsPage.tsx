import React from 'react';
import { Crown, Edit } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageProps } from '../public/LandingPage';

export const AdminSubscriptionsPage: React.FC<PageProps> = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Crown className="w-6 h-6 text-pastel-coral-400" />
          <span>จัดการ Subscription Plans (DB-Driven Limits)</span>
        </h1>
        <p className="text-xs text-slate-500">กำหนดราคา โควตาการสร้างใบงาน ขีดจำกัดข้อสอบ และสิทธิ์ Custom Branding ในฐานข้อมูล</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3 border-2 border-slate-200">
          <Badge variant="neutral">Free Plan</Badge>
          <p className="text-2xl font-black">฿0 / เดือน</p>
          <div className="text-xs text-slate-600 space-y-1">
            <p>• Max Worksheets: 5/เดือน</p>
            <p>• Max Questions: 10 ข้อ/ใบงาน</p>
            <p>• Custom Logo: ไม่ได้</p>
          </div>
          <Button variant="outline" size="sm" className="w-full" leftIcon={<Edit className="w-3.5 h-3.5" />}>แก้ไข Limits</Button>
        </Card>

        <Card className="p-6 space-y-3 border-2 border-pastel-mint-400">
          <Badge variant="mint">Premium Plan</Badge>
          <p className="text-2xl font-black">฿199 / เดือน</p>
          <div className="text-xs text-slate-600 space-y-1">
            <p>• Max Worksheets: 50/เดือน</p>
            <p>• Max Questions: 30 ข้อ/ใบงาน</p>
            <p>• Custom Logo: ได้</p>
          </div>
          <Button variant="primary" size="sm" className="w-full" leftIcon={<Edit className="w-3.5 h-3.5" />}>แก้ไข Limits</Button>
        </Card>

        <Card className="p-6 space-y-3 border-2 border-pastel-lavender-300">
          <Badge variant="lavender">Premium Pro</Badge>
          <p className="text-2xl font-black">฿399 / เดือน</p>
          <div className="text-xs text-slate-600 space-y-1">
            <p>• Max Worksheets: 100/เดือน</p>
            <p>• Max Questions: 50 ข้อ/ใบงาน</p>
            <p>• Custom Logo: ได้</p>
          </div>
          <Button variant="outline" size="sm" className="w-full" leftIcon={<Edit className="w-3.5 h-3.5" />}>แก้ไข Limits</Button>
        </Card>
      </div>
    </div>
  );
};
