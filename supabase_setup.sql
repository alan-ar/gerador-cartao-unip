-- ==========================================
-- 0. CLEAN RESET (Clean Slate)
-- ==========================================
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.secret_codes CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP FUNCTION IF EXISTS public.validate_secret_code;
-- 1. Table: students (Renamed from 'alunos')
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document_id TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  course TEXT NOT NULL,
  campus TEXT NOT NULL,
  registration_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent duplicate registration numbers
  CONSTRAINT unique_registration_id UNIQUE (registration_id)
);
-- Enable RLS for students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
-- 2. Table: profiles (Already in English)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'BRONZE' CHECK (status IN ('BRONZE', 'SILVER', 'GOLD')),
  terms_accepted BOOLEAN DEFAULT FALSE,
  secret_code_used TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. Table: secret_codes (Already in English)
CREATE TABLE IF NOT EXISTS public.secret_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
-- 4. ACCESS POLICIES (RLS)
-- Profiles: Users see own. Admins see all.
CREATE POLICY "Users can view their own profile" ON public.profiles FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
-- Students: Users manage their own records.
CREATE POLICY "Users manage their own students" ON public.students FOR ALL USING (auth.uid() = user_id);
-- Secret Codes: Admins manage all. Authenticated users select.
CREATE POLICY "Admins manage secret codes" ON public.secret_codes FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
CREATE POLICY "Authenticated users view secret codes" ON public.secret_codes FOR
SELECT USING (auth.role() = 'authenticated');
-- 5. TRIGGER FOR AUTOMATIC PROFILE CREATION
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.profiles (id, email, full_name, avatar_url, role, status)
VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    'user',
    'BRONZE'
  );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- 6. RPC FOR ATOMIC SECRET CODE VALIDATION
CREATE OR REPLACE FUNCTION public.validate_secret_code(p_code TEXT) RETURNS BOOLEAN AS $$
DECLARE v_user_id UUID;
v_code_exists BOOLEAN;
BEGIN v_user_id := auth.uid();
-- Check authentication
IF v_user_id IS NULL THEN RAISE EXCEPTION 'User not authenticated';
END IF;
-- Check secret code exists and is active
SELECT EXISTS (
    SELECT 1
    FROM public.secret_codes
    WHERE code = p_code
      AND is_active = true
  ) INTO v_code_exists;
IF NOT v_code_exists THEN RAISE EXCEPTION 'Invalid or expired code';
END IF;
-- Upgrade Profile to SILVER
UPDATE public.profiles
SET status = 'SILVER',
  secret_code_used = p_code,
  terms_accepted = true,
  updated_at = NOW()
WHERE id = v_user_id;
RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 7. SEED INITIAL DATA (Optional)
-- Insert an initial master code for first onboarding
INSERT INTO public.secret_codes (code, is_active)
VALUES ('UNIP2024', true);
