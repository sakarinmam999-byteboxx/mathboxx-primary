-- MathBoxx Primary — Master Row Level Security (RLS) Policies Migration
-- Migration Name: 20260801000001_enable_rls_security.sql
-- Target Database: PostgreSQL / Supabase Platform
-- Status: Phase 2 Step 4 (Row Level Security & Access Policies)

-- ============================================================================
-- 1. SECURITY DEFINER HELPER FUNCTION
-- ============================================================================

-- Function to check if the authenticated user has 'admin' role in public.profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution to authenticated & anon roles
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- ============================================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS) ON ALL 16 TABLES
-- ============================================================================

ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worksheet_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_app_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. RLS POLICIES FOR SYSTEM DOMAIN
-- ============================================================================

-- Table: apps
CREATE POLICY "apps_select_policy" ON public.apps
    FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "apps_admin_all_policy" ON public.apps
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Table: system_settings
CREATE POLICY "system_settings_select_policy" ON public.system_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "system_settings_admin_all_policy" ON public.system_settings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- 4. RLS POLICIES FOR USER DOMAIN
-- ============================================================================

-- Table: profiles
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated, anon;

CREATE POLICY "profiles_owner_select" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_owner_insert" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "profiles_owner_update" ON public.profiles
    FOR UPDATE USING (id = auth.uid() OR auth.role() = 'authenticated')
    WITH CHECK (id = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "profiles_admin_delete" ON public.profiles
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 5. RLS POLICIES FOR CURRICULUM DOMAIN
-- ============================================================================

-- Table: subjects
CREATE POLICY "subjects_select_policy" ON public.subjects
    FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "subjects_admin_all_policy" ON public.subjects
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Table: grades
CREATE POLICY "grades_select_policy" ON public.grades
    FOR SELECT USING (true);

CREATE POLICY "grades_admin_all_policy" ON public.grades
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Table: units
CREATE POLICY "units_select_policy" ON public.units
    FOR SELECT USING (true);

CREATE POLICY "units_admin_all_policy" ON public.units
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Table: lessons
CREATE POLICY "lessons_select_policy" ON public.lessons
    FOR SELECT USING (true);

CREATE POLICY "lessons_admin_all_policy" ON public.lessons
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- 6. RLS POLICIES FOR QUESTION DOMAIN
-- ============================================================================

-- Table: question_bank (Published questions readable by authorized app users or admins)
CREATE POLICY "question_bank_select_policy" ON public.question_bank
    FOR SELECT USING (
        (status = 'published' AND (
            app_id IN (
                SELECT uaa.app_id FROM public.user_app_access uaa
                WHERE uaa.user_id = auth.uid() AND uaa.is_enabled = true
            ) OR app_id IN (
                SELECT a.id FROM public.apps a WHERE a.code = 'mathboxx_primary'
            )
        )) OR public.is_admin()
    );

CREATE POLICY "question_bank_admin_all_policy" ON public.question_bank
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- 7. RLS POLICIES FOR WORKSHEET DOMAIN
-- ============================================================================

-- Table: worksheets
CREATE POLICY "worksheets_owner_select" ON public.worksheets
    FOR SELECT USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "worksheets_owner_insert" ON public.worksheets
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "worksheets_owner_update" ON public.worksheets
    FOR UPDATE USING (owner_id = auth.uid() OR public.is_admin())
    WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "worksheets_owner_delete" ON public.worksheets
    FOR DELETE USING (owner_id = auth.uid() OR public.is_admin());

-- Table: worksheet_questions (Inherits access from parent worksheet owner)
CREATE POLICY "worksheet_questions_owner_select" ON public.worksheet_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.worksheets w
            WHERE w.id = worksheet_id AND (w.owner_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "worksheet_questions_owner_insert" ON public.worksheet_questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.worksheets w
            WHERE w.id = worksheet_id AND w.owner_id = auth.uid()
        )
    );

CREATE POLICY "worksheet_questions_owner_update" ON public.worksheet_questions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.worksheets w
            WHERE w.id = worksheet_id AND (w.owner_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "worksheet_questions_owner_delete" ON public.worksheet_questions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.worksheets w
            WHERE w.id = worksheet_id AND (w.owner_id = auth.uid() OR public.is_admin())
        )
    );

-- ============================================================================
-- 8. RLS POLICIES FOR SUBSCRIPTION DOMAIN
-- ============================================================================

-- Table: subscription_plans
CREATE POLICY "subscription_plans_select_policy" ON public.subscription_plans
    FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "subscription_plans_admin_all_policy" ON public.subscription_plans
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Table: subscriptions
CREATE POLICY "subscriptions_owner_select" ON public.subscriptions
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "subscriptions_admin_all_policy" ON public.subscriptions
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Table: user_app_access
CREATE POLICY "user_app_access_owner_select" ON public.user_app_access
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_app_access_admin_all_policy" ON public.user_app_access
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- 9. RLS POLICIES FOR USAGE DOMAIN
-- ============================================================================

-- Table: usage_records (Insert-only Audit Log for teachers, read-only for owner/admin)
CREATE POLICY "usage_records_owner_select" ON public.usage_records
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "usage_records_owner_insert" ON public.usage_records
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Note: No UPDATE or DELETE policies created for usage_records to guarantee audit log immutability.

-- ============================================================================
-- 10. RLS POLICIES FOR PAYMENT DOMAIN
-- ============================================================================

-- Table: payment_requests
CREATE POLICY "payment_requests_owner_select" ON public.payment_requests
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "payment_requests_owner_insert" ON public.payment_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "payment_requests_admin_update" ON public.payment_requests
    FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "payment_requests_admin_delete" ON public.payment_requests
    FOR DELETE USING (public.is_admin());

-- Table: payment_transactions (Immutable financial transactions log)
CREATE POLICY "payment_transactions_owner_select" ON public.payment_transactions
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "payment_transactions_admin_all_policy" ON public.payment_transactions
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
