import { supabase } from '../lib/supabase';

export interface WorksheetPayload {
  id?: string;
  title: string;
  gradeCode: string;
  lessonCode: string;
  difficulty: string;
  questionCount: number;
  instructions: string;
  showTeacherName: boolean;
  showSchoolName: boolean;
  teacherName?: string;
  schoolName?: string;
  watermarkText?: string;
  templateStyle?: string;
  questions: any[];
}

export const worksheetService = {
  async getMyWorksheets(userId?: string) {
    try {
      // Proactively refresh & verify active auth session
      let { data: sessionData } = await supabase.auth.getSession();
      const currentSeconds = Math.floor(Date.now() / 1000);

      if (
        !sessionData?.session ||
        (sessionData.session.expires_at && sessionData.session.expires_at < currentSeconds + 60)
      ) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        if (refreshed?.session) {
          sessionData = refreshed;
        }
      }

      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id || userId;

      if (!currentUserId) return [];

      const { data, error } = await supabase
        .from('worksheets')
        .select('*')
        .eq('owner_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching worksheets:', err);
      return [];
    }
  },

  /**
   * Save / Create Worksheet
   * - Verify active authenticated session (auto-refresh with 60s buffer if expired/stale)
   * - Query real grade_id matching subject_id (95233d59-7dc9-42cc-adb5-4c93a229a650) and code (payload.gradeCode)
   * - Strictly use authData.user.id as owner_id matching auth.uid() in RLS
   * - Insert into worksheets table
   * - Insert questions into worksheet_questions table
   * - Record 1 credit usage in usage_records ONLY on new creation (action_type = 'worksheet_created')
   */
  async saveWorksheet(payload: WorksheetPayload) {
    try {
      // 1. Proactively verify active session and auto-refresh with 60s buffer if expired or near expiry
      let { data: sessionData } = await supabase.auth.getSession();
      const currentSeconds = Math.floor(Date.now() / 1000);

      if (
        !sessionData?.session ||
        (sessionData.session.expires_at && sessionData.session.expires_at < currentSeconds + 60)
      ) {
        const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
        if (refreshed?.session) {
          sessionData = refreshed;
        } else if (refreshErr) {
          console.warn('Session refresh warning:', refreshErr.message);
        }
      }

      // 2. Fetch authenticated user directly from Supabase Auth Server with active JWT
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user?.id) {
        return { success: false, error: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่' };
      }

      // Strictly use authenticated user.id for RLS owner_id = auth.uid()
      const userId = authData.user.id;

      // 3. System Primary App ID and Subject UUID for MathBoxx Primary ("คณิตศาสตร์")
      const appId = 'f08182da-c33c-4fbc-ac1a-8a11a26b6ecc';
      const subjectId = '95233d59-7dc9-42cc-adb5-4c93a229a650';

      // 4. Query real grade_id matching subject_id and grade code from public.grades
      const { data: gradeData, error: gradeError } = await supabase
        .from('grades')
        .select('id')
        .eq('subject_id', subjectId)
        .eq('code', payload.gradeCode)
        .maybeSingle();

      if (gradeError || !gradeData?.id) {
        console.error('Grade query error:', gradeError?.message);
        return {
          success: false,
          error: `ไม่พบข้อมูลระดับชั้น (${payload.gradeCode}) ในระบบ`,
        };
      }

      const gradeId = gradeData.id;

      const settingsData = {
        instructions: payload.instructions,
        showTeacherName: payload.showTeacherName,
        showSchoolName: payload.showSchoolName,
        teacherName: payload.teacherName,
        schoolName: payload.schoolName,
        watermarkText: payload.watermarkText,
        templateStyle: payload.templateStyle || 'standard',
        questions: payload.questions,
        gradeCode: payload.gradeCode,
        lessonCode: payload.lessonCode,
        difficulty: payload.difficulty,
      };

      if (payload.id) {
        // Update existing worksheet owned by userId (DO NOT deduct credit again)
        const { data, error } = await supabase
          .from('worksheets')
          .update({
            title: payload.title,
            question_count: payload.questions.length,
            settings: settingsData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payload.id)
          .eq('owner_id', userId)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } else {
        // Insert new worksheet using authenticated userId and real foreign keys
        const { data: newWorksheet, error: wsError } = await supabase
          .from('worksheets')
          .insert({
            owner_id: userId,
            app_id: appId,
            subject_id: subjectId,
            grade_id: gradeId,
            title: payload.title,
            worksheet_format: 'A4',
            orientation: 'PORTRAIT',
            difficulty: payload.difficulty === 'Easy' ? 1 : payload.difficulty === 'Medium' ? 3 : 5,
            question_count: payload.questions.length,
            settings: settingsData,
            status: 'active',
          })
          .select()
          .single();

        if (wsError || !newWorksheet) throw wsError || new Error('ไม่สามารถสร้างใบงานได้');

        // Insert questions into worksheet_questions junction table safely
        if (Array.isArray(payload.questions) && payload.questions.length > 0) {
          const questionsToInsert = payload.questions
            .map((q: any, idx: number) => {
              if (q.id && typeof q.id === 'string' && q.id.length > 10) {
                return {
                  worksheet_id: newWorksheet.id,
                  question_id: q.id,
                  order_number: idx + 1,
                  custom_settings: {
                    question_text: q.question || q.question_text || '',
                    correct_answer: q.correct_answer || '',
                  },
                };
              }
              return null;
            })
            .filter(Boolean);

          if (questionsToInsert.length > 0) {
            await supabase.from('worksheet_questions').insert(questionsToInsert);
          }
        }

        // Record credit consumption in usage_records (1 Credit = 1 Worksheet Creation)
        await supabase.from('usage_records').insert({
          user_id: userId,
          app_id: appId,
          action_type: 'worksheet_created',
          reference_id: newWorksheet.id,
          metadata: {
            title: payload.title,
            question_count: payload.questions.length,
            grade_code: payload.gradeCode,
          },
        });

        return { success: true, data: newWorksheet };
      }
    } catch (err: any) {
      console.error('Error saving worksheet:', err?.message || err);
      return { success: false, error: err?.message || 'ไม่สามารถสร้างและบันทึกใบงานได้' };
    }
  },

  async deleteWorksheet(id: string) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user?.id) return { success: false, error: 'Session หมดอายุ' };

      const { error } = await supabase
        .from('worksheets')
        .delete()
        .eq('id', id)
        .eq('owner_id', authData.user.id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting worksheet:', err);
      return { success: false, error: err?.message || 'ไม่สามารถลบใบงานได้' };
    }
  },
};
