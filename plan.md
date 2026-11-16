# BrightPath CRM — Master Implementation Plan

> **Reference Document**: `BrightPath_CRM_Full_Master_Build_Prompt.docx`  
> **Target Stack**: React 19 + TypeScript + Vite • Supabase (PostgreSQL & Auth with RLS) • Tailwind CSS • Lucide Icons • Vercel  
> **Working Principle**: Build an MVP-first, security-conscious CRM for BrightPath Academy. Each feature is developed, tested locally, verified, deployed to Vercel, tested on the live URL, and approved before proceeding to the next.

---

## 1. Feature-Wise Iteration Lifecycle

Every phase strictly follows this 6-step loop:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        FEATURE-WISE IMPLEMENTATION LIFECYCLE                           │
├───────────────┬────────────────────────────────────────────────────────────────────────┤
│ 1. DEVELOP    │ Implement files, logic, types, and UI strictly for that feature        │
│ 2. TEST LOCAL │ Execute local build, typecheck, and end-to-end browser check           │
│ 3. VERIFY     │ Check all acceptance criteria and security rules against specification │
│ 4. DEPLOY     │ Commit to Git (`feat: ...`) and deploy to Vercel                       │
│ 5. TEST LIVE  │ Open live Vercel URL, run verification scenarios in production         │
│ 6. APPROVAL   │ Report exact test results and await user approval for the next feature │
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Master Database Architecture & Security Model

### Tables & Relationships

```
               ┌────────────────┐
               │   auth.users   │
               └───────┬────────┘
                       │ 1:1
                       ▼
               ┌────────────────┐
         ┌────►│    profiles    │◄────┐
         │     └───────┬────────┘     │
         │             │ 1:N          │
created_by /           ▼              │ actor_id /
assigned_to    ┌────────────────┐     │ assigned_to
         │     │     leads      │     │
         │     └───────┬────────┘     │
         │             │ 1:N          │
         │             ▼              │
         ├────►┌────────────────┐     │
         │     │   follow_ups   │     │
         │     └────────────────┘     │
         │                            │
         └────►┌────────────────┐     │
               │   activities   │─────┘
               └────────────────┘
```

1. **`profiles`**
   * `id`: `uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   * `full_name`: `text NOT NULL`
   * `role`: `text NOT NULL CHECK (role IN ('admin', 'manager', 'counsellor')) DEFAULT 'counsellor'`
   * `created_at`: `timestamptz DEFAULT now()`
   * `updated_at`: `timestamptz DEFAULT now()`

2. **`leads`**
   * `id`: `uuid PRIMARY KEY DEFAULT gen_random_uuid()`
   * `full_name`: `text NOT NULL`
   * `email`: `text NULL`
   * `phone`: `text NOT NULL`
   * `course_interest`: `text NOT NULL`
   * `source`: `text NOT NULL CHECK (source IN ('Website', 'Walk-in', 'Phone Call', 'Referral', 'Social Media', 'Other'))`
   * `status`: `text NOT NULL CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')) DEFAULT 'New'`
   * `lost_reason`: `text NULL` (enforced in UI/DB when status = 'Lost')
   * `assigned_to`: `uuid NULL REFERENCES profiles(id) ON DELETE SET NULL`
   * `created_by`: `uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT`
   * `notes`: `text NULL`
   * `created_at`: `timestamptz DEFAULT now()`
   * `updated_at`: `timestamptz DEFAULT now()`

3. **`follow_ups`**
   * `id`: `uuid PRIMARY KEY DEFAULT gen_random_uuid()`
   * `lead_id`: `uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE`
   * `assigned_to`: `uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT`
   * `due_at`: `timestamptz NOT NULL`
   * `note`: `text NOT NULL`
   * `status`: `text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending'`
   * `completed_at`: `timestamptz NULL`
   * `created_by`: `uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT`
   * `created_at`: `timestamptz DEFAULT now()`

