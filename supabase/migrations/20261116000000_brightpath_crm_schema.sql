-- ==============================================================================
-- BrightPath CRM — Master Database Migration Script
-- Version: 20261116000000
-- Target Engine: PostgreSQL 15+ (Supabase)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE
-- Extends Supabase auth.users with CRM staff profile & role information
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'counsellor')) DEFAULT 'counsellor',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. LEADS TABLE
-- Core admissions pipeline: tracks student enquiries, courses, and statuses
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NULL,
  phone text NOT NULL,
  course_interest text NOT NULL,
  source text NOT NULL CHECK (source IN ('Website', 'Walk-in', 'Phone Call', 'Referral', 'Social Media', 'Other')),
  status text NOT NULL CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')) DEFAULT 'New',
  lost_reason text NULL,
  assigned_to uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. FOLLOW_UPS TABLE
-- Scheduled callbacks and meetings with students
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  due_at timestamptz NOT NULL,
  note text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  completed_at timestamptz NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. ACTIVITIES TABLE
-- Immutable chronological audit trail of lead events and status changes
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  activity_type text NOT NULL CHECK (activity_type IN ('created', 'status_change', 'note', 'followup_created', 'followup_completed')),
  description text NOT NULL,
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follow_ups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_assigned_to ON public.follow_ups(assigned_to);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due_at ON public.follow_ups(due_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON public.follow_ups(status);

CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- ==============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- A. Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_leads_updated_at ON public.leads;
CREATE TRIGGER tr_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- B. Safe role lookup function (avoids RLS recursion loops)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- C. Automatically provision profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'counsellor' -- Default least-privileged role
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name
  WHERE public.profiles.full_name IS NULL;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- D. Prevent self-elevation of roles (only Admins can update roles)
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role AND public.get_my_role() != 'admin' THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can modify staff roles.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_role_escalation ON public.profiles;
CREATE TRIGGER tr_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all CRM tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles are readable by authenticated staff" ON public.profiles;
CREATE POLICY "Profiles are readable by authenticated staff"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update their own full_name" ON public.profiles;
CREATE POLICY "Users can update their own full_name"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------------------
-- LEADS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Leads viewable based on role and ownership" ON public.leads;
CREATE POLICY "Leads viewable based on role and ownership"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    public.get_my_role() IN ('admin', 'manager') OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Staff can insert new leads" ON public.leads;
CREATE POLICY "Staff can insert new leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Leads updatable based on role and ownership" ON public.leads;
CREATE POLICY "Leads updatable based on role and ownership"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() IN ('admin', 'manager') OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  )
  WITH CHECK (
    public.get_my_role() IN ('admin', 'manager') OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Only managers and admins can delete leads" ON public.leads;
CREATE POLICY "Only managers and admins can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() IN ('admin', 'manager')
  );

-- ------------------------------------------------------------------------------
-- FOLLOW_UPS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Follow-ups viewable for accessible leads" ON public.follow_ups;
CREATE POLICY "Follow-ups viewable for accessible leads"
  ON public.follow_ups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = follow_ups.lead_id
      AND (
        public.get_my_role() IN ('admin', 'manager') OR
        leads.assigned_to = auth.uid() OR
        leads.created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Staff can create follow-ups for accessible leads" ON public.follow_ups;
CREATE POLICY "Staff can create follow-ups for accessible leads"
  ON public.follow_ups FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = follow_ups.lead_id
      AND (
        public.get_my_role() IN ('admin', 'manager') OR
        leads.assigned_to = auth.uid() OR
        leads.created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Staff can update follow-ups for accessible leads" ON public.follow_ups;
CREATE POLICY "Staff can update follow-ups for accessible leads"
  ON public.follow_ups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = follow_ups.lead_id
      AND (
        public.get_my_role() IN ('admin', 'manager') OR
        leads.assigned_to = auth.uid() OR
        leads.created_by = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = follow_ups.lead_id
      AND (
        public.get_my_role() IN ('admin', 'manager') OR
        leads.assigned_to = auth.uid() OR
        leads.created_by = auth.uid()
      )
    )
  );

-- ------------------------------------------------------------------------------
-- ACTIVITIES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Activities viewable for accessible leads" ON public.activities;
CREATE POLICY "Activities viewable for accessible leads"
  ON public.activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = activities.lead_id
      AND (
        public.get_my_role() IN ('admin', 'manager') OR
        leads.assigned_to = auth.uid() OR
        leads.created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Staff can insert activity logs for accessible leads" ON public.activities;
CREATE POLICY "Staff can insert activity logs for accessible leads"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = activities.lead_id
      AND (
        public.get_my_role() IN ('admin', 'manager') OR
        leads.assigned_to = auth.uid() OR
        leads.created_by = auth.uid()
      )
    )
  );
