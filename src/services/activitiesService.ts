import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Activity, ActivityType } from '../types';

export const activitiesService = {
  /**
   * Fetch all activity events for a specific lead ordered chronologically
   */
  async getActivitiesByLeadId(leadId: string): Promise<Activity[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        actor:profiles!actor_id(id, full_name, role)
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }

    return (data as unknown as Activity[]) || [];
  },

  /**
   * Log a note or general interaction into the lead's audit timeline
   */
  async logNote(leadId: string, noteText: string): Promise<Activity> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be signed in to log a note.');

    const { data, error } = await supabase
      .from('activities')
      .insert({
        lead_id: leadId,
        actor_id: user.id,
        activity_type: 'note' as ActivityType,
        description: noteText.trim(),
      })
      .select(`
        *,
        actor:profiles!actor_id(id, full_name, role)
      `)
      .single();

    if (error) throw error;

    return data as unknown as Activity;
  },
};
