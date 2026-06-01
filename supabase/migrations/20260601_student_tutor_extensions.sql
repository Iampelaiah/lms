-- SQL Migration for Tutor-Student dashboard features: Messages & Deadlines

-- 1. Create Messages Table
CREATE TABLE IF NOT EXISTS public.student_tutor_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.student_tutor_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Messages
DROP POLICY IF EXISTS "Users can view their own messages." ON public.student_tutor_messages;
CREATE POLICY "Users can view their own messages." ON public.student_tutor_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can insert their own messages." ON public.student_tutor_messages;
CREATE POLICY "Users can insert their own messages." ON public.student_tutor_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- 2. Create Deadlines Table
CREATE TABLE IF NOT EXISTS public.student_deadlines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'completed', 'overdue'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.student_deadlines ENABLE ROW LEVEL SECURITY;

-- Policies for Deadlines
DROP POLICY IF EXISTS "Users can view their own deadlines." ON public.student_deadlines;
CREATE POLICY "Users can view their own deadlines." ON public.student_deadlines
    FOR SELECT USING (auth.uid() = tutor_id OR auth.uid() = student_id);

DROP POLICY IF EXISTS "Tutors can manage deadlines." ON public.student_deadlines;
CREATE POLICY "Tutors can manage deadlines." ON public.student_deadlines
    FOR ALL USING (auth.uid() = tutor_id);

-- 3. Update Enrollments select policy to allow tutors to view their assigned students
DROP POLICY IF EXISTS "Students can view their own enrollments." ON public.enrollments;
CREATE POLICY "Students can view their own enrollments." 
ON public.enrollments FOR SELECT USING (
  auth.uid() = student_id OR
  auth.uid() = tutor_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

