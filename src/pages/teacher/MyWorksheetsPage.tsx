import React, { useState, useEffect } from 'react';
import { Files, Search, Printer, Download, Eye, FilePlus, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { PageProps } from '../public/LandingPage';
import { worksheetService } from '../../services/worksheet.service';
import { supabase } from '../../lib/supabase';

export const MyWorksheetsPage: React.FC<PageProps> = ({ onNavigate }) => {
  const [worksheets, setWorksheets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchWorksheets = async () => {
    setIsLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        const data = await worksheetService.getMyWorksheets(authData.user.id);
        setWorksheets(data);
      }
    } catch (err) {
      console.error('Error loading my worksheets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorksheets();
  }, []);

  const handleOpenWorksheetPreview = (item: any) => {
    const settings = item.settings || {};
    const payload = {
      id: item.id,
      title: item.title,
      gradeCode: settings.gradeCode || 'P4',
      lessonCode: settings.lessonCode || 'all',
      difficulty: settings.difficulty || 'Easy',
      questionCount: item.question_count || 10,
      instructions: settings.instructions || 'คำชี้แจง: ให้นักเรียนแสดงวิธีหาคำตอบที่ถูกต้องลงในช่องว่าง',
      showTeacherName: settings.showTeacherName ?? true,
      showSchoolName: settings.showSchoolName ?? true,
      teacherName: settings.teacherName,
      schoolName: settings.schoolName,
      watermarkText: settings.watermarkText,
      questions: settings.questions || [],
    };

    sessionStorage.setItem('mathboxx_current_worksheet', JSON.stringify(payload));
    onNavigate('/app/preview');
  };

  const handleDeleteWorksheet = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('คุณต้องการลบใบงานนี้ใช่หรือไม่?')) {
      const res = await worksheetService.deleteWorksheet(id);
      if (res.success) {
        fetchWorksheets();
      } else {
        alert(res.error || 'เกิดข้อผิดพลาดในการลบใบงาน');
      }
    }
  };

  const filteredWorksheets = worksheets.filter((w) =>
    w.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Files className="w-6 h-6 text-emerald-600" />
            <span>คลังใบงานของฉัน (My Worksheets)</span>
          </h1>
          <p className="text-xs text-slate-500">จัดการ ดู พลับ สั่งพิมพ์ หรือดาวน์โหลดใบงานคณิตศาสตร์ที่บันทึกไว้ในระบบ</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<FilePlus className="w-4 h-4" />}
          onClick={() => onNavigate('/app/builder')}
        >
          สร้างใบงานใหม่
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4 flex items-center gap-4">
        <div className="flex-1 w-full">
          <Input
            placeholder="ค้นหาตามชื่อใบงาน..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchWorksheets}>
          รีเฟรช
        </Button>
      </Card>

      {/* Worksheets List */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>กำลังดึงรายการใบงานของฉัน...</span>
        </div>
      ) : filteredWorksheets.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <Files className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-sm">ยังไม่มีใบงานที่บันทึกไว้ในระบบ</h3>
            <p className="text-xs text-slate-500">เมื่อคุณสร้างและบันทึกใบงาน รายการจะมาปรากฏในหน้านี้ทันที</p>
          </div>
          <Button variant="primary" size="sm" leftIcon={<FilePlus className="w-4 h-4" />} onClick={() => onNavigate('/app/builder')}>
            เริ่มสร้างใบงานแรก
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorksheets.map((item) => (
            <Card key={item.id} hoverable className="p-6 space-y-4 transition-all">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Badge variant="mint">ใบงานคณิตศาสตร์</Badge>
                  <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                </div>
                <Badge variant="neutral" size="sm">{item.worksheet_format || 'A4'}</Badge>
              </div>

              <p className="text-xs text-slate-500">
                สร้างเมื่อ: {new Date(item.created_at).toLocaleDateString('th-TH')} • {item.question_count || 10} ข้อ
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenWorksheetPreview(item)}
                  >
                    พรีวิว
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenWorksheetPreview(item)}
                  >
                    พิมพ์
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenWorksheetPreview(item)}
                  >
                    PDF (A4)
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
