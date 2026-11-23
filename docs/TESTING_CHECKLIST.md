# BrightPath CRM — Quality Assurance & Testing Checklist

This checklist provides a structured, phase-by-phase test protocol to verify the functionality, security, and user experience of BrightPath CRM across local and production environments.

---

## 📋 Test Matrix Summary

| Test Category | Target Area | Role Scope | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-01: Environment Guard** | Startup Configuration | All | App loads if valid; `ConfigurationNotice` displayed if invalid. |
| **TC-02: Authentication** | Login & Sessions | All | Clean sign-in, persistent session on reload, clean sign-out. |
| **TC-03: RBAC Enforcement** | Route & Action Gates | Admin, Manager, Counsellor | Counsellor cannot delete or reassign; Admin/Manager have full control. |
| **TC-04: Lead Creation** | Pipeline Registration | All Staff | New enquiry saved to PostgreSQL; appears in table and KPI counts. |
| **TC-05: Search & Filter** | Enquiry Grid | All Staff | Real-time filter by name, phone, status, source, and counsellor. |
| **TC-06: Status & Lost Reason** | Lifecycle Governance | All Staff | Marking "Lost" strictly requires qualitative reason; logged in audit. |
| **TC-07: Follow-up Queue** | Scheduling & Alerts | All Staff | Overdue callbacks highlighted in red; marked complete moves to tab. |
| **TC-08: Activity Timeline** | Audit History | All Staff | Chronological log captures all interactions and status changes. |
| **TC-09: Dashboard KPIs** | Live Reconciliation | All Staff | All KPI counts strictly match active database records; 0% if empty. |
| **TC-10: Reports & CSV Export** | Business Intelligence | All Staff | Channel breakdown displayed; CSV downloads with accurate numbers. |
| **TC-11: Toast Feedback** | Notification System | All Staff | Color-coded toasts appear for every mutation and auto-dismiss in 4.5s. |
| **TC-12: Error Boundary** | Fault Tolerance | All Staff | Component exceptions trigger recovery screen with "Reload Page". |

---

## 🔍 Detailed Test Cases

### 1. Environment Guard & Git Security (Phase 0 & 2)

- [ ] **TC-01.1: Git `.env` Exclusion**
  - Run: `git status --ignored`
  - Verify `.env`, `.env.local`, and `dist/` are strictly ignored.
  - Verify `git log` contains zero commits with credentials.

- [ ] **TC-01.2: Missing Environment Variables**
  - Temporarily rename `.env` to `.env.bak`.
  - Refresh the app.
  - Verify `ConfigurationNotice` renders instructions with Supabase credential guidelines.
  - Restore `.env`.

- [ ] **TC-01.3: Active Supabase Connection Ping**
  - Open browser DevTools Network tab.
  - Refresh the app.
  - Confirm an HTTPS `200 OK` ping to your Supabase project endpoint.

---

### 2. Authentication & Session Lifecycle (Phase 4)

- [ ] **TC-02.1: Login Form Validation**
  - Navigate to `/login`.
  - Attempt submission with empty email and password.
  - Verify browser validation prompts for required fields.

- [ ] **TC-02.2: Invalid Credentials**
  - Enter invalid credentials (e.g. `wrong@test.com` / `WrongPass123!`).
  - Verify friendly error alert appears: "Invalid login credentials".

- [ ] **TC-02.3: Successful Sign-in & Redirection**
  - Enter valid credentials.
  - Click **Sign In**.
  - Verify redirection to `/` (Dashboard).
  - Verify user initials, name, and role badge appear in the header and sidebar.

- [ ] **TC-02.4: Session Persistence**
  - Refresh the browser on `/leads`.
  - Verify the user remains logged in without flickering back to `/login`.

- [ ] **TC-02.5: Sign-out Action**
  - Click the **Sign Out** button in the header or sidebar.
  - Verify session terminates and user is redirected to `/login`.
  - Attempt manual URL navigation to `/leads`; verify redirect back to `/login`.

---

### 3. Role-Based Access Control (RBAC) (Phase 4 & 5)

- [ ] **TC-03.1: Counsellor Role Isolation**
  - Sign in as a `counsellor`.
  - Verify Leads page displays only leads created by or assigned to this counsellor.
  - Navigate to a Lead Detail page.
  - Verify **Delete Lead** button is **hidden**.
  - Verify **Reassign Counsellor** selector is **disabled** or hidden.

- [ ] **TC-03.2: Manager & Admin Privileges**
  - Sign in as `manager` or `admin`.
  - Verify Leads page shows all student enquiries across the entire institute.
  - Verify **Delete Lead** button is available.
  - Verify **Reassign Counsellor** allows changing lead ownership.

- [ ] **TC-03.3: Database Privilege Escalation Guard**
  - Navigate to `/settings`.
  - Edit display name and click **Save Profile**.
  - Verify only `full_name` is updated.
  - In Supabase SQL Editor, attempt updating role via client token:
    ```sql
    UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
    ```
  - Verify database trigger `tr_prevent_role_escalation` rejects the mutation.

---

### 4. Lead Management (CRUD, Search & Filter) (Phase 5)

- [ ] **TC-04.1: Add New Enquiry**
  - Click **Add Enquiry** button.
  - Fill all required fields: Name, Phone, Course, Source, Status (`New`).
  - Click **Create Enquiry**.
  - Verify modal closes, success toast appears ("Enquiry Created"), and lead appears at top of table.

- [ ] **TC-04.2: Phone & Email Validation**
  - Attempt entering an invalid email format in the lead modal.
  - Verify client validation flags the malformed input.