4. **`activities`**
   * `id`: `uuid PRIMARY KEY DEFAULT gen_random_uuid()`
   * `lead_id`: `uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE`
   * `actor_id`: `uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT`
   * `activity_type`: `text NOT NULL CHECK (activity_type IN ('created', 'status_change', 'note', 'followup_created', 'followup_completed'))`
   * `description`: `text NOT NULL`
   * `metadata`: `jsonb NULL`
   * `created_at`: `timestamptz DEFAULT now()`

### Row Level Security (RLS) Rules
* **`profiles`**: Any authenticated user can read profiles (needed for assignee names). Users can update only their own profile `full_name`; they **cannot** update their own `role`.
* **`leads`**:
  * Counsellors: Can SELECT and UPDATE only leads where `assigned_to = auth.uid()` OR `created_by = auth.uid()`.
  * Managers & Admins: Can SELECT, INSERT, UPDATE all leads.
* **`follow_ups`**: Access permitted if the user has access to the underlying `lead_id`.
* **`activities`**: Access permitted if the user has access to the underlying `lead_id`.

---

## 3. Order-Wise Phased Implementation

---

### Phase 0: Baseline Foundation, Git Hygiene & TypeScript Setup
* **Objective**: Prepare a type-safe development environment with all required core libraries and secure Git tracking.
* **WHERE**:
  * Update: `.gitignore`
  * Update: `package.json`
  * New: `tsconfig.json`, `tsconfig.node.json`, `src/vite-env.d.ts`
  * Refactor: `src/main.jsx` $\rightarrow$ `src/main.tsx`, `src/App.jsx` $\rightarrow$ `src/App.tsx`, `vite.config.js` $\rightarrow$ `vite.config.ts`
* **WHAT**:
  * Prevent `.env` files from leaking to Git.
  * Upgrade starter from JavaScript to strict TypeScript.
  * Install dependencies: `@supabase/supabase-js`, `react-router-dom`, `lucide-react`, `tailwindcss`, `@tailwindcss/vite`.
* **HOW**:
  * Add `.env*` to `.gitignore`.
  * Install npm dependencies.
  * Configure TypeScript and Tailwind plugins in Vite.
* **TESTING & VERIFICATION**:
  * Local: `npm run build` succeeds with 0 errors.
  * Git: `git status` verifies `.env` is ignored.
* **DEPLOYMENT & LIVE CHECK**:
  * Commit: `chore: baseline typescript and dependencies setup`.
  * Live: Verify Vite build succeeds on Vercel.
* **ACCEPTANCE CRITERIA**:
  - [ ] TypeScript compiles cleanly.
  - [ ] Production build succeeds.
  - [ ] Git repository is protected against secret leaks.

---

### Phase 1: Design System, Layout Shell & Navigation
* **Objective**: Build a responsive SaaS layout with a professional navy/slate theme, mobile navigation, and page route shells.
* **WHERE**:
  * Styling: `src/index.css`
  * Layout: `src/components/layout/Layout.tsx`, `Sidebar.tsx`, `Header.tsx`, `MobileNav.tsx`
  * Primitives: `src/components/common/Button.tsx`, `Input.tsx`, `Select.tsx`, `Badge.tsx`, `Card.tsx`, `Modal.tsx`
  * Page Skeletons: `DashboardPage.tsx`, `LeadsPage.tsx`, `LeadDetailPage.tsx`, `FollowupsPage.tsx`, `ReportsPage.tsx`, `SettingsPage.tsx`
  * Routing: `src/App.tsx`
* **WHAT**:
  * Navy (`#0F172A`), Slate, and Indigo brand styling.
  * Desktop sidebar and responsive mobile slide-over drawer.
  * Route shells for all 6 application views.
* **HOW**:
  * Configure Tailwind styling rules.
  * Implement accessible drawer with backdrop and keyboard `Escape` handling.
  * Build nested route structure with `react-router-dom`.
