# Supabase Database Setup Guide

This guide walks you through applying the BrightPath CRM database migration, enabling Row Level Security (RLS), and seeding demo records.

---

## Step 1: Open the Supabase SQL Editor

1. Navigate to your [Supabase Dashboard](https://supabase.com/dashboard) and select your project (`brightpath-crm`).
2. In the left-hand navigation menu, click the **SQL Editor** icon (represented by `>_`).
3. Click **New query** in the top-right corner.

---

## Step 2: Run the Master Schema Migration

1. Open the file [supabase/migrations/20261116000000_brightpath_crm_schema.sql](../supabase/migrations/20261116000000_brightpath_crm_schema.sql).
2. Copy the entire contents of that file.
3. Paste the SQL into the Supabase SQL Editor query pane.
4. Click the green **Run** button (or press `Ctrl+Enter` / `Cmd+Enter`).
5. You should see `Success. No rows returned` in the output panel.

### What this migration creates:
* **`profiles`**: Linked to `auth.users`, with roles (`admin`, `manager`, `counsellor`).
* **`leads`**: Student enquiry pipeline with constraints, sources, and statuses.
* **`follow_ups`**: Scheduled callback queue with status tracking and timestamps.
* **`activities`**: Chronological audit timeline of lead lifecycle events.
* **Row Level Security (RLS)**: Enforces access control based on role and lead ownership.
* **Triggers**: Automatically creates a profile when a user signs up.

---

## Step 3: Verify Tables in the Supabase Table Editor

1. In the left-hand menu, click the **Table Editor** icon.
2. Confirm that all 4 tables exist under the `public` schema:
   * `profiles`
   * `leads`
   * `follow_ups`
   * `activities`
3. Notice the small **RLS Enabled** lock icon next to each table name.

---

## Step 4: (Optional) Seed Demo Data

Once you sign up your first staff user in Phase 4:
1. Open the **SQL Editor** in Supabase.
2. Copy the SQL from [supabase/seed.sql](../supabase/seed.sql).
3. Paste and click **Run**.
4. This will attach 5 sample student leads (JEE, NEET, Olympiad) and follow-ups to your user profile so you can test the UI with real data immediately!
