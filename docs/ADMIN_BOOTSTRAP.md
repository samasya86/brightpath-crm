# Administrator Role Bootstrap Guide

In BrightPath CRM, user roles are protected by database triggers. Users cannot change their own role through the browser interface (preventing privilege escalation).

When a new user signs up, their default role is set to **`counsellor`** (least privilege).

---

## How to Promote a User to Administrator

To elevate your account to the **`admin`** role, run this safe SQL snippet in your **Supabase SQL Editor**:

```sql
-- Replace 'your-email@example.com' with the email address you used to sign up
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'your-email@example.com'
);
```

### To Promote a User to Manager:

```sql
-- Replace 'colleague-email@example.com' with the staff member's email
UPDATE public.profiles
SET role = 'manager'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'colleague-email@example.com'
);
```

---

## Verification

To verify staff roles across your team, run:

```sql
SELECT
  p.id,
  p.full_name,
  p.role,
  u.email,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id;
```
