import React from 'react';
import { GraduationCap, BookOpen, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageProps } from '../public/LandingPage';

export const CurriculumPage: React.FC<PageProps> = () => {
  const grades = [
    { code: 'ป.1', title: 'ประถมศึกษาปีที่ 1', units: '6 หน่วยการเรียนรู้', lessons: '24 บทเรียน' },
    { code: 'ป.2', title: 'ประถมศึกษาปีที่ 2', units: '7 หน่วยการเรียนรู้', lessons: '28 บทเรียน' },
    { code: 'ป.3', title: 'ประถมศึกษาปีที่ 3', units: '8 หน่วยการเรียนรู้', lessons: '32 บทเรียน' },
    { code: 'ป.4', title: 'ประถมศึกษาปีที่ 4', units: '8 หน่วยการเรียนรู้', lessons: '35 บทเรียน' },
    { code: 'ป.5', title: 'ประถมศึกษาปีที่ 5', units: '9 หน่วยการเรียนรู้', lessons: '40 บทเรียน' },
    { code: 'ป.6', title: 'ประถมศึกษาปีที่ 6', units: '9 หน่วยการเรียนรู้', lessons: '42 บทเรียน' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-pastel-mint-600" />
          <span>โครงสร้างหลักสูตรคณิตศาสตร์ (ป.1 - ป.6)</span>
        </h1>
        <p className="text-xs text-slate-500">ตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พุทธศักราช 2551 (ฉบับปรับปรุง 2560)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {grades.map((grade, idx) => (
          <Card key={idx} hoverable className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pastel-mint-100 text-pastel-mint-700 flex items-center justify-center font-black text-lg shadow-pastel-sm">
                {grade.code}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base">{grade.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{grade.units}</span>
                  <span>•</span>
                  <span>{grade.lessons}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Card>
        ))}
      </div>
    </div>
  );
};
