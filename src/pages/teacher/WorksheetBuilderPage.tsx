import React, { useState, useEffect } from 'react';
import { BookOpen, Sliders, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Sparkles, Shuffle, Loader2, Crown, Plus, Lock, Layout, Edit3, Trash2, Eye, AlertCircle, Type } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { PageProps } from '../public/LandingPage';
import { questionService } from '../../services/question.service';
import { worksheetService } from '../../services/worksheet.service';
import { QuestionBankNewRecord } from '../../types/database.types';
import { useUserContext } from '../../hooks/useUserContext';
import { supabase } from '../../lib/supabase';

export const WorksheetBuilderPage: React.FC<PageProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [availableGrades, setAvailableGrades] = useState<{ code: string; name: string }[]>([]);
  const [availableLessons, setAvailableLessons] = useState<{ code: string; name: string }[]>([]);

  const [selectedGrade, setSelectedGrade] = useState<string>('P4');
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Easy');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [selectedFontSize, setSelectedFontSize] = useState<string>('16pt');

  const [worksheetQuestions, setWorksheetQuestions] = useState<QuestionBankNewRecord[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [isCreatingWorksheet, setIsCreatingWorksheet] = useState<boolean>(false);

  const [worksheetTitle, setWorksheetTitle] = useState<string>('แบบฝึกหัดเรื่อง การบวก ลบ คูณ หาร จำนวนนับ');
  const [worksheetInstructions, setWorksheetInstructions] = useState<string>('คำชี้แจง: ให้นักเรียนแสดงวิธีหาคำตอบที่ถูกต้องลงในช่องว่าง');
  const [showTeacherName, setShowTeacherName] = useState<boolean>(true);
  const [showSchoolName, setShowSchoolName] = useState<boolean>(true);

  // Custom Question Form State (Premium Pro)
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);
  const [customQuestionText, setCustomQuestionText] = useState<string>('');
  const [customChoiceA, setCustomChoiceA] = useState<string>('');
  const [customChoiceB, setCustomChoiceB] = useState<string>('');
  const [customChoiceC, setCustomChoiceC] = useState<string>('');
  const [customChoiceD, setCustomChoiceD] = useState<string>('');
  const [customCorrectAnswer, setCustomCorrectAnswer] = useState<string>('Choice A');
  const [customExplanation, setCustomExplanation] = useState<string>('');

  const userCtx = useUserContext();
  const perms = userCtx.permissions;

  // Sync template selection according to permissions (Only after context finishes loading)
  useEffect(() => {
    if (!userCtx.isLoading && !perms.canChooseTemplate && selectedTemplate !== 'standard') {
      setSelectedTemplate('standard');
    }
  }, [userCtx.isLoading, perms.canChooseTemplate, selectedTemplate]);

  // Sync font size selection according to permissions (Premium & Premium Pro allowed)
  useEffect(() => {
    if (!userCtx.isLoading && !perms.canChangeFontSize && selectedFontSize !== '16pt') {
      setSelectedFontSize('16pt');
    }
  }, [userCtx.isLoading, perms.canChangeFontSize, selectedFontSize]);

  // Sync question count based on plan limits
  useEffect(() => {
    if (!userCtx.isLoading) {
      setQuestionCount((prev) => Math.min(prev, userCtx.questionLimit));
    }
  }, [userCtx.isLoading, userCtx.questionLimit]);

  const LOCAL_STORAGE_GRADE_KEY = 'mathboxx_selected_grade';

  // Load available grades and restore saved grade from localStorage
  useEffect(() => {
    async function loadGrades() {
      const grades = await questionService.getAvailableGrades();
      setAvailableGrades(grades);

      if (grades.length > 0) {
        const savedGrade = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
        const isSavedValid = savedGrade && grades.some((g) => g.code === savedGrade);

        if (isSavedValid) {
          setSelectedGrade(savedGrade);
        } else if (grades.some((g) => g.code === 'P4')) {
          setSelectedGrade('P4');
        } else {
          setSelectedGrade(grades[0].code);
        }
      }
    }
    loadGrades();
  }, []);

  const handleGradeChange = (newGrade: string) => {
    setSelectedGrade(newGrade);
    localStorage.setItem(LOCAL_STORAGE_GRADE_KEY, newGrade);
  };

  const handleLessonChange = (newLessonCode: string) => {
    setSelectedLesson(newLessonCode);

    if (newLessonCode === 'all') {
      setWorksheetTitle('แบบฝึกหัดเรื่อง การบวก ลบ คูณ หาร จำนวนนับ');
    } else {
      const foundLesson = availableLessons.find((l) => l.code === newLessonCode);
      if (foundLesson?.name) {
        setWorksheetTitle(`แบบฝึกหัดเรื่อง ${foundLesson.name}`);
      }
    }
  };

  // Load available lessons whenever selected grade changes
  useEffect(() => {
    async function loadLessons() {
      const targetGrade = selectedGrade || 'P4';
      const lessons = await questionService.getAvailableLessons(targetGrade);
      setAvailableLessons(lessons);
      setSelectedLesson('all');
    }
    loadLessons();
  }, [selectedGrade]);

  // Handle Generating Questions
  const handleGenerateQuestions = async () => {
    const safeCount = Math.min(questionCount, userCtx.questionLimit);

    if (safeCount > userCtx.questionLimit) {
      alert(`แพ็กเกจ ${userCtx.planName} สามารถสร้างข้อสอบได้สูงสุด ${userCtx.questionLimit} ข้อ/ชุด เท่านั้น (อัปเกรดเพื่อเพิ่มโควตา)`);
      return;
    }

    setIsLoadingQuestions(true);
    try {
      const questions = await questionService.getRandomQuestions({
        gradeCode: selectedGrade,
        lessonCode: selectedLesson,
        difficulty: selectedDifficulty,
        limit: safeCount,
      });

      setWorksheetQuestions(questions);
      setStep(2);
    } catch (err: any) {
      alert(`ไม่สามารถดึงข้อสอบได้: ${err?.message || err}`);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Submit Custom Question (Premium Pro)
  const handleAddCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perms.canCreateCustomQuestion) {
      alert('สิทธิ์การสร้างข้อสอบ Custom ของตนเอง สงวนสิทธิ์เฉพาะแพ็กเกจ Premium Pro เท่านั้น');
      return;
    }

    if (!customQuestionText.trim()) return;

    const newQuestion: any = {
      id: `custom_${Date.now()}`,
      question: customQuestionText,
      question_code: `CUSTOM_${Date.now()}`,
      question_type: 'multiple_choice',
      difficulty: selectedDifficulty === 'Easy' ? 1 : selectedDifficulty === 'Medium' ? 3 : 5,
      choice_a: customChoiceA,
      choice_b: customChoiceB,
      choice_c: customChoiceC,
      choice_d: customChoiceD,
      correct_answer: customCorrectAnswer,
      explanation: customExplanation,
    };

    setWorksheetQuestions((prev) => [newQuestion, ...prev]);
    setShowAddCustomModal(false);
    setCustomQuestionText('');
    setCustomChoiceA('');
    setCustomChoiceB('');
    setCustomChoiceC('');
    setCustomChoiceD('');
    setCustomExplanation('');
  };

  // Preview Worksheet Flow: Creating Worksheet -> Deduct 1 Credit -> Save to History -> Navigate to Preview
  const handleOpenPreview = async () => {
    if (worksheetQuestions.length === 0) {
      alert('กรุณาเลือกเงื่อนไขและดึงข้อสอบก่อนเข้าสู่หน้า Preview');
      return;
    }

    const sanitizedTeacherName = perms.canCustomTeacherName ? userCtx.teacherName : '';
    const sanitizedSchoolName = perms.canCustomSchoolName ? userCtx.schoolName : '';
    const sanitizedWatermark = perms.watermarkText;
    const sanitizedTemplate = perms.canChooseTemplate ? selectedTemplate : 'standard';
    const sanitizedFontSize = perms.canChangeFontSize ? (selectedFontSize || '16pt') : '16pt';

    // Check if current draft already has an existing saved worksheet_id
    let existingSavedId: string | undefined = undefined;
    try {
      const existingDraftStr = sessionStorage.getItem('mathboxx_current_worksheet');
      if (existingDraftStr) {
        const parsedDraft = JSON.parse(existingDraftStr);
        if (parsedDraft?.id) {
          existingSavedId = parsedDraft.id;
        }
      }
    } catch (e) {
      // ignore
    }

    const payload: any = {
      id: existingSavedId,
      title: worksheetTitle || 'แบบฝึกหัดคณิตศาสตร์',
      gradeCode: selectedGrade,
      lessonCode: selectedLesson,
      difficulty: selectedDifficulty,
      questionCount: worksheetQuestions.length,
      instructions: worksheetInstructions,
      showTeacherName: perms.canCustomTeacherName && showTeacherName,
      showSchoolName: perms.canCustomSchoolName && showSchoolName,
      teacherName: sanitizedTeacherName,
      schoolName: sanitizedSchoolName,
      watermarkText: sanitizedWatermark,
      templateStyle: sanitizedTemplate,
      template: sanitizedTemplate,
      fontSize: sanitizedFontSize,
      fontSizeStyle: sanitizedFontSize,
      questions: worksheetQuestions,
    };

    // If worksheet was already created in this session, navigate directly without deducting credit again
    if (existingSavedId) {
      sessionStorage.setItem('mathboxx_current_worksheet', JSON.stringify(payload));
      onNavigate('/app/preview');
      return;
    }

    // Otherwise, Create New Worksheet -> Record History -> Deduct 1 Credit
    setIsCreatingWorksheet(true);
    try {
      const res = await worksheetService.saveWorksheet(payload);
      if (!res.success || !res.data?.id) {
        alert(res.error || 'เกิดข้อผิดพลาดในการสร้างใบงานและหักเครดิต');
        setIsCreatingWorksheet(false);
        return;
      }

      // Attach new worksheet ID to payload
      payload.id = res.data.id;
      sessionStorage.setItem('mathboxx_current_worksheet', JSON.stringify(payload));
      onNavigate('/app/preview');
    } catch (err: any) {
      alert(`ไม่สามารถสร้างใบงานได้: ${err?.message || err}`);
    } finally {
      setIsCreatingWorksheet(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Builder Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            เครื่องมือสร้างใบงานคณิตศาสตร์ <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">คัดเลือกโจทย์ จัดระเบียบข้อสอบ และแสดงตัวอย่างแบบกระดาษ A4 เสมือนจริง</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={step === 1 ? 'mint' : 'neutral'}>1. ตั้งค่าโจทย์</Badge>
          <span className="text-slate-300">•</span>
          <Badge variant={step === 2 ? 'mint' : 'neutral'}>2. จัดการใบงาน & Preview</Badge>
        </div>
      </div>

      {/* STEP 1: Filter Conditions */}
      {step === 1 && (
        <Card className="p-8 space-y-6 shadow-sm border-slate-200/90">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="ระดับชั้น (Grade Level)"
              value={selectedGrade}
              onChange={(e) => handleGradeChange(e.target.value)}
              options={availableGrades.map((g) => ({ value: g.code, label: g.name }))}
            />

            <Select
              label="บทเรียน / หน่วยการเรียนรู้ (Lesson)"
              value={selectedLesson}
              onChange={(e) => handleLessonChange(e.target.value)}
              options={[
                { value: 'all', label: 'ทุกบทเรียน (สุ่มโจทย์ผสม)' },
                ...availableLessons.map((l) => ({ value: l.code, label: l.name })),
              ]}
            />

            <Select
              label="ระดับความยาก (Difficulty)"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              options={[
                { value: 'Easy', label: 'ง่าย (ทบทวนความรู้พื้นฐาน)' },
                { value: 'Medium', label: 'ปานกลาง (ฝึกฝนทักษะการคำนวณ)' },
                { value: 'Hard', label: 'ยาก (โจทย์ประยุกต์ / ท้าทาย)' },
              ]}
            />

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">
                จำนวนข้อสอบที่ต้องการ (สูงสุด {userCtx.questionLimit} ข้อ/ชุด)
              </label>
              <Input
                type="number"
                min={1}
                max={userCtx.questionLimit}
                value={questionCount}
                onChange={(e) => setQuestionCount(Math.min(userCtx.questionLimit, parseInt(e.target.value) || 1))}
                helperText={`แพ็กเกจ ${userCtx.planName} สามารถเลือกได้สูงสุด ${userCtx.questionLimit} ข้อ`}
              />
            </div>
          </div>

          {/* Template Selection Section */}
          <div className="space-y-3 border-t pt-5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layout className="w-4 h-4 text-emerald-600" />
                <span>เลือก Layout Template สำหรับจัดหน้า A4</span>
              </label>
              {!perms.canChooseTemplate && (
                <Badge variant="coral" size="sm" icon={<Lock className="w-3 h-3 text-rose-500" />}>
                  Standard Only (Pro Required)
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setSelectedTemplate('standard')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                  selectedTemplate === 'standard'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Standard A4</span>
                  <Badge variant="mint" size="sm">ฟรี/ทุกแพ็กเกจ</Badge>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  แบบมาตรฐาน 1 คอลัมน์ อ่านง่าย เหมาะสำหรับนักเรียนประถมต้น
                </p>
              </div>

              <div
                onClick={() => perms.canChooseTemplate && setSelectedTemplate('two_column')}
                className={`p-4 rounded-2xl border-2 transition-all space-y-2 ${
                  !perms.canChooseTemplate
                    ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                    : selectedTemplate === 'two_column'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs cursor-pointer'
                    : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">2-Column Grid</span>
                  <Badge variant="coral" size="sm">Pro Only</Badge>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  จัดเรียง 2 คอลัมน์ ประหยัดกระดาษ A4 สำหรับโจทย์สั้น
                </p>
              </div>

              <div
                onClick={() => perms.canChooseTemplate && setSelectedTemplate('compact')}
                className={`p-4 rounded-2xl border-2 transition-all space-y-2 ${
                  !perms.canChooseTemplate
                    ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                    : selectedTemplate === 'compact'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs cursor-pointer'
                    : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Compact Exam</span>
                  <Badge variant="coral" size="sm">Pro Only</Badge>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  แบบฟอร์มข้อสอบกระชับ สำหรับจัดสอบหรือชุดทดสอบจับเวลา
                </p>
              </div>
            </div>
          </div>

          {/* Font Size Selection Section (Premium & Pro Feature) */}
          <div className="space-y-3 border-t pt-5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                <Type className="w-4 h-4 text-orange-500" />
                <span>ขนาดตัวอักษร Worksheet (Font Size)</span>
              </label>
              {!perms.canChangeFontSize && (
                <Badge variant="coral" size="sm" icon={<Lock className="w-3 h-3 text-rose-500" />}>
                  Standard 16 pt Only (Premium Required)
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: '16pt', label: '16 pt', desc: 'ขนาดมาตรฐาน (Default)' },
                { id: '18pt', label: '18 pt', desc: 'ขนาดใหญ่ อ่านง่าย' },
                { id: '20pt', label: '20 pt', desc: 'ขนาดใหญ่มาก ชัดเจน' },
                { id: '22pt', label: '22 pt', desc: 'ขนาดใหญ่พิเศษ' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => perms.canChangeFontSize && setSelectedFontSize(opt.id)}
                  className={`p-3.5 rounded-2xl border-2 transition-all space-y-1 ${
                    !perms.canChangeFontSize
                      ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                      : selectedFontSize === opt.id
                      ? 'border-orange-500 bg-orange-50/40 shadow-xs cursor-pointer'
                      : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{opt.label}</span>
                    {opt.id === '16pt' && <Badge variant="mint" size="sm">Default</Badge>}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              leftIcon={isLoadingQuestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
              isLoading={isLoadingQuestions}
              onClick={handleGenerateQuestions}
            >
              สุ่มดึงข้อสอบเข้ามาในใบงาน
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Manage & Order Questions */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Header Options */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <h2 className="font-extrabold text-lg text-slate-900">กำหนดข้อมูลหัวใบงาน</h2>
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => setStep(1)}>
                ย้อนกลับไปเปลี่ยนเงื่อนไข
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <Input
                label="ชื่อหัวข้อใบงาน"
                value={worksheetTitle}
                onChange={(e) => setWorksheetTitle(e.target.value)}
              />

              <Input
                label="คำชี้แจงเอกสาร"
                value={worksheetInstructions}
                onChange={(e) => setWorksheetInstructions(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTeacherName && perms.canCustomTeacherName}
                  disabled={!perms.canCustomTeacherName}
                  onChange={(e) => setShowTeacherName(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>แสดงชื่อครูผู้สอน ({userCtx.teacherName})</span>
                {!perms.canCustomTeacherName && <span className="text-[10px] text-amber-600">(🔒 Upgrade)</span>}
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSchoolName && perms.canCustomSchoolName}
                  disabled={!perms.canCustomSchoolName}
                  onChange={(e) => setShowSchoolName(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>แสดงชื่อโรงเรียน ({userCtx.schoolName})</span>
                {!perms.canCustomSchoolName && <span className="text-[10px] text-amber-600">(🔒 Upgrade)</span>}
              </label>
            </div>
          </Card>

          {/* Question List Control Panel */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  รายการข้อสอบในใบงาน ({worksheetQuestions.length} ข้อ)
                </h3>
                <p className="text-xs text-slate-500">สามารถปรับเปลี่ยนสลับลำดับข้อสอบ หรือลบข้อสอบออกได้ตามต้องการ</p>
              </div>

              {perms.canCreateCustomQuestion ? (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4 text-emerald-600" />}
                  onClick={() => setShowAddCustomModal(true)}
                >
                  สร้างข้อสอบ Custom เพิ่มเอง
                </Button>
              ) : (
                <Badge variant="coral" icon={<Lock className="w-3.5 h-3.5 text-rose-500" />}>
                  🔒 สร้างข้อสอบ Custom (Pro Only)
                </Badge>
              )}
            </div>

            {/* Questions Table */}
            <div className="space-y-3">
              {worksheetQuestions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900">{q.question || (q as any).question_text}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-600">
                        <span>ก. {q.choice_a}</span>
                        <span>ข. {q.choice_b}</span>
                        <span>ค. {q.choice_c}</span>
                        <span>ง. {q.choice_d}</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-extrabold mt-1">
                        ✓ เฉลยถูกต้อง: {q.correct_answer}
                      </p>
                      {Boolean((q as any).explanation || (q as any).answer_explanation || (q as any).solution_steps || (q as any).explanation_text) && (
                        <div className="mt-1.5 p-2 rounded-lg bg-amber-50/80 border-l-2 border-amber-400 text-[11px] text-slate-700">
                          <span className="font-bold text-amber-900">วิธีคิด / คำอธิบาย: </span>
                          <span>{(q as any).explanation || (q as any).answer_explanation || (q as any).solution_steps || (q as any).explanation_text}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Move Up / Move Down / Remove */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={idx === 0}
                      onClick={() => {
                        const updated = [...worksheetQuestions];
                        const temp = updated[idx - 1];
                        updated[idx - 1] = updated[idx];
                        updated[idx] = temp;
                        setWorksheetQuestions(updated);
                      }}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === worksheetQuestions.length - 1}
                      onClick={() => {
                        const updated = [...worksheetQuestions];
                        const temp = updated[idx + 1];
                        updated[idx + 1] = updated[idx];
                        updated[idx] = temp;
                        setWorksheetQuestions(updated);
                      }}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                      title="เลื่อนลง"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setWorksheetQuestions((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="p-1 rounded text-rose-600 hover:bg-rose-50"
                      title="ลบข้อนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t">
              <p className="text-xs text-slate-500 font-medium">
                กด "สร้างใบงาน" เพื่อสร้างใบงาน บันทึกเข้าคลังใบงานของฉัน หักเครดิต 1 ครั้ง และดูตัวอย่าง A4
              </p>

              <div className="flex items-center gap-3 justify-end">
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={isCreatingWorksheet}
                  leftIcon={isCreatingWorksheet ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                  onClick={handleOpenPreview}
                >
                  สร้างใบงาน
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Custom Question Modal (Premium Pro) */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="max-w-lg w-full p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">เพิ่มข้อสอบ Custom ของตนเอง (Premium Pro)</h3>
              <button onClick={() => setShowAddCustomModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddCustomQuestionSubmit} className="space-y-3 text-xs">
              <Input
                label="โจทย์คำถาม"
                value={customQuestionText}
                onChange={(e) => setCustomQuestionText(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input label="ตัวเลือก ก." value={customChoiceA} onChange={(e) => setCustomChoiceA(e.target.value)} required />
                <Input label="ตัวเลือก ข." value={customChoiceB} onChange={(e) => setCustomChoiceB(e.target.value)} required />
                <Input label="ตัวเลือก ค." value={customChoiceC} onChange={(e) => setCustomChoiceC(e.target.value)} required />
                <Input label="ตัวเลือก ง." value={customChoiceD} onChange={(e) => setCustomChoiceD(e.target.value)} required />
              </div>
              <Select
                label="เลือกคำตอบที่ถูกต้อง"
                value={customCorrectAnswer}
                onChange={(e) => setCustomCorrectAnswer(e.target.value)}
                options={[
                  { value: 'Choice A', label: `ตัวเลือก ก. (${customChoiceA || 'ก'})` },
                  { value: 'Choice B', label: `ตัวเลือก ข. (${customChoiceB || 'ข'})` },
                  { value: 'Choice C', label: `ตัวเลือก ค. (${customChoiceC || 'ค'})` },
                  { value: 'Choice D', label: `ตัวเลือก ง. (${customChoiceD || 'ง'})` },
                ]}
              />
              <Input
                label="คำอธิบายเฉลย (ถ้ามี)"
                value={customExplanation}
                onChange={(e) => setCustomExplanation(e.target.value)}
              />
              <div className="pt-3 flex justify-end gap-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setShowAddCustomModal(false)}>ยกเลิก</Button>
                <Button variant="primary" size="sm" type="submit">เพิ่มข้อสอบนี้</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
