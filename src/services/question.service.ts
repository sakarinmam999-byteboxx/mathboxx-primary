import { supabase } from '../lib/supabase';
import { QuestionBankNewRecord } from '../types/database.types';

export interface QuestionSearchParams {
  searchQuery?: string;
  gradeCode?: string;
  unitCode?: string;
  lessonCode?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
}

export const questionService = {
  /**
   * Reads question records strictly from public.question_bank_new table
   * Supports relational hierarchy: grades -> units -> lessons -> question_bank_new
   */
  async searchQuestions(params: QuestionSearchParams = {}) {
    try {
      let query = supabase
        .from('question_bank_new')
        .select('*', { count: 'exact' });

      // 1. Grade Filter
      if (params.gradeCode && params.gradeCode !== 'all') {
        query = query.eq('grade_code', params.gradeCode);
      }

      // 2. Specific Lesson Filter OR Unit-Level Lessons Filter
      if (params.lessonCode && params.lessonCode !== 'all') {
        query = query.eq('lesson_code', params.lessonCode);
      } else if (params.unitCode && params.unitCode !== 'all') {
        // Fetch all lesson_codes under the selected Unit from public.lessons
        const { data: unitLessons } = await supabase
          .from('lessons')
          .select('title_th, code')
          .eq('unit_id', params.unitCode);

        if (unitLessons && unitLessons.length > 0) {
          const lessonCodes = unitLessons
            .map((l) => l.code || l.title_th)
            .filter(Boolean);

          if (lessonCodes.length > 0) {
            query = query.in('lesson_code', lessonCodes);
          }
        }
      }

      // 3. Difficulty Filter
      if (params.difficulty && params.difficulty !== 'all') {
        query = query.eq('difficulty', params.difficulty);
      }

      // 4. Search Query Filter
      if (params.searchQuery && params.searchQuery.trim()) {
        query = query.ilike('question', `%${params.searchQuery.trim()}%`);
      }

      const limit = params.limit || 20;
      const offset = params.offset || 0;

      query = query.range(offset, offset + limit - 1).order('id', { ascending: true });

      const { data, count, error } = await query;

      if (error) {
        console.error('Error fetching questions from question_bank_new:', error.message);
        return { data: [] as QuestionBankNewRecord[], count: 0, error: error.message };
      }

      return { data: (data || []) as QuestionBankNewRecord[], count: count || 0, error: null };
    } catch (err: any) {
      console.error('Unexpected error in questionService:', err);
      return { data: [] as QuestionBankNewRecord[], count: 0, error: err.message };
    }
  },

  /**
   * Get random or filtered question records array directly from public.question_bank_new
   */
  async getRandomQuestions(params: QuestionSearchParams = {}) {
    const res = await this.searchQuestions(params);
    return res.data || [];
  },

  /**
   * Get distinct grades present in public.question_bank_new
   */
  async getAvailableGrades() {
    try {
      const knownGradeCodes = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

      const results = await Promise.all(
        knownGradeCodes.map((code) =>
          supabase
            .from('question_bank_new')
            .select('grade, grade_code')
            .eq('grade_code', code)
            .limit(1)
            .maybeSingle()
        )
      );

      return knownGradeCodes.map((code, index) => {
        const row = results[index]?.data;
        return {
          code,
          name: row?.grade || `ประถมศึกษาปีที่ ${code.replace('P', '')}`,
        };
      });
    } catch {
      return ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map((code) => ({
        code,
        name: `ประถมศึกษาปีที่ ${code.replace('P', '')}`,
      }));
    }
  },

  /**
   * Get real Units from public.units for a grade
   */
  async getAvailableUnits(gradeCode?: string) {
    try {
      if (!gradeCode || gradeCode === 'all') {
        const { data } = await supabase
          .from('units')
          .select('id, unit_number, title_th')
          .order('unit_number', { ascending: true });

        return (data || []).map((u) => ({
          code: u.id,
          name: `หน่วยที่ ${u.unit_number}: ${u.title_th}`,
        }));
      }

      const { data: gradeRow } = await supabase
        .from('grades')
        .select('id')
        .eq('code', gradeCode)
        .maybeSingle();

      if (!gradeRow?.id) return [];

      const { data: units } = await supabase
        .from('units')
        .select('id, unit_number, title_th')
        .eq('grade_id', gradeRow.id)
        .order('unit_number', { ascending: true });

      return (units || []).map((u) => ({
        code: u.id,
        name: `หน่วยที่ ${u.unit_number}: ${u.title_th}`,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Get distinct lessons present in public.question_bank_new for a grade and unit
   */
  async getAvailableLessons(gradeCode?: string, unitCode?: string) {
    try {
      let query = supabase
        .from('question_bank_new')
        .select('lesson, lesson_code, grade_code, strand_code')
        .not('lesson_code', 'is', null);

      if (gradeCode && gradeCode !== 'all') {
        query = query.eq('grade_code', gradeCode);
      }

      if (unitCode && unitCode !== 'all') {
        query = query.eq('strand_code', unitCode);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      const uniqueMap = new Map<string, { code: string; name: string }>();
      data.forEach((item) => {
        if (item.lesson_code && !uniqueMap.has(item.lesson_code)) {
          uniqueMap.set(item.lesson_code, {
            code: item.lesson_code,
            name: item.lesson || item.lesson_code,
          });
        }
      });

      return Array.from(uniqueMap.values());
    } catch {
      return [];
    }
  },
};
