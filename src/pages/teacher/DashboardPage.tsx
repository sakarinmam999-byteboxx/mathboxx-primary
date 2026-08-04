import React from 'react';
import { FilePlus, Files, Crown, Sparkles, Printer, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageProps } from '../public/LandingPage';

export const DashboardPage: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-700/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-emerald-100 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ยินดีต้อนรับคุณครู</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">คุณครู สมชาย ใจดี</h1>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            โรงเรียนอนุบาลประถมศึกษาวิทยา • พร้อมสร้างใบงานคณิตศาสตร์ ป.1 - ป.6 วันนี้
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 z-10">
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-emerald-800 hover:bg-emerald-50 shadow-md font-bold whitespace-nowrap"
            leftIcon={<FilePlus className="w-5 h-5 text-emerald-600" />}
            onClick={() => onNavigate('/app/builder')}
          >
            สร้างใบงาน
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-emerald-800/40 hover:bg-emerald-800/60 text-white border-white/20 font-bold whitespace-nowrap"
            leftIcon={<BookOpen className="w-5 h-5 text-emerald-200" />}
            onClick={() => onNavigate('/app/question-bank')}
          >
            คลังข้อสอบ
          </Button>
        </div>
      </div>

      {/* Quota Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border border-slate-200/80 hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">โควตาใบงานเดือนนี้</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Files className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900">2 <span className="text-sm text-slate-400 font-medium">/ 5 ใบงาน</span></p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-600 h-full w-[40%] rounded-full" />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">ใช้ไป 2 ใบงาน คงเหลือ 3 ใบงาน</p>
          </div>
        </Card>

        <Card className="border border-slate-200/80 hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">การดาวน์โหลด PDF</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
              <Printer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900">4 <span className="text-sm text-slate-400 font-medium">ครั้ง</span></p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-3.5">พิมพ์ผ่านเบราว์เซอร์ไม่จำกัด (0 Quota)</p>
          </div>
        </Card>

        <Card className="border border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">สถานะแพ็กเกจ</span>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/60">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-slate-900">Free Plan</span>
              <Badge variant="neutral">ฟรี</Badge>
            </div>
            <button
              onClick={() => onNavigate('/app/subscription')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline mt-3.5 inline-flex items-center gap-1.5"
            >
              <span>อัปเกรดเป็น Premium</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Worksheets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">ใบงานล่าสุดที่สร้างไว้</h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('/app/worksheets')}>
            ดูทั้งหมด
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card hoverable onClick={() => onNavigate('/app/worksheets')} className="flex items-center justify-between p-5 border-slate-200/80">
            <div className="space-y-1.5">
              <Badge variant="mint" size="sm">ประถมศึกษาปีที่ 1</Badge>
              <h4 className="font-bold text-slate-900 text-base">ใบงานการบวกเลขจำนวนไม่เกิน 20</h4>
              <p className="text-xs text-slate-500">บทที่ 2 • จำนวน 10 ข้อ • สร้างเมื่อ 2 ชั่วโมงที่แล้ว</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
              <Printer className="w-5 h-5" />
            </div>
          </Card>

          <Card hoverable onClick={() => onNavigate('/app/worksheets')} className="flex items-center justify-between p-5 border-slate-200/80">
            <div className="space-y-1.5">
              <Badge variant="sky" size="sm">ประถมศึกษาปีที่ 3</Badge>
              <h4 className="font-bold text-slate-900 text-base">การคูณเลขสองหลัก</h4>
              <p className="text-xs text-slate-500">บทที่ 4 • จำนวน 15 ข้อ • สร้างเมื่อ 1 วันที่แล้ว</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
              <Printer className="w-5 h-5" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

