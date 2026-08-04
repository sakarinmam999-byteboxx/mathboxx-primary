// TypeScript interfaces matching MATHBOXX_ARCHITECTURE.md (16 Tables)

export type UserRole = 'teacher' | 'admin';
export type QuestionType = 'multiple_choice' | 'fill_in_blank' | 'matching' | 'subjective';
export type QuestionStatus = 'draft' | 'published' | 'archived';
export type WorksheetFormat = 'A4';
export type WorksheetOrientation = 'PORTRAIT' | 'LANDSCAPE';
export type WorksheetStatus = 'active' | 'archived';
export type PlanCode = 'free' | 'premium' | 'premium_pro';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type BillingCycle = 'monthly' | 'yearly';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type UsageActionType = 'worksheet_created' | 'pdf_downloaded' | 'browser_print';

export interface AppRecord {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemSettingRecord {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  description?: string;
  updated_by?: string;
  updated_at: string;
}

export interface ProfileRecord {
  id: string;
  email: string;
  role: UserRole;
  teacher_name?: string;
  school_name?: string;
  school_logo_url?: string;
  custom_watermark?: string;
  created_at: string;
  updated_at: string;
}

export interface SubjectRecord {
  id: string;
  app_id: string;
  code: string;
  name_th: string;
  name_en?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface GradeRecord {
  id: string;
  subject_id: string;
  code: string;
  name_th: string;
  name_en?: string;
  level_number: number; // 1 to 6
  order_index: number;
  created_at: string;
}

export interface UnitRecord {
  id: string;
  grade_id: string;
  unit_number: number;
  title_th: string;
  title_en?: string;
  description?: string;
  order_index: number;
  created_at: string;
}

export interface LessonRecord {
  id: string;
  unit_id: string;
  lesson_number: number;
  title_th: string;
  title_en?: string;
  description?: string;
  order_index: number;
  created_at: string;
}

export interface ChoiceOption {
  id: string;
  text: string;
  is_correct?: boolean;
}

export interface QuestionBankRecord {
  id: string;
  app_id: string;
  subject_id: string;
  grade_id: string;
  unit_id: string;
  lesson_id: string;
  question_code: string;
  question_text: string;
  question_type: QuestionType;
  difficulty: number; // 1 to 5
  choices: ChoiceOption[];
  correct_answer: string;
  explanation?: string;
  answer_key?: string;
  curriculum_reference?: string;
  version: number;
  metadata: Record<string, any>;
  status: QuestionStatus;
  created_at: string;
  updated_at: string;
}

export interface QuestionBankNewRecord {
  id: number;
  question_code: string | null;
  subject: string | null;
  subject_code: string | null;
  school_level: string | null;
  grade: string | null;
  grade_code: string | null;
  strand: string | null;
  strand_code: string | null;
  lesson: string | null;
  lesson_code: string | null;
  learning_objective: string | null;
  core_learning_content: string | null;
  keyword: string | null;
  question_type_code: string | null;
  worksheet_format: string | null;
  difficulty: string | null;
  question: string | null;
  choice_a: string | null;
  choice_b: string | null;
  choice_c: string | null;
  choice_d: string | null;
  correct_answer: string | null;
  answer_explanation: string | null;
  solution_steps: string | null;
  learning_point: string | null;
  visual_type: string | null;
  visual_data: string | null;
  image_prompt: string | null;
  language: string | null;
  curriculum_version: string | null;
  ai_model: string | null;
  status: string | null;
  created_at: string;
}

export interface WorksheetRecord {
  id: string;
  owner_id: string;
  app_id: string;
  subject_id: string;
  grade_id: string;
  unit_id?: string;
  lesson_id?: string;
  title: string;
  worksheet_format: WorksheetFormat;
  orientation: WorksheetOrientation;
  difficulty?: number;
  question_count: number;
  settings: {
    showLogo?: boolean;
    showTeacherName?: boolean;
    showSchoolName?: boolean;
    watermarkText?: string;
    instructions?: string;
  };
  status: WorksheetStatus;
  created_at: string;
  updated_at: string;
}

export interface WorksheetQuestionRecord {
  id: string;
  worksheet_id: string;
  question_id: string;
  order_number: number;
  custom_settings: {
    points?: number;
    answerBoxHeight?: string;
    snapshot?: {
      question_text: string;
      question_type: QuestionType;
      choices: ChoiceOption[];
      correct_answer: string;
      answer_key?: string;
      explanation?: string;
      version: number;
    };
  };
  created_at: string;
}

export interface SubscriptionPlanRecord {
  id: string;
  code: PlanCode;
  name_th: string;
  name_en?: string;
  price_monthly: number;
  price_yearly: number;
  worksheet_limit: number; // -1 = Unlimited
  question_limit: number;
  pdf_limit: number;
  allow_custom_logo: boolean;
  allow_custom_watermark: boolean;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAppAccessRecord {
  id: string;
  user_id: string;
  app_id: string;
  subscription_id?: string;
  is_enabled: boolean;
  created_at: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  app_id: string;
  action_type: UsageActionType;
  reference_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface PaymentRequestRecord {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  billing_cycle: BillingCycle;
  slip_url: string;
  payment_method: string;
  status: PaymentStatus;
  user_note?: string;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransactionRecord {
  id: string;
  payment_request_id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  transaction_ref: string;
  payment_date: string;
  created_at: string;
}
