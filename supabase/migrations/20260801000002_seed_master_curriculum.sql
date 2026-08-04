-- Master Curriculum Seed Data for MathBoxx Primary
-- App: mathboxx_primary
-- Parent Chain: MATH -> P4 -> NUM_ALG_OP -> OPNFD

-- 1. Insert Subject 'MATH'
INSERT INTO public.subjects (app_id, code, name_th, name_en, order_index, is_active)
SELECT id, 'MATH', 'คณิตศาสตร์', 'Mathematics', 1, true
FROM public.apps
WHERE code = 'mathboxx_primary'
ON CONFLICT (app_id, code) DO UPDATE
SET name_th = EXCLUDED.name_th, name_en = EXCLUDED.name_en, is_active = true;

-- 2. Insert Grade 'P4'
INSERT INTO public.grades (subject_id, code, level_number, name_th, name_en, order_index)
SELECT s.id, 'P4', 4, 'ประถมศึกษาปีที่ 4', 'Primary 4', 4
FROM public.subjects s
JOIN public.apps a ON a.id = s.app_id
WHERE a.code = 'mathboxx_primary' AND s.code = 'MATH'
ON CONFLICT (subject_id, code) DO UPDATE
SET level_number = EXCLUDED.level_number, name_th = EXCLUDED.name_th, name_en = EXCLUDED.name_en;

-- 3. Insert Unit 'NUM_ALG_OP'
INSERT INTO public.units (grade_id, unit_number, code, name_th, name_en, description, order_index)
SELECT g.id, 1, 'NUM_ALG_OP', 'จำนวนและพีชคณิต', 'Numbers and Algebra', 'การบวก ลบ คูณ หาร จำนวนนับ เศษส่วน และทศนิยม', 1
FROM public.grades g
JOIN public.subjects s ON s.id = g.subject_id
JOIN public.apps a ON a.id = s.app_id
WHERE a.code = 'mathboxx_primary' AND s.code = 'MATH' AND g.code = 'P4'
ON CONFLICT (grade_id, code) DO UPDATE
SET unit_number = EXCLUDED.unit_number, name_th = EXCLUDED.name_th, name_en = EXCLUDED.name_en, description = EXCLUDED.description;

-- 4. Insert Lesson 'OPNFD'
INSERT INTO public.lessons (unit_id, lesson_number, code, name_th, name_en, description, order_index)
SELECT u.id, 1, 'OPNFD', 'บวก ลบ คูณ หาร จำนวนนับ เศษส่วน และทศนิยม', 'Addition, Subtraction, Multiplication, Division of Numbers, Fractions, and Decimals', 'ประมาณและหาผลลัพธ์การบวก ลบ คูณ หารระคน', 1
FROM public.units u
JOIN public.grades g ON g.id = u.grade_id
JOIN public.subjects s ON s.id = g.subject_id
JOIN public.apps a ON a.id = s.app_id
WHERE a.code = 'mathboxx_primary' AND s.code = 'MATH' AND g.code = 'P4' AND u.code = 'NUM_ALG_OP'
ON CONFLICT (unit_id, code) DO UPDATE
SET lesson_number = EXCLUDED.lesson_number, name_th = EXCLUDED.name_th, name_en = EXCLUDED.name_en, description = EXCLUDED.description;
