-- ==============================================================================
-- BrightPath CRM — Optional Workshop Seed Data
-- ==============================================================================
-- Instructions:
-- Run this script in the Supabase SQL Editor AFTER at least one user has signed up
-- or after applying the main migration. It will attach sample leads and follow-ups
-- to your currently existing profile.
-- ==============================================================================

DO $$
DECLARE
  v_user_id uuid;
  v_lead_id_1 uuid;
  v_lead_id_2 uuid;
  v_lead_id_3 uuid;
  v_lead_id_4 uuid;
  v_lead_id_5 uuid;
BEGIN
  -- Grab the first profile in the system to act as lead creator/assignee
  SELECT id INTO v_user_id FROM public.profiles LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No profile found in public.profiles. Please sign up or create a user before running this seed script.';
    RETURN;
  END IF;

  -- 1. Create Lead: Aarav Sharma (Contacted)
  INSERT INTO public.leads (
    full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes
  ) VALUES (
    'Aarav Sharma',
    'aarav.sharma@example.com',
    '+91 98765 43210',
    'JEE Advanced 2-Year Program',
    'Website',
    'Contacted',
    v_user_id,
    v_user_id,
    'Parent enquired about morning batch timing and scholarship test syllabus.'
  ) RETURNING id INTO v_lead_id_1;

  -- 2. Create Lead: Priya Patel (Qualified)
  INSERT INTO public.leads (
    full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes
  ) VALUES (
    'Priya Patel',
    'priya.p@example.com',
    '+91 98234 56789',
    'NEET FastTrack 2027',
    'Walk-in',
    'Qualified',
    v_user_id,
    v_user_id,
    'Student visited campus with father. Highly motivated for biology batch.'
  ) RETURNING id INTO v_lead_id_2;

  -- 3. Create Lead: Rohan Mehra (New)
  INSERT INTO public.leads (
    full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes
  ) VALUES (
    'Rohan Mehra',
    'rohan.m@example.com',
    '+91 98111 22334',
    'Foundation Grade 10 Math & Science',
    'Referral',
    'New',
    v_user_id,
    v_user_id,
    'Referred by Grade 12 alumnus. Needs callback after 4:00 PM.'
  ) RETURNING id INTO v_lead_id_3;

  -- 4. Create Lead: Ananya Deshmukh (Converted)
  INSERT INTO public.leads (
    full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes
  ) VALUES (
    'Ananya Deshmukh',
    'ananya.d@example.com',
    '+91 99887 76655',
    'JEE Crash Course 2026',
    'Phone Call',
    'Converted',
    v_user_id,
    v_user_id,
    'First installment paid. Batch allotment confirmed.'
  ) RETURNING id INTO v_lead_id_4;

  -- 5. Create Lead: Vikram Joshi (Lost)
  INSERT INTO public.leads (
    full_name, email, phone, course_interest, source, status, lost_reason, assigned_to, created_by, notes
  ) VALUES (
    'Vikram Joshi',
    'vikram.j@example.com',
    '+91 91234 56780',
    'Olympiad Advanced Foundation',
    'Social Media',
    'Lost',
    'Relocating to another city before term starts',
    v_user_id,
    v_user_id,
    'Family moving to Pune next month.'
  ) RETURNING id INTO v_lead_id_5;

  -- Add Follow-ups
  -- Overdue Follow-up for Lead 1
  INSERT INTO public.follow_ups (
    lead_id, assigned_to, due_at, note, status, created_by
  ) VALUES (
    v_lead_id_1,
    v_user_id,
    now() - interval '2 hours',
    'Call parent to confirm scholarship examination registration',
    'pending',
    v_user_id
  );

  -- Upcoming Follow-up for Lead 2
  INSERT INTO public.follow_ups (
    lead_id, assigned_to, due_at, note, status, created_by
  ) VALUES (
    v_lead_id_2,
    v_user_id,
    now() + interval '1 day',
    'Send fee breakdown PDF and arrange meeting with biology faculty',
    'pending',
    v_user_id
  );

  -- Completed Follow-up for Lead 4
  INSERT INTO public.follow_ups (
    lead_id, assigned_to, due_at, note, status, completed_at, created_by
  ) VALUES (
    v_lead_id_4,
    v_user_id,
    now() - interval '1 day',
    'Verify bank transaction receipt and issue admission confirmation letter',
    'completed',
    now() - interval '12 hours',
    v_user_id
  );

  -- Add Activities
  INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
  VALUES
    (v_lead_id_1, v_user_id, 'created', 'Enquiry registered via Website Form'),
    (v_lead_id_1, v_user_id, 'status_change', 'Status updated to Contacted after initial screening call'),
    (v_lead_id_2, v_user_id, 'created', 'Walk-in enquiry recorded at campus reception'),
    (v_lead_id_4, v_user_id, 'status_change', 'Status advanced to Converted upon fee settlement');

  RAISE NOTICE 'Successfully seeded sample leads, follow-ups, and activities for user ID %', v_user_id;
END;
$$;
