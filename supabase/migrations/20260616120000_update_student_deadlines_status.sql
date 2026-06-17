-- Drop the existing constraint if it exists
ALTER TABLE public.student_deadlines DROP CONSTRAINT IF EXISTS student_deadlines_status_check;

-- Add the new constraint supporting the admin validation workflow
ALTER TABLE public.student_deadlines ADD CONSTRAINT student_deadlines_status_check 
    CHECK (status IN ('pending_admin_review', 'pending', 'submitted', 'completed', 'rejected', 'overdue'));

-- Update Row Level Security Policies to allow Admins to view and update deadlines
DROP POLICY IF EXISTS "Admins can view all deadlines." ON public.student_deadlines;
CREATE POLICY "Admins can view all deadlines." ON public.student_deadlines
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Admins can update deadlines." ON public.student_deadlines;
CREATE POLICY "Admins can update deadlines." ON public.student_deadlines
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
