export type UserRole = 'admin' | 'manager' | 'counsellor';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';

export type LeadSource = 
  | 'Website' 
  | 'Walk-in' 
  | 'Phone Call' 
  | 'Referral' 
  | 'Social Media' 
  | 'Other';

export interface Lead {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  course_interest: string;
  source: LeadSource;
  status: LeadStatus;
  lost_reason?: string | null;
  assigned_to: string | null;
  created_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields for display
  assigned_profile?: Profile | null;
  creator_profile?: Profile | null;
}

export type FollowupStatus = 'pending' | 'completed' | 'cancelled';

export interface FollowUp {
  id: string;
  lead_id: string;
  assigned_to: string;
  due_at: string;
  note: string;
  status: FollowupStatus;
  completed_at: string | null;
  created_by: string;
  created_at: string;
  // Joined fields
  lead?: {
    id: string;
    full_name: string;
    phone: string;
    course_interest: string;
  } | null;
  assignee?: Profile | null;
}

export type ActivityType = 
  | 'created' 
  | 'status_change' 
  | 'note' 
  | 'followup_created' 
  | 'followup_completed';

export interface Activity {
  id: string;
  lead_id: string;
  actor_id: string;
  activity_type: ActivityType;
  description: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  actor?: Profile | null;
}

export interface KpiMetrics {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  overdueFollowups: number;
  conversionRate: number;
}
