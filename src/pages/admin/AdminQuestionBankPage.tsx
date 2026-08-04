import React, { useState } from 'react';
import { BookOpen, Plus, Search, AlertTriangle, CheckCircle2, Filter, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { PageProps } from '../public/LandingPage';

export const AdminQuestionBankPage: React.FC<PageProps> = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const stockAlerts = [
    { grade: 'ป.4', lesson: 'OPNFD (การบวก ลบ คูณ หาร)', difficulty: 'Easy', type: 'CALCULATION', count: 500, status: 'sufficient' },
    { grade: 'ป.4', lesson: 'OPNFD (การบวก ลบ คูณ หาร)', difficulty: 'Hard', type: 'PROBLEM_SOLVING', count: 12, status: 'low' },
    { grade: 'ป.5', lesson: 'เศษส่วนและการบวกเศษส่วน', difficulty: 'Medium', type: 'NUMBER_CONCEPT', count: 8, status: 'low' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-pastel-coral-400" />
            <span>คลังข้อสอบ & ตรวจสอบคุณภาพข้อสอบ (Question Bank Quality Audit)</span>
          </h1>
          <p className="text-xs text-slate-500">ตรวจสอบความพร้อมของข้อสอบ แยกสถานะ Draft / Active / Review และวิเคราะห์บทเรียนที่ควรเติมข้อสอบ</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          เพิ่มข้อสอบใหม่
        </Button>
      </div>

      {/* Quality Audit Alerts Section */}
      <Card className="p-6 space-y-4 border-l-4 border-l-amber-500 bg-amber-50/30">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
          <h3 className="font-extrabold text-amber-900 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>รายงานวิเคราะห์ปริมาณข้อสอบ & บทเรียนที่ควรเติมข้อสอบ (Content Gap Analysis)</span>
          </h3>
          <Badge variant="coral">2 บทเรียนขาดแคลน</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stockAlerts.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                item.status === 'sufficient'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-white border-rose-200 text-slate-800 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{item.grade} — {item.lesson}</span>
                {item.status === 'sufficient' ? (
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">เพียงพอ</span>
                ) : (
                  <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">ควรเติมข้อสอบ</span>
                )}
              </div>
              <p className="text-slate-600">ระดับ: <span className="font-semibold">{item.difficulty}</span> • ประเภท: <span className="font-semibold">{item.type}</span></p>
              <p className="font-extrabold text-sm">
                จำนวน: {item.count} ข้อ {item.status === 'low' && <span className="text-rose-600 text-xs font-semibold">(น้อยกว่า 20 ข้อ)</span>}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Filter Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <Input placeholder="ค้นหาข้อสอบตามโจทย์ บทเรียน หรือรหัส..." leftIcon={<Search className="w-4 h-4" />} />
        </div>
        <div className="w-full md:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'ทุกสถานะ (All)' },
              { value: 'draft', label: 'Draft (ร่าง)' },
              { value: 'active', label: 'Active (เปิดใช้)' },
              { value: 'pending', label: 'Pending Review' },
            ]}
          />
        </div>
      </Card>

      {/* Question Table View */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b">
              <tr>
                <th className="p-3">รหัสข้อสอบ</th>
                <th className="p-3">ระดับชั้น</th>
                <th className="p-3">บทเรียน</th>
                <th className="p-3">ความยาก</th>
                <th className="p-3">ประเภท</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-mono font-bold text-slate-800">MATH-P4-OPNFD-001</td>
                <td className="p-3 font-semibold">ป.4 (P4)</td>
                <td className="p-3">OPNFD (การบวก ลบ คูณ หาร)</td>
                <td className="p-3"><Badge variant="sky">Easy</Badge></td>
                <td className="p-3">CALCULATION</td>
                <td className="p-3"><Badge variant="neutral">Draft</Badge></td>
                <td className="p-3 text-right space-x-2">
                  <Button variant="ghost" size="sm">ดูโจทย์</Button>
                  <Button variant="outline" size="sm">แก้ไข</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

