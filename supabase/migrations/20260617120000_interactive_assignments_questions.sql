-- DDL Migration for Structured Interactive Assignments, Questions, and Scores

-- 1. Add columns to curriculum_assignments
ALTER TABLE public.curriculum_assignments ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.curriculum_assignments ADD COLUMN IF NOT EXISTS past_paper_tag TEXT;
ALTER TABLE public.curriculum_assignments ADD COLUMN IF NOT EXISTS topic_tag TEXT;
ALTER TABLE public.curriculum_assignments ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;

-- 2. Create assignment_questions table
CREATE TABLE IF NOT EXISTS public.assignment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.curriculum_assignments(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    image_url TEXT,
    points INTEGER DEFAULT 10 NOT NULL,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for assignment_questions
ALTER TABLE public.assignment_questions ENABLE ROW LEVEL SECURITY;

-- Policies for assignment_questions
DROP POLICY IF EXISTS "Anyone can select questions" ON public.assignment_questions;
CREATE POLICY "Anyone can select questions" ON public.assignment_questions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tutors and admins can manage questions" ON public.assignment_questions;
CREATE POLICY "Tutors and admins can manage questions" ON public.assignment_questions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'tutor'))
    );


-- 3. Create student_question_scores table
CREATE TABLE IF NOT EXISTS public.student_question_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.assignment_questions(id) ON DELETE CASCADE NOT NULL,
    score NUMERIC NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(submission_id, question_id)
);

-- Enable RLS for student_question_scores
ALTER TABLE public.student_question_scores ENABLE ROW LEVEL SECURITY;

-- Policies for student_question_scores
DROP POLICY IF EXISTS "Students can view their own question scores" ON public.student_question_scores;
CREATE POLICY "Students can view their own question scores" ON public.student_question_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.submissions s 
            WHERE s.id = submission_id AND s.student_id = auth.uid()
        ) OR EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'tutor')
        )
    );

DROP POLICY IF EXISTS "Tutors and admins can manage question scores" ON public.student_question_scores;
CREATE POLICY "Tutors and admins can manage question scores" ON public.student_question_scores
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'tutor'))
    );


-- 4. Recreate batch_create_curriculum RPC function to support interactive assignments with banner, tags, points, and questions
CREATE OR REPLACE FUNCTION public.batch_create_curriculum(
    p_subject_id UUID,
    p_tutor_id UUID,
    p_modules JSONB
) RETURNS void AS $$
DECLARE
    mod_record RECORD;
    item_record RECORD;
    assignment_record RECORD;
    question_record RECORD;
    v_module_id UUID;
    v_item_id UUID;
    v_assignment_id UUID;
BEGIN
    FOR mod_record IN SELECT * FROM jsonb_array_elements(p_modules)
    LOOP
        -- Insert Module
        INSERT INTO public.curriculum_modules (
            subject_id, 
            tutor_id, 
            title, 
            description, 
            sequence_order,
            course_level,
            approval_status
        ) VALUES (
            p_subject_id,
            p_tutor_id,
            mod_record.value->>'title',
            mod_record.value->>'description',
            (mod_record.value->>'sequence_order')::INTEGER,
            mod_record.value->>'course_level',
            'pending_admin_review' -- Automatically set to pending
        ) RETURNING id INTO v_module_id;

        -- Insert Items
        IF mod_record.value ? 'items' THEN
            FOR item_record IN SELECT * FROM jsonb_array_elements(mod_record.value->'items')
            LOOP
                INSERT INTO public.curriculum_items (
                    module_id,
                    title,
                    item_type,
                    metadata,
                    start_date,
                    duration_minutes
                ) VALUES (
                    v_module_id,
                    item_record.value->>'title',
                    item_record.value->>'item_type',
                    (item_record.value->>'metadata')::JSONB,
                    (item_record.value->>'start_date')::TIMESTAMP WITH TIME ZONE,
                    (item_record.value->>'duration_minutes')::INTEGER
                ) RETURNING id INTO v_item_id;

                -- Insert Assignments (if any)
                IF item_record.value ? 'assignments' THEN
                    FOR assignment_record IN SELECT * FROM jsonb_array_elements(item_record.value->'assignments')
                    LOOP
                        INSERT INTO public.curriculum_assignments (
                            module_item_id,
                            assignment_number,
                            title,
                            description,
                            image_url,
                            past_paper_tag,
                            topic_tag,
                            total_points
                        ) VALUES (
                            v_item_id,
                            (assignment_record.value->>'assignment_number')::INTEGER,
                            assignment_record.value->>'title',
                            assignment_record.value->>'description',
                            assignment_record.value->>'image_url',
                            assignment_record.value->>'past_paper_tag',
                            assignment_record.value->>'topic_tag',
                            COALESCE((assignment_record.value->>'total_points')::INTEGER, 0)
                        ) RETURNING id INTO v_assignment_id;

                        -- Insert Questions (if any)
                        IF assignment_record.value ? 'questions' THEN
                            FOR question_record IN SELECT * FROM jsonb_array_elements(assignment_record.value->'questions')
                            LOOP
                                INSERT INTO public.assignment_questions (
                                    assignment_id,
                                    question_text,
                                    image_url,
                                    points,
                                    sequence_order
                                ) VALUES (
                                    v_assignment_id,
                                    question_record.value->>'question_text',
                                    question_record.value->>'image_url',
                                    COALESCE((question_record.value->>'points')::INTEGER, 10),
                                    COALESCE((question_record.value->>'sequence_order')::INTEGER, 1)
                                );
                            END LOOP;
                        END IF;
                    END LOOP;
                END IF;
            END LOOP;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