- [ ] **TC-04.3: Real-Time Search**
  - Type a student's partial name or phone number in the search bar.
  - Verify table filters instantly.
  - Clear search bar; verify full list restores.

- [ ] **TC-04.4: Filter by Status & Source**
  - Select Status = `Qualified`.
  - Verify only Qualified leads appear.
  - Select Source = `Referral`.
  - Verify only matching leads appear.
  - Click **Reset Filters** button; verify all filters clear.

- [ ] **TC-04.5: Responsive Viewport Check**
  - Shrink browser width below 768px (mobile viewport).
  - Verify desktop table smoothly switches to stacked mobile cards.

---

### 5. Status Transition & Lost Reason Governance (Phase 5 & 6)

- [ ] **TC-05.1: Normal Status Advancement**
  - Open a lead in `New` status.
  - Change status dropdown to `Contacted`.
  - Verify status badge updates, success toast appears, and change is recorded in the Activity Timeline.

- [ ] **TC-05.2: Enforce Mandatory Lost Reason**
  - Select status `Lost`.
  - Verify **Lost Reason Modal** immediately appears.
  - Attempt clicking **Confirm Lost** with an empty reason or just whitespace.
  - Verify form validation blocks submission.
  - Select a reason category (e.g. *Fees too high*) and enter notes.
  - Click **Confirm Lost**.
  - Verify status badge turns red ("Lost"), warning toast appears, and reason is saved.

---

### 6. Follow-up Engine & Overdue Detection (Phase 6)

- [ ] **TC-06.1: Schedule Callback**
  - Open Lead Detail page or Follow-ups page.
  - Click **Schedule Follow-up**.
  - Select a due date and time, and enter notes.
  - Click **Schedule Follow-up**.
  - Verify follow-up card appears in queue and timeline logs the schedule.

- [ ] **TC-06.2: Overdue Status Indicator**
  - Schedule a follow-up with a due timestamp in the past (e.g. yesterday).
  - Verify follow-up renders a high-contrast 🔴 **Overdue** badge.
  - Verify Follow-ups tab **Overdue** badge count increments.
  - Verify Dashboard **Overdue Follow-ups** KPI increments.

- [ ] **TC-06.3: Mark Complete Interaction**
  - Click **Mark Done** on an active follow-up.
  - Verify card moves to **Completed** tab.
  - Verify timeline logs `followup_completed` activity.
  - Verify success toast confirms completion.

- [ ] **TC-06.4: Cancel Follow-up**
  - Click **Cancel** on a scheduled follow-up.
  - Confirm cancellation.
  - Verify schedule disappears from pending tabs and info toast confirms cancellation.

---

### 7. Activity Audit Timeline (Phase 6)

- [ ] **TC-07.1: Chronological Order**
  - Open Lead Detail page.
  - Inspect Activity Audit Timeline.
  - Verify entries are sorted newest to oldest.

- [ ] **TC-07.2: Lifecycle Event Captures**
  - Verify the timeline contains:
    - Initial creation entry (`created`)
    - Status changes with previous and new status (`status_change`)
    - Follow-up creation (`followup_created`)
    - Follow-up completion (`followup_completed`)

---

### 8. Dashboard KPIs & Reports Reconciliation (Phase 7)

- [ ] **TC-08.1: Mathematical Reconciliation**
  - Total Accessible Leads count = Count of rows in Leads table.
  - New Leads count = Count of leads with status `New`.
  - Converted count = Count of leads with status `Converted`.
  - Overdue count = Count of pending follow-ups with `due_at < now()`.
  - Conversion Rate = `(Converted / Total) * 100%`.

- [ ] **TC-08.2: Zero-Division Protection**
  - In a clean account with 0 leads:
  - Verify Conversion Rate displays `0.0%` (not `NaN%` or `Infinity%`).

- [ ] **TC-08.3: CSV Export Functionality**
  - Navigate to `/reports`.
  - Click **Export CSV Summary**.
  - Verify browser downloads a file named `brightpath-crm-report-YYYY-MM-DD.csv`.
  - Open the CSV; verify metrics match screen data.

---

### 9. UX Polish, Skeletons, Toasts & Error Boundaries (Phase 8)

- [ ] **TC-09.1: Toast Auto-Dismissal**
  - Trigger any action (e.g. update status).
  - Observe toast appear at bottom-right.
  - Wait 4.5 seconds without clicking; verify toast smoothly auto-dismisses.

- [ ] **TC-09.2: Manual Toast Dismissal**
  - Trigger action; click the `X` button on the toast.
  - Verify toast closes immediately.

- [ ] **TC-09.3: Shimmer Skeleton Placeholders**
  - Throttle network in DevTools to "Slow 3G".
  - Navigate to `/leads`.
  - Verify smooth `TableSkeleton` shimmers render until data arrives.
  - Navigate to `/`; verify 5 `CardSkeleton` shimmers render.

- [ ] **TC-09.4: Error Boundary Trapping**
  - Verify root application is wrapped in `ErrorBoundary`.
  - If a runtime error occurs, verify friendly recovery screen renders with "Reload Page" and "Back to Dashboard" buttons.

---

### 10. Static Analysis & Build Verification (Phase 9)

- [ ] **TC-10.1: ESLint Verification**
  - Execute: `npm run lint`
  - Output must show **0 errors** and **0 warnings**.

- [ ] **TC-10.2: Vite Production Build**
  - Execute: `npm run build`
  - Output must report successful compilation with zero TypeScript errors.

- [ ] **TC-10.3: Preview Verification**
  - Execute: `npm run preview`
  - Open local preview URL; verify full application executes identically to development mode.