* **TESTING & VERIFICATION**:
  * Local: Click through all 6 routes; verify path changes and rendering.
  * Responsive: Test at 375px, 768px, and 1280px viewports.
* **DEPLOYMENT & LIVE CHECK**:
  * Commit: `feat: layout shell, design system and navigation`.
  * Live: Verify mobile drawer and desktop sidebar on the live Vercel URL.
* **ACCEPTANCE CRITERIA**:
  - [ ] All 6 pages render without console errors.
  - [ ] Navigation works smoothly across desktop and mobile.

---

### Phase 2: Supabase Client Infrastructure & Configuration Guard
* **Objective**: Initialize the Supabase SDK safely with environment variable validation, preventing silent failures or mock data deception.
* **WHERE**:
  * Template: `.env.example`
  * Client: `src/lib/supabaseClient.ts`
  * Guard Component: `src/components/common/ConfigurationNotice.tsx`
  * Types: `src/types/database.types.ts`
* **WHAT**:
  * Validated Supabase client singleton.
  * Configuration Notice banner explaining how to connect Supabase when keys are missing.
* **HOW**:
  * Validate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  * Display `ConfigurationNotice` if keys are missing or invalid, avoiding unhandled crashes.
* **TESTING & VERIFICATION**:
  * Local (Unconfigured): Clear `.env` and verify setup guide renders.
  * Local (Configured): Add valid credentials and verify app loads normally.
* **DEPLOYMENT & LIVE CHECK**:
  * Commit: `feat: supabase client and configuration guard`.
  * Live: Verify configuration banner renders on Vercel when keys are pending.
* **ACCEPTANCE CRITERIA**:
  - [ ] App never crashes when `.env` is unconfigured.
  - [ ] `.env.example` is committed; actual `.env` is ignored by Git.

---

### Phase 3: PostgreSQL Database Schema, Migrations & RLS Policies
* **Objective**: Author production-grade PostgreSQL migrations with constraints, indexes, triggers, and Row Level Security policies.
* **WHERE**:
  * Migration: `supabase/migrations/20261116000000_brightpath_crm_schema.sql`
  * Seed Data: `supabase/seed.sql`
  * Setup Guide: `docs/DATABASE_SETUP.md`
* **WHAT**:
  * 4 core tables: `profiles`, `leads`, `follow_ups`, `activities`.
  * Automated user profile creation trigger on signup.
  * RLS policies enforcing role isolation (Counsellor vs Manager/Admin).
  * Fictional demo seed data for workshop testing.
* **HOW**:
  * Write clean SQL migration.
  * Define explicit RLS policies (`SELECT`, `INSERT`, `UPDATE`).
  * Add indexes on status, source, assigned_to, and due_at.
* **TESTING & VERIFICATION**:
  * Remote SQL: Apply migration in Supabase SQL Editor.
  * RLS Check: Test queries to confirm counsellors cannot view unassigned leads and users cannot self-escalate roles.
* **DEPLOYMENT & LIVE CHECK**:
  * Confirm database tables and policies are active in the Supabase Dashboard.
* **ACCEPTANCE CRITERIA**:
  - [ ] All 4 tables exist with proper foreign keys and constraints.
  - [ ] RLS is active and verified on all tables.

---

### Phase 4: Authentication, Session Lifecycle & Role-Based Access Control (RBAC)
* **Objective**: Connect Supabase Auth, build sign-in/sign-out workflows, load user profiles, and enforce UI role boundaries.
* **WHERE**:
  * Service: `src/services/authService.ts`
  * Context & Hook: `src/context/AuthContext.tsx`, `src/hooks/useAuth.ts`
  * Page: `src/pages/LoginPage.tsx`
  * Guard: `src/components/auth/ProtectedRoute.tsx`
  * Guide: `docs/ADMIN_BOOTSTRAP.md`
