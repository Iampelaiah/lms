-- 1. Create Custom Types
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE enrollment_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Create Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role DEFAULT 'student'::user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create Subjects Table
CREATE TABLE public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Subjects Policies
CREATE POLICY "Subjects are viewable by everyone." 
ON public.subjects FOR SELECT USING (true);

CREATE POLICY "Only admins can modify subjects." 
ON public.subjects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Create Enrollments Table
CREATE TABLE public.enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    status enrollment_status DEFAULT 'pending'::enrollment_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, subject_id)
);

-- Enable RLS for enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Enrollments Policies
CREATE POLICY "Students can view their own enrollments." 
ON public.enrollments FOR SELECT USING (
  auth.uid() = student_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Students can create their own pending enrollments." 
ON public.enrollments FOR INSERT WITH CHECK (
  auth.uid() = student_id AND status = 'pending'
);

CREATE POLICY "Only admins can update enrollments." 
ON public.enrollments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Only admins can delete enrollments." 
ON public.enrollments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Seed Database (The Subjects)
INSERT INTO public.subjects (name, category, level) VALUES
-- O-Level / Core Sciences
('Combined Science', 'Core Sciences', 'O-Level'),
('Biology', 'Core Sciences', 'O-Level'),
('Physics', 'Core Sciences', 'O-Level'),
('Chemistry', 'Core Sciences', 'O-Level'),
('Mathematics', 'Core Sciences', 'O-Level'),
('Additional Mathematics', 'Core Sciences', 'O-Level'),
('Agriculture', 'Core Sciences', 'O-Level'),
('Computer Science', 'Core Sciences', 'O-Level'),

-- O-Level / Arts & Humanities
('Heritage Studies', 'Arts & Humanities', 'O-Level'),
('History', 'Arts & Humanities', 'O-Level'),
('Family and Religious Studies (FRS)', 'Arts & Humanities', 'O-Level'),
('Indigenous Languages (Shona, Ndebele)', 'Arts & Humanities', 'O-Level'),
('Literature in English', 'Arts & Humanities', 'O-Level'),
('Geography', 'Arts & Humanities', 'O-Level'),
('Musical Arts / Theatre Art', 'Arts & Humanities', 'O-Level'),

-- A-Level / Sciences & Mathematics
('Biology', 'Sciences & Mathematics', 'A-Level'),
('Chemistry', 'Sciences & Mathematics', 'A-Level'),
('Physics', 'Sciences & Mathematics', 'A-Level'),
('Mathematics', 'Sciences & Mathematics', 'A-Level'),
('Further Mathematics', 'Sciences & Mathematics', 'A-Level'),
('Computer Science', 'Sciences & Mathematics', 'A-Level'),

-- A-Level / Arts & Humanities
('Literature in English', 'Arts & Humanities', 'A-Level'),
('History', 'Arts & Humanities', 'A-Level'),
('Divinity', 'Arts & Humanities', 'A-Level'),
('Geography', 'Arts & Humanities', 'A-Level'),
('Indigenous Languages (Shona, Ndebele)', 'Arts & Humanities', 'A-Level'),
('Heritage Studies', 'Arts & Humanities', 'A-Level'),
('Sociology', 'Arts & Humanities', 'A-Level')
ON CONFLICT DO NOTHING;
