import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { FollowUp, FollowupStatus } from '../types';

export interface CreateFollowupInput {
  lead_id: string;
  assigned_to?: string | null;
  due_at: string;
  note: string;
}

export const followupsService = {
  /**
   * Fetch follow-ups with joined student lead & staff assignee details
   */
  async getFollowups(options?: {
    leadId?: string;
    status?: FollowupStatus | 'all';
  }): Promise<FollowUp[]> {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from('follow_ups')
      .select(`
        *,
        lead:leads(id, full_name, phone, course_interest),
        assignee:profiles!assigned_to(id, full_name, role)
      `)
      .order('due_at', { ascending: true });

    if (options?.leadId) {
      query = query.eq('lead_id', options.leadId);
    }

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error loading follow-ups:', error);
      throw error;
    }

    return (data as unknown as FollowUp[]) || [];
  },

  /**
   * Schedule a new follow-up callback
   */
  async createFollowup(input: CreateFollowupInput): Promise<FollowUp> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be signed in to schedule a follow-up.');

    const insertPayload = {
      lead_id: input.lead_id,
      assigned_to: input.assigned_to || user.id,
      due_at: input.due_at,
      note: input.note.trim(),
      status: 'pending' as FollowupStatus,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from('follow_ups')
      .insert(insertPayload)
      .select(`
        *,
        lead:leads(id, full_name, phone, course_interest),
        assignee:profiles!assigned_to(id, full_name, role)
      `)
      .single();

    if (error) throw error;

    // Automatically record an audit log event in activities
    try {
      const formattedDate = new Date(input.due_at).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      await supabase.from('activities').insert({
        lead_id: input.lead_id,
        actor_id: user.id,
        activity_type: 'followup_created',
        description: `Follow-up scheduled for ${formattedDate}: "${input.note.trim()}"`,
        metadata: { followup_id: data.id, due_at: input.due_at },
      });
    } catch (activityErr) {
      console.warn('Could not log follow-up creation activity:', activityErr);
    }

    return data as unknown as FollowUp;
  },

  /**
   * Mark a follow-up as completed with timestamp
   */
  async markCompleted(id: string, leadId?: string, note?: string): Promise<FollowUp> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be signed in.');

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('follow_ups')
      .update({
        status: 'completed',
        completed_at: now,
      })
      .eq('id', id)
      .select(`
        *,
        lead:leads(id, full_name, phone, course_interest),
        assignee:profiles!assigned_to(id, full_name, role)
      `)
      .single();

    if (error) throw error;

    // Log completion in activity audit log
    if (leadId || data?.lead_id) {
      try {
        await supabase.from('activities').insert({
          lead_id: leadId || data.lead_id,
          actor_id: user.id,
          activity_type: 'followup_completed',
          description: note ? `Follow-up marked completed: "${note}"` : 'Follow-up marked completed',
          metadata: { followup_id: id, completed_at: now },
        });
      } catch (activityErr) {
        console.warn('Could not log follow-up completion activity:', activityErr);
      }
    }

    return data as unknown as FollowUp;
  },

  /**
   * Cancel a scheduled follow-up
   */
  async cancelFollowup(id: string, leadId?: string): Promise<FollowUp> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be signed in.');

    const { data, error } = await supabase
      .from('follow_ups')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select(`
        *,
        lead:leads(id, full_name, phone, course_interest),
        assignee:profiles!assigned_to(id, full_name, role)
      `)
      .single();

    if (error) throw error;

    if (leadId || data?.lead_id) {
      try {
        await supabase.from('activities').insert({
          lead_id: leadId || data.lead_id,
          actor_id: user.id,
          activity_type: 'note',
          description: 'Follow-up callback was cancelled',
          metadata: { followup_id: id },
        });
      } catch (activityErr) {
        console.warn('Could not log cancellation activity:', activityErr);
      }
    }

    return data as unknown as FollowUp;
  },
};
