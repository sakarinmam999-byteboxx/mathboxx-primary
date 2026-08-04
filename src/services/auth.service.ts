import { supabase } from '../lib/supabase';
import { ProfileRecord } from '../types/database.types';

export interface AuthResponse {
  success: boolean;
  user?: any;
  session?: any;
  profile?: ProfileRecord | null;
  error?: string;
  message?: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  teacherName: string;
  schoolName: string;
}

export const authService = {
  /**
   * Register New Teacher User via Supabase Auth
   */
  async signUpTeacher(params: SignUpParams): Promise<AuthResponse> {
    try {
      const email = params.email.trim();
      const password = params.password;
      const teacherName = params.teacherName.trim();
      const schoolName = params.schoolName.trim();

      // Form validation
      if (!teacherName) {
        return { success: false, error: 'กรุณากรอกชื่อ-นามสกุลครูผู้สอน' };
      }
      if (!schoolName) {
        return { success: false, error: 'กรุณากรอกชื่อโรงเรียน' };
      }
      if (!email || !email.includes('@') || !email.includes('.')) {
        return { success: false, error: 'กรุณากรอกอีเมลให้ถูกต้อง' };
      }
      if (!password || password.length < 8) {
        return { success: false, error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
      }

      // Step 1: Call Supabase Auth signUp
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            teacher_name: teacherName,
            school_name: schoolName,
            role: 'teacher',
          },
        },
      });

      if (error) {
        let thaiError = 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง';
        if (error.message.includes('User already registered') || error.message.includes('already exists')) {
          thaiError = 'อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบ';
        } else if (error.message.includes('Password should be at least')) {
          thaiError = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
        } else if (error.message.includes('invalid format')) {
          thaiError = 'รูปแบบอีเมลไม่ถูกต้อง';
        }
        return { success: false, error: thaiError };
      }

      if (!data.user) {
        return { success: false, error: 'เกิดข้อผิดพลาดในการสร้างบัญชีผู้ใช้งาน' };
      }

      // Step 2: Create public.profiles record ONLY if it does not exist
      try {
        const { data: existingProf } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('email', email)
          .maybeSingle();

        if (!existingProf) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              role: 'teacher',
              teacher_name: teacherName,
              school_name: schoolName,
              updated_at: new Date().toISOString(),
            });

          if (profileError) {
            console.warn('Profile creation warning:', profileError.message);
          }
        }
      } catch (pErr) {
        console.warn('Profile creation caught:', pErr);
      }

      // Step 3: Trigger Non-blocking Admin Email Notification
      this.sendAdminNewUserNotification({
        email: email,
        userId: data.user.id,
        teacherName: teacherName,
        schoolName: schoolName,
      });

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: 'สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี ก่อนเข้าสู่ระบบ',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิดในการลงทะเบียน',
      };
    }
  },

  /**
   * Send Email Notification to Admin via Server-side API Route (/api/notify-admin-signup)
   * Non-blocking: failures will never interrupt user signup
   */
  sendAdminNewUserNotification(params: {
    email: string;
    userId: string;
    teacherName: string;
    schoolName: string;
  }): void {
    try {
      fetch('/api/notify-admin-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }).catch((err) => {
        console.warn('Admin notification API call error (non-fatal):', err?.message || err);
      });
    } catch (err: any) {
      console.warn('Admin notification API call exception (non-fatal):', err?.message || err);
    }
  },

  /**
   * Supabase Email & Password Sign In
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        let thaiError = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง';
        if (error.message.includes('Invalid login credentials')) {
          thaiError = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        } else if (error.message.includes('Email not confirmed')) {
          thaiError = 'อีเมลนี้ยังไม่ได้ผ่านการยืนยันตัวตน กรุณาตรวจสอบอีเมลของคุณ';
        } else if (error.message.includes('Too many requests')) {
          thaiError = 'พยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
        }
        return { success: false, error: thaiError };
      }

      if (!data.user) {
        return { success: false, error: 'ไม่พบข้อมูลผู้ใช้งาน' };
      }

      // Step 1: Query profile by exact Auth User ID (profiles.id = data.user.id)
      const userEmail = data.user.email || email.trim();
      const isAdminEmail = userEmail.toLowerCase() === 'sakarinmam999@gmail.com';

      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile query error:', profileError.message);
        return {
          success: false,
          error: 'ไม่สามารถอ่านข้อมูลสิทธิ์ผู้ใช้งานได้ (Profile Access Error)',
        };
      }

      // Step 2: If no profile row exists for data.user.id, check if a profile row exists for email
      if (!profile) {
        const { data: emailProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle();

        // Determine correct role (preserve admin role for sakarinmam999@gmail.com or emailProfile.role)
        const targetRole = emailProfile?.role || (isAdminEmail ? 'admin' : 'teacher');
        const targetTeacherName = emailProfile?.teacher_name || data.user.user_metadata?.teacher_name || (isAdminEmail ? 'Admin Sakarin' : 'คุณครู');
        const targetSchoolName = emailProfile?.school_name || data.user.user_metadata?.school_name || 'MathBoxx Primary';

        // Step 3: Ensure a profile record exists with id = data.user.id for Foreign Key integrity
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: userEmail,
            role: targetRole,
            teacher_name: targetTeacherName,
            school_name: targetSchoolName,
            updated_at: new Date().toISOString(),
          })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Failed to ensure profile record for auth user:', createError.message);
          return {
            success: false,
            error: `ไม่สามารถสร้างโปรไฟล์ผู้ใช้งานได้ (${createError.message})`,
          };
        }

        profile = createdProfile;
      }

      // Final check: Enforce admin role for sakarinmam999@gmail.com if not set
      const finalRole = profile?.role || (isAdminEmail ? 'admin' : 'teacher');

      const userProfile: ProfileRecord = {
        id: data.user.id,
        email: userEmail,
        role: finalRole,
        teacher_name: profile?.teacher_name || (isAdminEmail ? 'Admin Sakarin' : 'คุณครู'),
        school_name: profile?.school_name || 'MathBoxx Primary',
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        user: data.user,
        session: data.session,
        profile: userProfile,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิดในการเชื่อมต่อระบบ',
      };
    }
  },

  /**
   * Get Current Auth Session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) return { user: null, session: null };
    return data;
  },

  /**
   * Get Profile by User ID
   */
  async getProfile(userId: string): Promise<ProfileRecord | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) return null;
    return data;
  },

  /**
   * Send Password Reset Email via Supabase Auth
   */
  async resetPasswordForEmail(email: string, redirectTo?: string) {
    try {
      const redirectUrl = redirectTo || `${window.location.origin}/reset-password`;
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ตรหัสผ่าน' };
    }
  },

  /**
   * Update User Password via Supabase Auth
   */
  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่' };
    }
  },

  /**
   * Sign Out
   */
  async signOut() {
    await supabase.auth.signOut();
  },
};
