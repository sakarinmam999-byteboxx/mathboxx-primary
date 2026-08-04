import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Printer,
  Download,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  FileText,
  KeyRound,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageProps } from '../public/LandingPage';
import { useUserContext } from '../../hooks/useUserContext';
import { supabase } from '../../lib/supabase';

interface WorksheetPage {
  questions: any[];
}

export const WorksheetPreviewPage: React.FC<PageProps> = ({
  onNavigate,
}) => {
  const [worksheetData, setWorksheetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);

  const userCtx = useUserContext();
  const perms = userCtx.permissions;

  const [profileInfo, setProfileInfo] = useState<{
    teacher_name: string;
    school_name: string;
    school_logo_url: string | null;
  }>({
    teacher_name: 'คุณครู',
    school_name: 'โรงเรียนประถมศึกษา',
    school_logo_url: null,
  });

  // ============================================================
  // LOAD WORKSHEET + PROFILE (READ ONLY)
  // ============================================================

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      try {
        let currentProfile = {
          teacher_name: 'คุณครู',
          school_name: 'โรงเรียนประถมศึกษา',
          school_logo_url: null as string | null,
        };

        const { data: authData } = await supabase.auth.getUser();

        if (authData?.user?.id) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('teacher_name, school_name, school_logo_url, email')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (prof) {
            currentProfile = {
              teacher_name:
                prof.teacher_name ||
                prof.email?.split('@')[0] ||
                'คุณครู',
              school_name:
                prof.school_name || 'โรงเรียนประถมศึกษา',
              school_logo_url: prof.school_logo_url || null,
            };

            setProfileInfo(currentProfile);
          }
        }

        const savedDraft = sessionStorage.getItem(
          'mathboxx_current_worksheet'
        );

        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);

          setWorksheetData({
            ...parsed,
            teacherName: currentProfile.teacher_name,
            schoolName: currentProfile.school_name,
            schoolLogoUrl: currentProfile.school_logo_url,
          });
        } else {
          const defaultPayload = {
            title: 'แบบฝึกหัดเรื่อง การบวก ลบ คูณ หาร จำนวนนับ',
            gradeCode: 'P4',
            lessonCode: 'all',
            difficulty: 'Easy',
            instructions:
              'คำชี้แจง: ให้นักเรียนเลือกคำตอบที่ถูกต้องที่สุด',
            showTeacherName: true,
            showSchoolName: true,
            teacherName: currentProfile.teacher_name,
            schoolName: currentProfile.school_name,
            schoolLogoUrl: currentProfile.school_logo_url,
            questions: [],
          };

          setWorksheetData(defaultPayload);
        }
      } catch (error) {
        console.error('Error loading preview data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const questionsList = useMemo(() => {
    return worksheetData?.questions || [];
  }, [worksheetData]);

  // Enforced Watermark Calculation by Plan Rights Matrix
  const effectiveWatermarkText = useMemo(() => {
    if (perms.effectivePlanCode === 'free') {
      return 'MathBoxx';
    }
    if (perms.effectivePlanCode === 'premium') {
      return '';
    }
    return perms.watermarkText || '';
  }, [perms.effectivePlanCode, perms.watermarkText]);

  // ============================================================
  // DYNAMIC WORKSHEET PAGINATION (Smart Height-based Fitting)
  // ============================================================

  const worksheetPages = useMemo<WorksheetPage[]>(() => {
    if (!questionsList.length) return [{ questions: [] }];

    const pages: WorksheetPage[] = [];
    let currentPage: any[] = [];
    let currentHeight = 0;
    let pageIndex = 0;

    // Height limit: Page 1 has Header (~120px), Page 2+ has minimal ContinuationHeader (~35px)
    const getPageMaxHeight = (isFirstPage: boolean) => (isFirstPage ? 820 : 920);

    questionsList.forEach((q: any) => {
      const qText = String(q?.question || '');
      const choices = [q?.choice_a, q?.choice_b, q?.choice_c, q?.choice_d].filter(Boolean);
      
      // Calculate realistic item height in px
      let qHeight = 38; // base badge + spacing
      qHeight += Math.ceil(Math.max(qText.length, 1) / 75) * 22; // multi-line text
      if (choices.length > 0) {
        qHeight += choices.some((c) => String(c).length > 25) ? 65 : 36;
      } else {
        qHeight += 32; // blank answer space
      }

      const maxHeight = getPageMaxHeight(pageIndex === 0);

      if (currentPage.length > 0 && currentHeight + qHeight > maxHeight) {
        pages.push({ questions: currentPage });
        currentPage = [];
        currentHeight = 0;
        pageIndex++;
      }

      currentPage.push(q);
      currentHeight += qHeight;
    });

    if (currentPage.length > 0) {
      pages.push({ questions: currentPage });
    }

    return pages.length ? pages : [{ questions: [] }];
  }, [questionsList]);

  // ============================================================
  // DYNAMIC ANSWER KEY PAGINATION (Auto-break on Height Limit)
  // ============================================================

  const answerPages = useMemo<WorksheetPage[]>(() => {
    if (!questionsList.length) return [{ questions: [] }];

    const pages: WorksheetPage[] = [];
    let current: any[] = [];
    let currentHeight = 0;
    const MAX_PAGE_HEIGHT = 740; // Printable A4 Height Limit for Answer Key

    questionsList.forEach((q: any) => {
      const expLen = String(q?.explanation || q?.answer_explanation || q?.solution_steps || q?.explanation_text || '').length;
      const qHeight = 45 + (q?.question ? 22 : 0) + (expLen ? 26 + Math.ceil(expLen / 75) * 16 : 0);

      if (current.length > 0 && currentHeight + qHeight > MAX_PAGE_HEIGHT) {
        pages.push({ questions: current });
        current = [];
        currentHeight = 0;
      }
      current.push(q);
      currentHeight += qHeight;
    });

    if (current.length > 0) {
      pages.push({ questions: current });
    }

    return pages.length ? pages : [{ questions: [] }];
  }, [questionsList]);

  const totalWorksheetPages = worksheetPages.length;
  const totalAnswerPages = answerPages.length;
  const grandTotalPages =
    totalWorksheetPages +
    (worksheetData?.showAnswerKey !== false ? totalAnswerPages : 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            กำลังจัดหน้า A4 ใบงานคณิตศาสตร์...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* PRINT CSS - Strict A4 210mm x 297mm */}
      <style>{`
        @media print {
          @page {
            size: 210mm 297mm;
            margin: 0;
          }

          header, nav, aside, footer, .print\\:hidden, .mathboxx-no-print {
            display: none !important;
          }

          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: visible !important;
          }

          .mathboxx-print-area {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            gap: 0 !important;
            width: 210mm !important;
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            z-index: 99999 !important;
          }

          .a4-page {
            width: 210mm !important;
            min-height: 297mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: '6mm 8mm 6mm 8mm', !important;
            box-sizing: border-box !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            transform: none !important;
            overflow: visible !important;
            page-break-after: always !important;
            break-after: page !important;
          }

          .a4-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          .a4-content-body {
            overflow: visible !important;
          }
        }
      `}</style>

      {/* ACTION TOOLBAR (Web Screen Only) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => onNavigate('/app/builder')}
          >
            ย้อนกลับไปแก้ไข
          </Button>

          <div className="h-4 w-[1px] bg-slate-200" />

          <div>
            <h1 className="text-base font-black text-slate-900">
              ตัวอย่างจัดหน้า A4 แบบฝึกหัด
            </h1>
            <p className="text-xs text-slate-500">
              แสดงผลรวม {grandTotalPages} หน้า (ฉบับนักเรียน {totalWorksheetPages} หน้า
              {worksheetData?.showAnswerKey !== false ? ` + เฉลย ${totalAnswerPages} หน้า` : ''})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1 hover:bg-white rounded-lg transition-colors text-slate-600"
              title="ย่อขนาด"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-1 w-12 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="p-1 hover:bg-white rounded-lg transition-colors text-slate-600"
              title="ขยายขนาด"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            สั่งพิมพ์
          </Button>

          <Button
            variant="primary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleDownloadPDF}
          >
            ดาวน์โหลด PDF (A4)
          </Button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <div className="flex justify-center bg-slate-200/60 p-4 md:p-8 rounded-2xl border border-slate-300/60 overflow-x-auto min-h-[850px]">
        <div className="mathboxx-print-area flex flex-col gap-8">
          {/* STUDENT WORKSHEET PAGES */}
          {worksheetPages.map((page, pageIndex) => {
            const startNumber = worksheetPages
              .slice(0, pageIndex)
              .reduce((sum, item) => sum + item.questions.length, 0);

            return (
              <div
                key={`page-${pageIndex}`}
                className="a4-page relative bg-white rounded-sm shadow-[0_12px_35px_rgba(15,23,42,0.12)] print:shadow-none"
                style={{
                  width: '210mm',
                  height: '297mm',
                  minHeight: '297mm',
                  padding: '8mm 10mm 8mm 10mm',
                  boxSizing: 'border-box',
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                }}
              >
                {effectiveWatermarkText ? (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                    <span
                      className="text-[52px] font-black tracking-widest text-slate-900 whitespace-nowrap"
                      style={{
                        opacity: 0.035,
                        transform: 'rotate(-30deg)',
                      }}
                    >
                      {effectiveWatermarkText}
                    </span>
                  </div>
                ) : null}

                <div className="relative z-10 h-full flex flex-col justify-between">
                  {pageIndex === 0 ? (
                    <WorksheetHeader
                      worksheetData={worksheetData}
                      profileInfo={profileInfo}
                      totalQuestions={questionsList.length}
                      pageNumber={pageIndex + 1}
                      totalPages={grandTotalPages}
                      canCustomTeacherName={perms.canCustomTeacherName}
                      canCustomSchoolName={perms.canCustomSchoolName}
                      canUploadLogo={perms.canUploadLogo}
                    />
                  ) : (
                    <ContinuationHeader
                      worksheetData={worksheetData}
                      pageNumber={pageIndex + 1}
                      totalPages={grandTotalPages}
                    />
                  )}

                  <div className="a4-content-body flex-1 py-1 space-y-1">
                    {page.questions.map((question: any, index: number) => (
                      <QuestionBlock
                        key={question.id || index}
                        question={question}
                        number={startNumber + index + 1}
                        compact={(worksheetData?.templateStyle || worksheetData?.template) === 'compact'}
                        fontSize={worksheetData?.fontSize || worksheetData?.fontSizeStyle || 'medium'}
                      />
                    ))}
                  </div>

                  <PageFooter
                    pageNumber={pageIndex + 1}
                    totalPages={grandTotalPages}
                    label="ฉบับนักเรียน"
                  />
                </div>
              </div>
            );
          })}

          {/* ANSWER PAGES */}
          {worksheetData?.showAnswerKey !== false &&
            answerPages.map((page, pageIndex) => {
              const startNumber = answerPages
                .slice(0, pageIndex)
                .reduce((sum, item) => sum + item.questions.length, 0);

              const currentPageNum = totalWorksheetPages + pageIndex + 1;

              return (
                <div
                  key={`answer-${pageIndex}`}
                  className="a4-page relative bg-white rounded-sm shadow-[0_12px_35px_rgba(15,23,42,0.12)] print:shadow-none"
                  style={{
                    width: '210mm',
                    height: '297mm',
                    minHeight: '297mm',
                    padding: '8mm 10mm 8mm 10mm',
                    boxSizing: 'border-box',
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                  }}
                >
                  {effectiveWatermarkText ? (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                      <span
                        className="text-[52px] font-black tracking-widest text-slate-900 whitespace-nowrap"
                        style={{
                          opacity: 0.035,
                          transform: 'rotate(-30deg)',
                        }}
                      >
                        {effectiveWatermarkText}
                      </span>
                    </div>
                  ) : null}

                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <AnswerHeader
                      worksheetData={worksheetData}
                      pageNumber={currentPageNum}
                      totalPages={grandTotalPages}
                    />

                    <div className="a4-content-body flex-1 py-1 space-y-1">
                      {page.questions.map((question: any, index: number) => (
                        <AnswerBlock
                          key={question.id || index}
                          question={question}
                          number={startNumber + index + 1}
                        />
                      ))}
                    </div>

                    <PageFooter
                      pageNumber={currentPageNum}
                      totalPages={grandTotalPages}
                      label="เฉลยสำหรับครู"
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

// ================================================================
// HEADER (EXACT DATA MAPPING)
// ================================================================

const WorksheetHeader: React.FC<{
  worksheetData: any;
  profileInfo: { teacher_name: string; school_name: string; school_logo_url: string | null };
  totalQuestions: number;
  pageNumber: number;
  totalPages: number;
  canCustomTeacherName: boolean;
  canCustomSchoolName: boolean;
  canUploadLogo: boolean;
}> = ({
  worksheetData,
  profileInfo,
  totalQuestions,
  pageNumber,
  totalPages,
  canCustomTeacherName,
  canCustomSchoolName,
  canUploadLogo,
}) => {
  const showSchool = (canCustomSchoolName || Boolean(profileInfo?.school_name)) && worksheetData?.showSchoolName !== false;
  const showTeacher = (canCustomTeacherName || Boolean(profileInfo?.teacher_name)) && worksheetData?.showTeacherName !== false;
  const showLogo = (canUploadLogo || Boolean(profileInfo?.school_logo_url)) && Boolean(profileInfo?.school_logo_url);
  const instructions = worksheetData?.instructions || 'คำชี้แจง: ให้นักเรียนเลือกคำตอบที่ถูกต้องที่สุด';

  return (
    <div className="mb-2 shrink-0">
      <div className="flex items-center justify-between gap-3 border-b border-slate-300 pb-2">
        <div className="flex items-center gap-3 flex-1">
          {showLogo && profileInfo.school_logo_url && (
            <img
              src={profileInfo.school_logo_url}
              alt="School Logo"
              className="w-[60px] h-[60px] object-contain shrink-0"
            />
          )}
          <div className="space-y-0.5">
            {showSchool && profileInfo.school_name && (
              <div className="text-[20px] sm:text-[22px] font-extrabold text-slate-800 leading-tight">
                {profileInfo.school_name}
              </div>
            )}
            <h1 className="text-[24px] sm:text-[26px] leading-tight font-black tracking-tight text-slate-950">
              {worksheetData?.title || 'แบบฝึกหัดคณิตศาสตร์'}
            </h1>
            {showTeacher && profileInfo.teacher_name && (
              <div className="text-[15px] sm:text-[16px] text-slate-700 font-bold">
                ครูผู้สอน: <span className="text-slate-900">{profileInfo.teacher_name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-[80px] rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-right shrink-0">
          <div className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider">
            WORKSHEET
          </div>

          <div className="text-lg font-black text-slate-900 leading-none mt-0.5">
            {String(pageNumber).padStart(2, '0')}
          </div>

          <div className="text-[8px] text-slate-500 font-bold mt-0.5">
            {totalPages} หน้า
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[14px] sm:text-[15px] font-semibold text-slate-800">
        <div>ชื่อ: ............................................................................</div>
        <div>ชั้น: .........</div>
        <div>เลขที่: ......</div>
        <div>วันที่: ....................</div>
      </div>

      <div className="mt-1.5 px-2.5 py-1 bg-amber-50/70 border border-amber-200/80 rounded-lg text-[13px] font-semibold text-slate-800">
        <span className="font-extrabold text-emerald-800">คำชี้แจง: </span>
        <span>{instructions.replace(/^คำชี้แจง:\s*/, '')}</span>
      </div>
    </div>
  );
};

// ================================================================
// CONTINUATION HEADER (Page 2+ Includes Instructions)
// ================================================================

const ContinuationHeader: React.FC<{
  worksheetData: any;
  pageNumber: number;
  totalPages: number;
}> = ({ worksheetData, pageNumber, totalPages }) => {
  const instructions = worksheetData?.instructions || 'คำชี้แจง: ให้นักเรียนเลือกคำตอบที่ถูกต้องที่สุด';

  return (
    <div className="mb-2 shrink-0 border-b border-slate-300 pb-1.5 space-y-1">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            MathBoxx Primary • ใบงานคณิตศาสตร์
          </span>
          <h2 className="text-[15px] font-extrabold text-slate-900 leading-tight mt-0.5">
            {worksheetData?.title || 'แบบฝึกหัดคณิตศาสตร์'}
          </h2>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-extrabold text-slate-600">
            หน้าที่ {pageNumber} / {totalPages}
          </div>
        </div>
      </div>

      <div className="text-[11.5px] font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 truncate">
        <span className="font-extrabold text-emerald-800">คำชี้แจง: </span>
        <span>{instructions.replace(/^คำชี้แจง:\s*/, '')}</span>
      </div>
    </div>
  );
};

// ================================================================
// ANSWER HEADER
// ================================================================

const AnswerHeader: React.FC<{
  worksheetData: any;
  pageNumber: number;
  totalPages: number;
}> = ({ worksheetData, pageNumber, totalPages }) => {
  return (
    <div className="mb-3 shrink-0 border-b-2 border-emerald-600 pb-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-black tracking-wider uppercase">
            ANSWER KEY • เฉลยสำหรับครู
          </span>
          <h2 className="text-[18px] font-black text-slate-950 mt-1">
            {worksheetData?.title || 'แบบฝึกหัดคณิตศาสตร์'}
          </h2>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-500">
            หน้าที่ {pageNumber} / {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================================================
// QUESTION BLOCK
// ================================================================

const QuestionBlock: React.FC<{
  question: any;
  number: number;
  compact?: boolean;
  fontSize?: string;
}> = ({ question, number, compact, fontSize }) => {
  const choices = [
    { key: 'ก', text: question?.choice_a },
    { key: 'ข', text: question?.choice_b },
    { key: 'ค', text: question?.choice_c },
    { key: 'ง', text: question?.choice_d },
  ].filter((c) => Boolean(c.text));

  return (
    <div className="break-inside-avoid mb-2">
      <div className="flex items-start gap-2.5">
        <span className="w-5.5 h-5.5 rounded bg-slate-900 text-white text-[12px] font-black flex items-center justify-center shrink-0 mt-0.5">
          {number}
        </span>

        <div className="flex-1">
          <p className="text-[15px] sm:text-[16px] font-bold text-slate-900 leading-snug">
            {question?.question || 'โจทย์ข้อสอบ'}
          </p>

          {choices.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 pl-1 text-[13.5px] sm:text-[14.5px] font-semibold text-slate-800">
              {choices.map((choice) => (
                <div key={choice.key} className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full border border-slate-400 text-[9px] font-bold flex items-center justify-center shrink-0 text-slate-600">
                    {choice.key}
                  </span>
                  <span>{choice.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-1.5 text-[11px] text-slate-400 italic">
              พื้นที่แสดงวิธีทำ / คำตอบ: ....................................................................................................
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ================================================================
// ANSWER BLOCK
// ================================================================

const AnswerBlock: React.FC<{
  question: any;
  number: number;
}> = ({ question, number }) => {
  const explanationText = question?.explanation || question?.answer_explanation || question?.solution_steps || question?.explanation_text || '';

  return (
    <div className="mb-2 p-2 rounded-lg border border-slate-200 bg-emerald-50/20 break-inside-avoid">
      <div className="flex items-start gap-2.5">
        <span className="w-5 h-5 rounded bg-emerald-700 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
          {number}
        </span>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-slate-900">
              ตอบข้อ:
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-black">
              {question?.correct_answer || '—'}
            </span>
          </div>

          {question?.question && (
            <p className="text-[12.5px] text-slate-900 font-semibold leading-normal">
              {question.question}
            </p>
          )}

          {explanationText ? (
            <div className="mt-1 p-2 rounded bg-amber-50/80 border-l-3 border-amber-500 text-[11.5px] leading-relaxed text-slate-800">
              <span className="font-bold text-amber-900">วิธีคิด / คำอธิบาย: </span>
              <span>{explanationText}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ================================================================
// PAGE FOOTER
// ================================================================

const PageFooter: React.FC<{
  pageNumber: number;
  totalPages: number;
  label: string;
}> = ({ pageNumber, totalPages, label }) => {
  return (
    <div className="mt-auto pt-1.5 border-t border-slate-200 flex items-center justify-between text-[7.5px] text-slate-400 font-bold shrink-0">
      <div>MathBoxx Primary • {label}</div>

      <div>
        หน้าที่ {pageNumber} จาก {totalPages}
      </div>
    </div>
  );
};