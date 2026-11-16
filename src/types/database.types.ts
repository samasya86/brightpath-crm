export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'manager' | 'counsellor';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
export type LeadSource =
  | 'Website'
  | 'Walk-in'
  | 'Phone Call'
  | 'Referral'
  | 'Social Media'
  | 'Other';
export type FollowupStatus = 'pending' | 'completed' | 'cancelled';
export type ActivityType =
  | 'created'
  | 'status_change'
  | 'note'
  | 'followup_created'
  | 'followup_completed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string;
          course_interest: string;
          source: LeadSource;
          status: LeadStatus;
          lost_reason: string | null;
          assigned_to: string | null;
          created_by: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone: string;
          course_interest: string;
          source: LeadSource;
          status?: LeadStatus;
          lost_reason?: string | null;
          assigned_to?: string | null;
          created_by: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string;
          course_interest?: string;
          source?: LeadSource;
          status?: LeadStatus;
          lost_reason?: string | null;
          assigned_to?: string | null;
          created_by?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      follow_ups: {
        Row: {
          id: string;
          lead_id: string;
          assigned_to: string;
          due_at: string;
          note: string;
          status: FollowupStatus;
          completed_at: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          assigned_to: string;
          due_at: string;
          note: string;
          status?: FollowupStatus;
          completed_at?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          assigned_to?: string;
          due_at?: string;
          note?: string;
          status?: FollowupStatus;
          completed_at?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          lead_id: string;
          actor_id: string;
          activity_type: ActivityType;
          description: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          actor_id: string;
          activity_type: ActivityType;
          description: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          actor_id?: string;
          activity_type?: ActivityType;
          description?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}
