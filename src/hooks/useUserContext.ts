import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface UserFeaturePermissions {
  canCustomTeacherName: boolean;
  canCustomSchoolName: boolean;
  canUploadLogo: boolean;
  canCustomWatermark: boolean;
  watermarkText: string;
  canChooseTemplate: boolean;
  canCreateCustomQuestion: boolean;
  canChangeFontSize: boolean;
  effectivePlanCode: 'free' | 'premium' | 'premium_pro';
}

export interface UserContextData {
  userId: string | null;
  email: string | null;
  teacherName: string;
  schoolName: string;
  schoolLogoUrl: string | null;
  createdAt: string | null;
  role: 'teacher' | 'admin';
  planCode: 'free' | 'premium' | 'premium_pro';
  planName: string;
  questionLimit: number;
  worksheetLimit: number;
  startDate: string | null;
  endDate: string | null;
  formattedEndDate: string | null;
  daysRemaining: number | null;
  expiryWarningMessage: string | null;
  permissions: UserFeaturePermissions;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function getFeaturePermissions(
  rawPlanCode: string,
  daysRemaining: number | null,
  customWatermarkInput?: string
): UserFeaturePermissions {
  const isExpired = daysRemaining !== null && daysRemaining <= 0;
  const normalizedPlan = String(rawPlanCode || '').toLowerCase().replace('-', '_');

  const effectivePlanCode: 'free' | 'premium' | 'premium_pro' = isExpired
    ? 'free'
    : normalizedPlan.includes('pro')
    ? 'premium_pro'
    : normalizedPlan.includes('premium')
    ? 'premium'
    : 'free';

  const canCustomTeacherName = effectivePlanCode === 'premium' || effectivePlanCode === 'premium_pro';
  const canCustomSchoolName = effectivePlanCode === 'premium' || effectivePlanCode === 'premium_pro';
  const canUploadLogo = effectivePlanCode === 'premium_pro';
  const canCustomWatermark = effectivePlanCode === 'premium_pro';
  const canChooseTemplate = effectivePlanCode === 'premium_pro';
  const canCreateCustomQuestion = effectivePlanCode === 'premium_pro';
  const canChangeFontSize = effectivePlanCode === 'premium' || effectivePlanCode === 'premium_pro';

  let watermarkText = '';
  if (effectivePlanCode === 'free') {
    watermarkText = 'MathBoxx';
  } else if (effectivePlanCode === 'premium') {
    watermarkText = '';
  } else if (effectivePlanCode === 'premium_pro') {
    watermarkText = customWatermarkInput || '';
  }

  return {
    canCustomTeacherName,
    canCustomSchoolName,
    canUploadLogo,
    canCustomWatermark,
    watermarkText,
    canChooseTemplate,
    canCreateCustomQuestion,
    canChangeFontSize,
    effectivePlanCode,
  };
}

export function useUserContext(): UserContextData {
  const [data, setData] = useState<Omit<UserContextData, 'refetch'>>({
    userId: null,
    email: null,
    teacherName: '—',
    schoolName: '—',
    schoolLogoUrl: null,
    createdAt: null,
    role: 'teacher',
    planCode: 'free',
    planName: '—',
    questionLimit: 10,
    worksheetLimit: 5,
    startDate: null,
    endDate: null,
    formattedEndDate: null,
    daysRemaining: null,
    expiryWarningMessage: null,
    permissions: getFeaturePermissions('free', null),
    isLoading: true,
  });

  const loadUser = useCallback(async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        setData((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const user = authData.user;

      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const teacherName = profile?.teacher_name || user.user_metadata?.teacher_name || user.email?.split('@')[0] || 'คุณครู';
      const schoolName = profile?.school_name || 'โรงเรียนประถมศึกษา';
      const schoolLogoUrl = profile?.school_logo_url || null;
      const createdAt = profile?.created_at || user.created_at || null;
      const role = profile?.role || 'teacher';

      // 2. Fetch Active Subscription JOIN subscription_plans
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(code, name_th, question_limit, worksheet_limit)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      let planCode: 'free' | 'premium' | 'premium_pro' = 'free';
      let planName = 'Free Starter';
      let questionLimit = 10;
      let worksheetLimit = 5;
      let daysRemaining: number | null = null;
      let formattedEndDate: string | null = null;
      let expiryWarningMessage: string | null = null;

      if (sub?.subscription_plans) {
        const p = sub.subscription_plans as any;
        const rawCode = (p.code as string) || 'free';
        const norm = rawCode.toLowerCase().replace('-', '_');
        planCode = norm.includes('pro') ? 'premium_pro' : norm.includes('premium') ? 'premium' : 'free';
        planName = p.name_th || (planCode === 'premium_pro' ? 'Premium Pro' : planCode === 'premium' ? 'Premium Teacher' : 'Free Starter');
        questionLimit = p.question_limit || 10;
        worksheetLimit = p.worksheet_limit || 5;

        if (sub.end_date) {
          const endDateObj = new Date(sub.end_date);
          const now = new Date();
          const diffTime = endDateObj.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          formattedEndDate = endDateObj.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          if (planCode !== 'free') {
            if (daysRemaining <= 0) {
              expiryWarningMessage = 'แพ็กเกจของคุณหมดอายุแล้ว';
            } else if (daysRemaining === 1) {
              expiryWarningMessage = 'แพ็กเกจของคุณจะหมดอายุพรุ่งนี้';
            } else if (daysRemaining <= 3) {
              expiryWarningMessage = `แพ็กเกจของคุณหมดอายุเร็ว ๆ นี้ในอีก ${daysRemaining} วัน`;
            } else if (daysRemaining <= 7) {
              expiryWarningMessage = `แพ็กเกจของคุณจะหมดอายุในอีก ${daysRemaining} วัน`;
            }
          }
        }
      }

      const permissions = getFeaturePermissions(planCode, daysRemaining);

      setData({
        userId: user.id,
        email: user.email || null,
        teacherName,
        schoolName,
        schoolLogoUrl,
        createdAt,
        role,
        planCode,
        planName,
        questionLimit,
        worksheetLimit,
        startDate: sub?.start_date || null,
        endDate: sub?.end_date || null,
        formattedEndDate,
        daysRemaining,
        expiryWarningMessage,
        permissions,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error in useUserContext:', err);
      setData((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    ...data,
    refetch: loadUser,
  };
}
