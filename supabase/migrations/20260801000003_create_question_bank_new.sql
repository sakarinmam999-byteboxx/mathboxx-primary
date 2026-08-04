-- Migration: Create public.question_bank_new table matching standard CSV schema exactly
-- File: supabase/migrations/20260801000003_create_question_bank_new.sql

CREATE TABLE IF NOT EXISTS public.question_bank_new (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_code TEXT UNIQUE,
    subject TEXT,
    subject_code TEXT,
    school_level TEXT,
    grade TEXT,
    grade_code TEXT,
    strand TEXT,
    strand_code TEXT,
    lesson TEXT,
    lesson_code TEXT,
    learning_objective TEXT,
    core_learning_content TEXT,
    keyword TEXT,
    question_type_code TEXT,
    worksheet_format TEXT,
    difficulty TEXT,
    question TEXT,
    choice_a TEXT,
    choice_b TEXT,
    choice_c TEXT,
    choice_d TEXT,
    correct_answer TEXT,
    answer_explanation TEXT,
    solution_steps TEXT,
    learning_point TEXT,
    visual_type TEXT,
    visual_data TEXT,
    image_prompt TEXT,
    language TEXT,
    curriculum_version TEXT,
    ai_model TEXT,
    status TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Index for question_code lookup
CREATE INDEX IF NOT EXISTS idx_question_bank_new_code ON public.question_bank_new(question_code);
