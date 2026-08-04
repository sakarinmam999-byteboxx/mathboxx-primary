import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, Printer, Download, Award, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export interface PageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-6">
      {/* Hero Banner Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pastel-mint-100 border border-pastel-mint-200 text-pastel-mint-700 text-xs font-bold shadow-pastel-sm">
          <Sparkles className="w-4 h-4 text-pastel-mint-600" />
          <span>ระบบสร้างใบงานคณิตศาสตร์อันดับ 1 สำหรับครูประถม</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-tight">
          สร้างใบงานคณิตศาสตร์ ป.1 - ป.6 <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pastel-mint-600 to-pastel-sky-500">
            พิมพ์ได้ทันทีและสวยงามใน 3 นาที
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          ลดเวลาเตรียมการสอนของครูด้วยคลังข้อสอบตรงตามหลักสูตรแกนกลาง ระบบสุ่มโจทย์อัตโนมัติ 
          โลโก้โรงเรียน สระภาษาไทย และสัญลักษณ์คณิตศาสตร์คมชัด
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-5 h-5" />}
            onClick={() => onNavigate('/register')}
          >
            เริ่มทดลองใช้งานฟรี
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onNavigate('/pricing')}
          >
            ดูแผนราคาและโควตา
          </Button>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverable className="space-y-3 border-pastel-mint-200 bg-gradient-to-b from-white to-pastel-mint-50/30">
          <div className="p-3 w-fit rounded-2xl bg-pastel-mint-100 text-pastel-mint-700">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">คลังข้อสอบ ป.1 - ป.6</h3>
          <p className="text-sm text-slate-600">
            แบ่งตามรายวิชา ระดับชั้น หน่วยการเรียนรู้ และบทเรียนย่อย ครอบคลุมโจทย์ปรนัย เติมคำ และวิธีทำ
          </p>
        </Card>

        <Card hoverable className="space-y-3 border-pastel-sky-200 bg-gradient-to-b from-white to-pastel-sky-50/30">
          <div className="p-3 w-fit rounded-2xl bg-pastel-sky-100 text-pastel-sky-600">
            <Printer className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Browser Print & PDF Export</h3>
          <p className="text-sm text-slate-600">
            สั่งพิมพ์โดยตรงผ่านเบราว์เซอร์ หรือดาวน์โหลดไฟล์ PDF ขนาด A4 (แนวตั้ง/แนวนอน) สระภาษาไทยไม่ลอย
          </p>
        </Card>

        <Card hoverable className="space-y-3 border-pastel-peach-200 bg-gradient-to-b from-white to-pastel-peach-50/30">
          <div className="p-3 w-fit rounded-2xl bg-pastel-peach-100 text-pastel-peach-500">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Teacher Branding</h3>
          <p className="text-sm text-slate-600">
            ใส่ชื่อครูผู้สอน ชื่อโรงเรียน อัปโหลดโลโก้โรงเรียน และตั้งค่าลายน้ำส่วนตัวบนใบงานได้อย่างมืออาชีพ
          </p>
        </Card>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-pastel-mint-600 to-pastel-sky-600 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-pastel-lg">
        <h2 className="text-2xl sm:text-3xl font-black">พร้อมเริ่มต้นสร้างใบงานคณิตศาสตร์แล้วหรือยัง?</h2>
        <p className="text-white/90 max-w-xl mx-auto text-sm sm:text-base">
          สมัครสมาชิกใช้งานฟรีวันนี้ สร้างใบงานได้ 5 ใบงานต่อเดือน โดยไม่ต้องกรอกข้อมูลบัตรเครดิต
        </p>
        <Button
          variant="secondary"
          size="lg"
          className="bg-white text-pastel-mint-700 hover:bg-pastel-mint-50 shadow-lg"
          onClick={() => onNavigate('/register')}
        >
          สมัครสมาชิกฟรีทันที
        </Button>
      </section>
    </div>
  );
};
