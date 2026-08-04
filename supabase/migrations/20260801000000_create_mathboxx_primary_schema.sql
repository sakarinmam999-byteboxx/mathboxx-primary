-- MathBoxx Primary — Master Database Schema Migration
-- Migration Name: 20260801000000_create_mathboxx_primary_schema.sql
-- Target Database: PostgreSQL / Supabase Platform
-- Status: Phase 2 Step 3 (16 Core Tables Schema Creation)

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. SYSTEM DOMAIN TABLES
-- ============================================================================

-- Table: apps
CREATE TABLE IF NOT EXISTS public.apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for apps.code
CREATE INDEX IF NOT EXISTS idx_apps_code ON public.apps(code);

-- ============================================================================
-- 2. USER DOMAIN TABLES
-- ============================================================================

-- Table: profiles (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
    teacher_name VARCHAR(150),
    school_name VARCHAR(200),
    school_logo_url TEXT,
    custom_watermark VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for profiles.role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Table: system_settings (Platform Global Settings)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for system_settings.setting_key
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(setting_key);

-- ============================================================================
-- 3. CURRICULUM DOMAIN TABLES
-- ============================================================================

-- Table: subjects (App-Specific Curriculum)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name_th VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_subjects_app_code UNIQUE (app_id, code)
);

-- Index for subjects lookup
CREATE INDEX IF NOT EXISTS idx_subjects_app_code ON public.subjects(app_id, code);

-- Table: grades (p.1 - p.6)
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name_th VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    level_number INT NOT NULL CHECK (level_number BETWEEN 1 AND 6),
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for grades lookup
CREATE INDEX IF NOT EXISTS idx_grades_subject_level ON public.grades(subject_id, level_number);

-- Table: units
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    unit_number INT NOT NULL,
    title_th VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for units lookup
CREATE INDEX IF NOT EXISTS idx_units_grade_number ON public.units(grade_id, unit_number);

-- Table: lessons
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    lesson_number INT NOT NULL,
    title_th VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for lessons lookup
CREATE INDEX IF NOT EXISTS idx_lessons_unit_number ON public.lessons(unit_id, lesson_number);

-- ============================================================================
-- 4. QUESTION DOMAIN TABLES
-- ============================================================================

-- Table: question_bank
CREATE TABLE IF NOT EXISTS public.question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    grade_id UUID NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    question_code VARCHAR(50) NOT NULL UNIQUE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL CHECK (question_type IN ('multiple_choice', 'fill_in_blank', 'matching', 'subjective')),
    difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    choices JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    answer_key TEXT,
    curriculum_reference VARCHAR(100),
    version INT NOT NULL DEFAULT 1,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for question_bank
CREATE INDEX IF NOT EXISTS idx_question_bank_lookup ON public.question_bank(app_id, subject_id, grade_id, unit_id, lesson_id, status);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON public.question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_bank_type ON public.question_bank(question_type);

-- ============================================================================
-- 5. WORKSHEET DOMAIN TABLES
-- ============================================================================

-- Table: worksheets
CREATE TABLE IF NOT EXISTS public.worksheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    grade_id UUID NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    worksheet_format VARCHAR(20) NOT NULL DEFAULT 'A4',
    orientation VARCHAR(20) NOT NULL DEFAULT 'PORTRAIT' CHECK (orientation IN ('PORTRAIT', 'LANDSCAPE')),
    difficulty INT CHECK (difficulty BETWEEN 1 AND 5),
    question_count INT NOT NULL DEFAULT 10,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for worksheets owner lookup
CREATE INDEX IF NOT EXISTS idx_worksheets_owner ON public.worksheets(owner_id, created_at DESC);

-- Table: worksheet_questions (Junction Table with Question Snapshot in custom_settings)
CREATE TABLE IF NOT EXISTS public.worksheet_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worksheet_id UUID NOT NULL REFERENCES public.worksheets(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.question_bank(id) ON DELETE RESTRICT,
    order_number INT NOT NULL,
    custom_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_worksheet_questions_order UNIQUE (worksheet_id, order_number)
);

-- Index for worksheet_questions lookup
CREATE INDEX IF NOT EXISTS idx_worksheet_questions_lookup ON public.worksheet_questions(worksheet_id, order_number);

