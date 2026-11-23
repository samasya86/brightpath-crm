import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Lead, LeadStatus, LeadSource, Profile } from '../types';

export interface LeadFilters {
  search?: string;
  status?: LeadStatus | 'all';
  source?: LeadSource | 'all';
  assigneeId?: string | 'all';
}

export interface CreateLeadInput {
  full_name: string;
  phone: string;
  email?: string | null;
  course_interest: string;
  source: LeadSource;
  notes?: string | null;
  assigned_to?: string | null;
}

export interface UpdateLeadInput {
  full_name?: string;
  phone?: string;
  email?: string | null;
  course_interest?: string;
  source?: LeadSource;
  notes?: string | null;
  assigned_to?: string | null;
  status?: LeadStatus;
  lost_reason?: string | null;
}

export const leadsService = {
  /**
   * Fetch leads with optional search and multi-attribute filters
   */
  async getLeads(filters?: LeadFilters): Promise<Lead[]> {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from('leads')
      .select(`
        *,
        assigned_profile:profiles!assigned_to(id, full_name, role),
        creator_profile:profiles!created_by(id, full_name, role)
      `)
      .order('created_at', { ascending: false });

    // Status filter
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Source filter
    if (filters?.source && filters.source !== 'all') {
      query = query.eq('source', filters.source);
    }

    // Assignee filter
    if (filters?.assigneeId && filters.assigneeId !== 'all') {
      if (filters.assigneeId === 'unassigned') {
        query = query.is('assigned_to', null);
      } else {
        query = query.eq('assigned_to', filters.assigneeId);
      }
    }

    // Search query across name, phone, course, email
    if (filters?.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`full_name.ilike.${term},phone.ilike.${term},course_interest.ilike.${term},email.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }

    return (data as unknown as Lead[]) || [];
  },

  /**
   * Fetch a single lead by its UUID
   */
  async getLeadById(id: string): Promise<Lead | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        assigned_profile:profiles!assigned_to(id, full_name, role),
        creator_profile:profiles!created_by(id, full_name, role)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching lead by id:', error);
      throw error;
    }

    return (data as unknown as Lead) || null;
  },

  /**
   * Register a new student enquiry into the database
   */
  async createLead(input: CreateLeadInput): Promise<Lead> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be signed in to create an enquiry.');

    const insertPayload = {
      full_name: input.full_name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
      course_interest: input.course_interest.trim(),
      source: input.source,
      notes: input.notes?.trim() || null,
      assigned_to: input.assigned_to || user.id, // Defaults to creator if not specified
      created_by: user.id,
      status: 'New' as LeadStatus,
    };

    const { data, error } = await supabase
      .from('leads')
      .insert(insertPayload)
      .select(`
        *,
        assigned_profile:profiles!assigned_to(id, full_name, role),
        creator_profile:profiles!created_by(id, full_name, role)
      `)
      .single();

    if (error) throw error;

    // Automatically record an initial audit activity log
    try {
      await supabase.from('activities').insert({
        lead_id: data.id,
        actor_id: user.id,
        activity_type: 'created',
        description: `Lead registered via ${input.source}`,
      });
    } catch (activityErr) {
      console.warn('Failed to log lead creation activity:', activityErr);
    }

    return data as unknown as Lead;
  },

  /**
   * Update lead fields
   */
  async updateLead(id: string, updates: UpdateLeadInput): Promise<Lead> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        assigned_profile:profiles!assigned_to(id, full_name, role),
        creator_profile:profiles!created_by(id, full_name, role)
      `)
      .single();

    if (error) throw error;
    return data as unknown as Lead;
  },

  /**
   * Transition lead status and log to activity timeline
   */
  async updateLeadStatus(
    id: string,
    newStatus: LeadStatus,
    lostReason?: string | null,
    previousStatus?: string
  ): Promise<Lead> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be signed in to update status.');

    const updatePayload: { status: LeadStatus; lost_reason?: string | null } = {
      status: newStatus,
    };

    if (newStatus === 'Lost') {
      updatePayload.lost_reason = lostReason || 'No reason provided';
    } else {
      updatePayload.lost_reason = null;
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        assigned_profile:profiles!assigned_to(id, full_name, role),
        creator_profile:profiles!created_by(id, full_name, role)
      `)
      .single();

    if (error) throw error;

    // Log the status transition in the activity history
    try {
      const description = previousStatus
        ? `Status updated from ${previousStatus} to ${newStatus}${
            newStatus === 'Lost' && lostReason ? ` (Reason: ${lostReason})` : ''
          }`
        : `Status updated to ${newStatus}`;

      await supabase.from('activities').insert({
        lead_id: id,
        actor_id: user.id,
        activity_type: 'status_change',
        description,
        metadata: lostReason ? { lost_reason: lostReason } : null,
      });
    } catch (activityErr) {
      console.warn('Failed to log status change activity:', activityErr);
    }

    return data as unknown as Lead;
  },

  /**
   * Delete lead (Restricted to Managers & Admins by RLS)
   */
  async deleteLead(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Fetch all staff profiles for assignee selection
   */
  async getStaffProfiles(): Promise<Profile[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.warn('Could not fetch staff profiles:', error.message);
      return [];
    }
    return (data as Profile[]) || [];
  },
};
