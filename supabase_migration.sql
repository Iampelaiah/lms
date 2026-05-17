-- 1. Create the ENUM type for user roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('Student', 'Tutor', 'Parent', 'School Admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create the permanent role registry table
-- This table ensures that once an email is associated with a role, it can NEVER be changed,
-- even if the user account is deleted and recreated.
CREATE TABLE IF NOT EXISTS public.permanent_role_registry (
    email TEXT PRIMARY KEY,
    role public.user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Ensure the profiles table is correctly structured
-- We add 'role' and 'is_approved' columns.
DO $$ BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role public.user_role;
    END IF;

    -- Add is_approved column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_approved') THEN
        ALTER TABLE public.profiles ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
    END IF;
EXCEPTION
    WHEN others THEN null;
END $$;

-- 4. Mapping function to normalize roles from frontend/metadata to ENUM
CREATE OR REPLACE FUNCTION public.map_to_user_role(role_text TEXT)
RETURNS public.user_role AS $$
BEGIN
    RETURN CASE
        WHEN lower(role_text) = 'student' THEN 'Student'::public.user_role
        WHEN lower(role_text) = 'tutor' THEN 'Tutor'::public.user_role
        WHEN lower(role_text) = 'parent' THEN 'Parent'::public.user_role
        WHEN lower(role_text) IN ('admin', 'school admin', 'school_admin') THEN 'School Admin'::public.user_role
        ELSE 'Student'::public.user_role -- Default fallback
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Function to handle new user registration and enforce role persistence
-- This runs whenever a new user signs up in Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    selected_role public.user_role;
    existing_role public.user_role;
BEGIN
    -- 1. Extract role from metadata (passed from frontend during signUp)
    selected_role := public.map_to_user_role(new.raw_user_meta_data->>'role');

    -- 2. Check if this email is already in our permanent registry
    SELECT role INTO existing_role FROM public.permanent_role_registry WHERE email = new.email;

    IF existing_role IS NOT NULL THEN
        -- If email exists, they MUST use the same role they originally registered with
        IF selected_role != existing_role THEN
            RAISE EXCEPTION 'This email is already registered as a %. You cannot change your role.', existing_role;
        END IF;
    ELSE
        -- First time registration for this email, lock it into the registry
        INSERT INTO public.permanent_role_registry (email, role)
        VALUES (new.email, selected_role);
    END IF;

    -- 3. Create the profile record
    -- We set is_approved to FALSE by default so Admin must activate it.
    -- (Except maybe for the first Admin, but usually handled manually)
    INSERT INTO public.profiles (id, role, is_approved, full_name, avatar_url)
    VALUES (
        new.id,
        selected_role,
        FALSE,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger for auth.users
-- This ensures the logic runs automatically on every signup.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Prevent role updates in the profiles table (Immutability)
CREATE OR REPLACE FUNCTION public.prevent_role_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        RAISE EXCEPTION 'User role is immutable and cannot be changed.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_role_immutability ON public.profiles;
CREATE TRIGGER enforce_role_immutability
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    WHEN (OLD.role IS NOT NULL)
    EXECUTE FUNCTION public.prevent_role_update();

-- 8. Backfill existing users into the permanent registry
-- This ensures current users are also locked into their existing roles.
INSERT INTO public.permanent_role_registry (email, role)
SELECT email, public.map_to_user_role(raw_user_meta_data->>'role')
FROM auth.users
WHERE email IS NOT NULL
  AND raw_user_meta_data->>'role' IS NOT NULL
ON CONFLICT (email) DO NOTHING;