-- ============================================================================
-- 6. SUBSCRIPTION DOMAIN TABLES
-- ============================================================================

-- Table: subscription_plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name_th VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    worksheet_limit INT NOT NULL, -- -1 = unlimited
    question_limit INT NOT NULL,
    pdf_limit INT NOT NULL DEFAULT -1, -- -1 = unlimited
    allow_custom_logo BOOLEAN NOT NULL DEFAULT false,
    allow_custom_watermark BOOLEAN NOT NULL DEFAULT false,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for subscription_plans.code
CREATE INDEX IF NOT EXISTS idx_subscription_plans_code ON public.subscription_plans(code);

-- Table: subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
    billing_cycle VARCHAR(10) NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date TIMESTAMPTZ,
    auto_renew BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for subscriptions lookup
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);

-- Table: user_app_access (Junction Table for Multi-App Access)
CREATE TABLE IF NOT EXISTS public.user_app_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_app_access UNIQUE (user_id, app_id)
);

-- Index for user_app_access lookup
CREATE INDEX IF NOT EXISTS idx_user_app_access_lookup ON public.user_app_access(user_id, app_id);

-- ============================================================================
-- 7. USAGE DOMAIN TABLES
-- ============================================================================

-- Table: usage_records (Audit Log & Quota Enforcement Rules)
CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('worksheet_created', 'pdf_downloaded', 'browser_print')),
    reference_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for usage_records lookup and quota calculation
CREATE INDEX IF NOT EXISTS idx_usage_records_user_monthly ON public.usage_records(user_id, action_type, created_at);

-- ============================================================================
-- 8. PAYMENT DOMAIN TABLES
-- ============================================================================

-- Table: payment_requests
CREATE TABLE IF NOT EXISTS public.payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    amount NUMERIC(10,2) NOT NULL,
    billing_cycle VARCHAR(10) NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    slip_url TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    user_note TEXT,
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for payment_requests status queue
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.payment_requests(status, created_at DESC);

-- Table: payment_transactions (Enforces 1:1 Relationship with payment_requests via UNIQUE constraint)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_request_id UUID NOT NULL UNIQUE REFERENCES public.payment_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE RESTRICT,
    amount NUMERIC(10,2) NOT NULL,
    transaction_ref VARCHAR(100) NOT NULL UNIQUE,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for payment_transactions reference lookup
CREATE INDEX IF NOT EXISTS idx_payment_tx_ref ON public.payment_transactions(transaction_ref);

-- ============================================================================
-- INITIAL SEED DATA (System App Definition & Subscription Plans)
-- ============================================================================

INSERT INTO public.apps (code, name, description)
VALUES ('mathboxx_primary', 'MathBoxx Primary', 'ระบบสร้างและจัดการใบงานคณิตศาสตร์ประถมศึกษา (ป.1 - ป.6)')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subscription_plans (code, name_th, name_en, price_monthly, price_yearly, worksheet_limit, question_limit, pdf_limit, allow_custom_logo, allow_custom_watermark, features)
VALUES 
  ('free', 'Free Starter', 'Free Starter', 0.00, 0.00, 5, 10, -1, false, false, '["สร้างใบงาน 5 ใบงาน/เดือน", "คลังข้อสอบ ป.1 - ป.6", "ลายน้ำมาตรฐาน"]'::jsonb),
  ('premium', 'Premium Teacher', 'Premium Teacher', 199.00, 1990.00, 50, 30, -1, true, true, '["สร้างใบงาน 50 ใบงาน/เดือน", "ข้อสอบสูงสุด 30 ข้อ", "โลโก้โรงเรียนส่วนตัว", "ลายน้ำส่วนตัว"]'::jsonb),
  ('premium_pro', 'Premium Pro', 'Premium Pro', 399.00, 3990.00, 100, 50, -1, true, true, '["สร้างใบงาน 100 ใบงาน/เดือน", "ข้อสอบสูงสุด 50 ข้อ", "โลโก้โรงเรียนส่วนตัว", "ลายน้ำส่วนตัว", "VIP Support"]'::jsonb)
ON CONFLICT (code) DO NOTHING;