* **WHAT**:
  * Email/password sign-in with clear error feedback.
  * Session persistence across browser reloads.
  * User profile and role loading (`admin`, `manager`, `counsellor`).
  * Sign-out action with cache clearing.
* **HOW**:
  * Call `supabase.auth.signInWithPassword` and `supabase.auth.signOut`.
  * Listen to `onAuthStateChange` to synchronize session state.
  * Fetch profile from `profiles` table matching `auth.uid()`.
* **TESTING & VERIFICATION**:
  * Local: Test invalid login (verify error message) and valid login (verify redirect).
  * Session: Refresh page and verify user remains logged in.
  * Logout: Sign out and verify redirect to `/login`.
* **DEPLOYMENT & LIVE CHECK**:
  * Commit: `feat: auth lifecycle and role based access control`.
  * Live: Verify login, persistence, and logout on the live Vercel URL.
* **ACCEPTANCE CRITERIA**:
  - [ ] Authentication flows function cleanly.
  - [ ] Counsellor role cannot view or perform administrative actions.

---

### Phase 5: Lead Management Core Engine (CRUD, Search, Filters & Status Flow)
* **Objective**: Build the core lead pipeline with real Supabase persistence, search, multi-attribute filtering, creation modal, and status transitions.
* **WHERE**:
  * Service: `src/services/leadsService.ts`
  * Hook: `src/hooks/useLeads.ts`
  * Components: `LeadTable.tsx`, `LeadCard.tsx`, `LeadFilterBar.tsx`, `LeadModal.tsx`, `LeadStatusBadge.tsx`, `LostReasonModal.tsx`
  * Pages: `src/pages/LeadsPage.tsx`, `src/pages/LeadDetailPage.tsx`
* **WHAT**:
  * Lead list with search by name, phone, course.
  * Filters for status, source, and assignee; reset filters button.
  * Create/edit lead modal with phone and name validation.
  * Status workflow: `New` $\rightarrow$ `Contacted` $\rightarrow$ `Qualified` $\rightarrow$ `Converted` $\rightarrow$ `Lost`.
  * Mandatory modal prompt for reason when marking `Lost`.
* **HOW**:
  * Typed Supabase queries with filter chaining.
  * Optimistic UI update with server synchronization.
  * Prevent double submission by disabling buttons during save.
* **TESTING & VERIFICATION**:
  * Local: Create a lead, search for it, change its status to `Lost` with reason, and reload page to confirm persistence.
  * Role Check: Counsellors see only permitted leads.
* **DEPLOYMENT & LIVE CHECK**:
  * Commit: `feat: lead management workflows and status transitions`.
  * Live: Create and update a lead on the live Vercel deployment.
* **ACCEPTANCE CRITERIA**:
  - [ ] All lead operations persist directly to Supabase.
  - [ ] Search and filters function accurately.
  - [ ] Mandatory reason enforced for `Lost` status.

---

### Phase 6: Follow-ups Engine, Overdue Detection & Activity Audit Log
* **Objective**: Build follow-up scheduling with date/time handling, overdue logic, completion workflows, and an automated audit history timeline.
* **WHERE**:
  * Services: `src/services/followupsService.ts`, `src/services/activitiesService.ts`
  * Hooks: `src/hooks/useFollowups.ts`, `src/hooks/useActivities.ts`
  * Components: `FollowupList.tsx`, `FollowupModal.tsx`, `OverdueBadge.tsx`, `ActivityTimeline.tsx`
  * Pages: Integrated into `FollowupsPage.tsx` and `LeadDetailPage.tsx`
* **WHAT**:
  * Schedule follow-up with due date/time, note, and assignee.
  * Overdue logic: `status === 'pending' && due_at < NOW()`.
  * One-click "Mark Completed" setting `completed_at = NOW()`.
  * Completed follow-ups never display as overdue.
  * Automatic audit trail for lead creation, status changes, and follow-ups.
* **HOW**:
  * Query `follow_ups` joined with `leads`.
  * Insert corresponding `activities` records on every lifecycle update.
