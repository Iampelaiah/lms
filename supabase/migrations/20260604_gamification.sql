-- Add a gamification score column to the profiles table
ALTER TABLE public.profiles ADD COLUMN gamification_score INTEGER DEFAULT 0 NOT NULL;

-- Create an RPC function to safely award points without overriding concurrent updates
CREATE OR REPLACE FUNCTION award_points(user_id UUID, points INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET gamification_score = gamification_score + points
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
