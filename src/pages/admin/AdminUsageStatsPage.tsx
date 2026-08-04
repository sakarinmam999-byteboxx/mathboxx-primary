import React from 'react';
import { BarChart3, Users, BookOpen, Files, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageProps } from '../public/LandingPage';

export const AdminUsageStatsPage: React.FC<PageProps> = () => {
  const userUsageData = [
    { name: 'คุณครู สมชาย ใจดี', email: 'somchai@school.ac.th', countWorksheets: 2, countQuestions: 20, avgQuestions: 10, lastActive: '01/08/2026 21:10' },
    { name: 'คุณครู สมศรี มีสุข', email: 'somsri@school.ac.th', countWorksheets: 14, countQuestions: 280, avgQuestions: 20, lastActive: '31/07/2026 18:45' },
  ];

  const lessonUsageData = [
    { grade: 'ป.4', lesson: 'OPNFD (การบวก ลบ คูณ หาร)', totalQuestions: 500, usedQuestions: 320, timesUsed: 48, usageRate: '64%' },
    { grade: 'ป.4', lesson: 'รูปเรขาคณิตและการวัด', totalQuestions: 120, usedQuestions: 15, timesUsed: 3, usageRate: '12.5%' },
    { grade: 'ป.5', lesson: 'เศษส่วนและการบวกเศษส่วน', totalQuestions: 80, usedQuestions: 40, timesUsed: 8, usageRate: '50%' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-pastel-coral-400" />
          <span>รายงานสถิติการใช้งานระบบ (Usage Analytics & Question Statistics)</span>
        </h1>
        <p className="text-xs text-slate-500">สถิติการสร้างใบงาน จำนวนข้อสอบที่ถูกใช้งาน อัตราการใช้งานแยกตามบทเรียน และสถิติตามครูผู้สอน</p>
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-pastel-mint-500">
          <span className="text-xs font-bold text-slate-500 uppercase">ข้อสอบที่ถูกใช้งานทั้งหมด</span>
          <p className="text-3xl font-black text-slate-900 mt-2">640 <span className="text-xs font-normal text-slate-400">ข้อ</span></p>
        </Card>
        <Card className="p-5 border-l-4 border-l-pastel-sky-500">
          <span className="text-xs font-bold text-slate-500 uppercase">เฉลี่ยข้อสอบ/ใบงาน</span>
          <p className="text-3xl font-black text-slate-900 mt-2">15 <span className="text-xs font-normal text-slate-400">ข้อ/ใบงาน</span></p>
        </Card>
        <Card className="p-5 border-l-4 border-l-pastel-coral-400">
          <span className="text-xs font-bold text-slate-500 uppercase">บทเรียนที่ถูกใช้มากที่สุด</span>
          <p className="text-xl font-black text-slate-900 mt-2">ป.4 — OPNFD</p>
        </Card>
      </div>

      {/* Section 1: User Usage Statistics */}
      <Card className="p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
          <Users className="w-4 h-4 text-emerald-600" />
          <span>สถิติการใช้ข้อสอบของครูผู้สอน (User Usage Breakdown)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b">
              <tr>
                <th className="p-3">ชื่อครู / อีเมล</th>
                <th className="p-3">จำนวนใบงานที่สร้าง</th>
                <th className="p-3">ใช้ข้อสอบทั้งหมด</th>
                <th className="p-3">เฉลี่ยข้อ/ใบงาน</th>
                <th className="p-3">ใช้งานล่าสุด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userUsageData.map((u, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-bold text-slate-800">
                    {u.name}
                    <p className="text-[11px] font-normal text-slate-500">{u.email}</p>
                  </td>
                  <td className="p-3 font-mono font-bold">{u.countWorksheets} ครั้ง</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">{u.countQuestions} ข้อ</td>
                  <td className="p-3 font-mono">{u.avgQuestions} ข้อ</td>
                  <td className="p-3 text-slate-500">{u.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 2: Lesson Statistics Table */}
      <Card className="p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>สถิติข้อสอบแต่ละบทเรียน (Lesson Performance & Usage Rate)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b">
              <tr>
                <th className="p-3">ระดับชั้น</th>
                <th className="p-3">บทเรียน</th>
                <th className="p-3 text-right">จำนวนข้อสอบทั้งหมด</th>
                <th className="p-3 text-right">จำนวนข้อสอบที่ถูกใช้</th>
                <th className="p-3 text-right">จำนวนครั้งที่ถูกใช้</th>
                <th className="p-3 text-right">อัตราการถูกใช้งาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessonUsageData.map((l, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-bold text-slate-800">{l.grade}</td>
                  <td className="p-3 font-medium text-slate-700">{l.lesson}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-800">{l.totalQuestions}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">{l.usedQuestions}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-800">{l.timesUsed} ครั้ง</td>
                  <td className="p-3 text-right font-mono">
                    <Badge variant={parseFloat(l.usageRate) > 40 ? 'mint' : 'neutral'}>
                      {l.usageRate}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