* **TESTING & VERIFICATION**:
  * Local: Schedule an overdue follow-up $\rightarrow$ verify badge appears. Mark completed $\rightarrow$ verify badge disappears and activity log updates.
* **DEPLOYMENT & LIVE CHECK**:
  * Commit: `feat: follow-ups engine and activity timeline`.
  * Live: Verify follow-up scheduling and activity log on live Vercel URL.
* **ACCEPTANCE CRITERIA**:
  - [ ] Overdue calculation is accurate based on current local time.
  - [ ] Activity log automatically updates across all lead events.

---

### Phase 7: Dashboard Analytics, Real-Time KPIs & Data Reconciliation Reports
* **Objective**: Build real-time KPI metrics, visual distribution cards, and reports that reconcile exactly with underlying database records.
* **WHERE**:
  * Service: `src/services/metricsService.ts`
  * Hook: `src/hooks/useMetrics.ts`
  * Components: `KpiCard.tsx`, `StatusDistribution.tsx`, `SourceDistribution.tsx`, `RecentLeadsWidget.tsx`, `OverdueFollowupsWidget.tsx`
  * Pages: `src/pages/DashboardPage.tsx`, `src/pages/ReportsPage.tsx`
* **WHAT**:
  * 5 KPI cards: Total Accessible Leads, New Leads, Converted Leads, Overdue Follow-ups, Conversion Rate % (`(Converted / Total) * 100`).
  * Visual breakdown by status and source.
  * Reports page reconciling status and source counts.
* **HOW**:
  * Calculate live counts from permitted data under RLS.
  * Protect against division by zero in conversion rate calculation.
* **TESTING & VERIFICATION**:
  * Local: Reconcile all KPI numbers against row counts in Leads and Follow-ups tables.
  * Empty State: Test with 0 leads to verify conversion rate renders `0%` without `NaN`.
* **DEPLOYMENT & LIVE CHECK**:
  * Commit: `feat: live dashboard kpis and reports reconciliation`.
  * Live: Confirm dashboard cards reflect live database numbers on Vercel.
* **ACCEPTANCE CRITERIA**:
  - [ ] Every dashboard card matches underlying database records.
  - [ ] Zero hardcoded or mock metrics.

---

### Phase 8: Error Boundaries, Loading Skeletons, Empty States & Accessibility
* **Objective**: Elevate the app to professional SaaS standards with robust error handling, skeleton loaders, and full accessibility.
* **WHERE**:
  * Components: `ErrorBoundary.tsx`, `Toast.tsx`, `Skeleton.tsx`, `EmptyState.tsx`
  * Context: `src/context/ToastContext.tsx`
  * Styles: `src/index.css` (focus rings, accessible contrast)
* **WHAT**:
  * Error boundary preventing full-screen crashes.
  * Skeleton placeholders during async queries.
  * Empty states with call-to-action buttons.
  * Actionable toast notifications for network errors and saves.
  * Full keyboard accessibility (`Tab`, `Enter`, `Escape`).
* **HOW**:
  * Add React `ErrorBoundary` wrapper.
  * Global toast manager via React Context.
  * ARIA roles and visible keyboard focus rings.
* **TESTING & VERIFICATION**:
  * Local: Disconnect network $\rightarrow$ verify error toast. Navigate via keyboard only $\rightarrow$ verify all interactive elements are reachable.
* **DEPLOYMENT & LIVE CHECK**:
  * Commit: `polish: error handling, skeletons, toast notifications and accessibility`.
  * Live: Test touch targets, skeletons, and toasts on mobile and desktop production URL.
* **ACCEPTANCE CRITERIA**:
  - [ ] Forms disable submit buttons while saving.
  - [ ] Zero unhandled promise crashes or raw stack traces.

---

