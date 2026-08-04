import React from 'react';
import { GraduationCap, Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageProps } from '../public/LandingPage';

export const AdminCurriculumPage: React.FC<PageProps> = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-pastel-coral-400" />
            <span>จัดการหลักสูตร (Curriculum Hierarchy CRUD)</span>
          </h1>
          <p className="text-xs text-slate-500">จัดการข้อมูล Subject {"->"} Grade (ป.1 - ป.6) {"->"} Unit {"->"} Lesson</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          เพิ่มหน่วยการเรียนรู้
        </Button>
      </div>

      <Card className="p-6">
        <p className="text-xs text-slate-500">ส่วนจัดการหลักสูตร ป.1 ถึง ป.6 (Subject: MATH_PRIMARY)</p>
      </Card>
    </div>
  );
};
