import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { PageProps } from '../public/LandingPage';
import { questionService } from '../../services/question.service';
import { QuestionBankNewRecord } from '../../types/database.types';

export const QuestionBankPage: React.FC<PageProps> = () => {
  const [questions, setQuestions] = useState<QuestionBankNewRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [availableGrades, setAvailableGrades] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    async function initGrades() {
      const grades = await questionService.getAvailableGrades();
      setAvailableGrades(grades);
    }
    initGrades();
  }, []);

  useEffect(() => {
    async function loadQuestions() {
      setIsLoading(true);
      const result = await questionService.searchQuestions({
        searchQuery,
        gradeCode: selectedGrade,
        limit: 50,
      });
      setQuestions(result.data);
      setTotalCount(result.count);
      setIsLoading(false);
    }
    loadQuestions();
  }, [searchQuery, selectedGrade]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-emerald-600" />
          <span>คลังข้อสอบคณิตศาสตร์ (public.question_bank_new)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          ค้นหาและดูตัวอย่างโจทย์คณิตศาสตร์จากคลังข้อสอบจริง ({totalCount} รายการ)
        </p>
      </div>

      <Card className="p-4 flex flex-col md:flex-row items-center gap-4 border-slate-200/80">
        <div className="flex-1 w-full">
          <Input
            placeholder="ค้นหาโจทย์ข้อสอบ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full md:w-60">
          <Select
            label=""
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            options={[
              { value: 'all', label: 'ทุกระดับชั้น' },
              ...availableGrades.map((g) => ({ value: g.code, label: g.name })),
            ]}
          />
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-12 text-center space-y-3 border-slate-200/80">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">กำลังโหลดข้อสอบจาก public.question_bank_new...</p>
        </Card>
      ) : questions.length === 0 ? (
        <Card className="p-12 text-center space-y-3 border-slate-200/80">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">ไม่พบข้อสอบใน public.question_bank_new ตามเงื่อนไขที่เลือก</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <Card key={q.id} className="p-5 space-y-3 border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="mint" size="sm">
                    {q.question_type_code || 'ปรนัย'}
                  </Badge>
                  {q.difficulty && (
                    <Badge variant="sky" size="sm">
                      ความยาก: {q.difficulty}
                    </Badge>
                  )}
                  {q.grade && (
                    <Badge variant="neutral" size="sm">
                      {q.grade}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono font-semibold">
                  {q.question_code}
                </span>
              </div>
              <p className="text-base font-extrabold text-slate-900 leading-relaxed">
                โจทย์: {q.question}
              </p>
              
              {/* Render choices if present */}
              {(q.choice_a || q.choice_b || q.choice_c || q.choice_d) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 text-xs text-slate-700">
                  {q.choice_a && (
                    <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'A' || q.correct_answer === 'choice_a' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-slate-50 border-slate-200/60'}`}>
                      ก) {q.choice_a} {q.correct_answer === 'A' && '(เฉลย)'}
                    </div>
                  )}
                  {q.choice_b && (
                    <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'B' || q.correct_answer === 'choice_b' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-slate-50 border-slate-200/60'}`}>
                      ข) {q.choice_b} {q.correct_answer === 'B' && '(เฉลย)'}
                    </div>
                  )}
                  {q.choice_c && (
                    <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'C' || q.correct_answer === 'choice_c' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-slate-50 border-slate-200/60'}`}>
                      ค) {q.choice_c} {q.correct_answer === 'C' && '(เฉลย)'}
                    </div>
                  )}
                  {q.choice_d && (
                    <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'D' || q.correct_answer === 'choice_d' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-slate-50 border-slate-200/60'}`}>
                      ง) {q.choice_d} {q.correct_answer === 'D' && '(เฉลย)'}
                    </div>
                  )}
                </div>
              )}

              {q.answer_explanation && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600">
                  <span className="font-bold text-slate-700">คำอธิบาย: </span>
                  {q.answer_explanation}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