### Phase 9: Production Build Optimization, Static Analysis & Handover Docs
* **Objective**: Ensure complete codebase health and produce clear, standalone handover documentation.
* **WHERE**:
  * Documentation: `README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING_CHECKLIST.md`
  * Verification: `package.json`, `eslint.config.js`
* **WHAT**:
  * Remove unused imports and console logs.
  * Ensure 0 TypeScript errors and 0 lint warnings.
  * Comprehensive documentation covering setup, environment variables, database migrations, and testing.
* **HOW**:
  * Run `npm run lint` and `npm run build`.
  * Author complete, student-ready handover guides.
* **TESTING & VERIFICATION**:
  * Local: `npm run lint` passes; `npm run build` succeeds cleanly.
* **DEPLOYMENT & LIVE CHECK**:
  * Commit: `docs: complete student handover documentation and build verification`.
  * Live: Verify clean build logs on Vercel.
* **ACCEPTANCE CRITERIA**:
  - [ ] Production build passes with 0 errors and warnings.
  - [ ] Handover documentation is complete and self-contained.

---

### Phase 10: Vercel Production Deployment, Live E2E Verification & Handover Sign-off
* **Objective**: Finalize production hosting, verify all workflows on the live HTTPS domain, and deliver final sign-off.
* **WHERE**:
  * Remote: GitHub repository (`origin/main`)
  * Cloud: Vercel Production Deployment & Supabase Backend
* **WHAT**:
  * Verified live production deployment over HTTPS.
  * End-to-end verification checklist executed on the live URL.
* **HOW**:
  * Connect GitHub repository to Vercel.
  * Configure production environment variables in Vercel.
  * Execute end-to-end verification walkthrough.
* **LIVE VERIFICATION SCENARIOS**:
  1. Verify `.env` is not tracked in Git.
  2. Sign in as Counsellor and Manager; verify role permissions.
  3. Create a lead and confirm persistence on page reload.
  4. Advance lead status to `Lost` and verify mandatory reason prompt.
  5. Schedule an overdue follow-up, mark completed, and inspect activity timeline.
  6. Reconcile Dashboard KPI counts against table data.
  7. Test responsive navigation on mobile viewport.
* **ACCEPTANCE CRITERIA**:
  - [ ] Live application accessible on public Vercel HTTPS URL.
  - [ ] All P0 CRM workflows function end-to-end.
  - [ ] Final handover report delivered.

---

## 4. Phase Progression Matrix

```
┌──────┬──────────────────────────────────────────┬──────────────────────┬─────────────┐
│Phase │ Focus Area                               │ Core Deliverable     │ Live Check  │
├──────┼──────────────────────────────────────────┼──────────────────────┼─────────────┤
│ 0    │ Foundation, Git Security & TypeScript    │ Build & Tooling      │ Vercel Build│
│ 1    │ Design System, Layout & Navigation       │ Responsive Shell     │ Live Nav    │
│ 2    │ Supabase Client & Configuration Guard    │ Env Validation       │ Live Guard  │
│ 3    │ Database Schema, RLS & Migrations        │ PostgreSQL Backend   │ DB Status   │
│ 4    │ Auth, Session Lifecycle & RBAC           │ Login & Roles        │ Live Auth   │
│ 5    │ Lead Management (CRUD, Search, Filters)  │ Core Pipeline        │ Live CRUD   │
│ 6    │ Follow-ups Engine & Activity Audit Log   │ Overdue & Audit Log  │ Live Queue  │
│ 7    │ Dashboard KPIs & Reports Reconciliation  │ Live Metrics         │ Live KPIs   │
│ 8    │ Error Boundaries, Skeletons & A11y       │ UX Polish            │ Live UX     │
│ 9    │ Build Verification & Handover Docs       │ Handover Package     │ Clean Build │
│ 10   │ Final Live E2E Sign-off                  │ Verified Live CRM    │ Full E2E    │
└──────┴──────────────────────────────────────────┴──────────────────────┴─────────────┘
```
