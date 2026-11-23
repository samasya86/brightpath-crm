import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Lead, FollowUp, LeadStatus, LeadSource } from '../types';

export interface DashboardMetrics {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  overdueFollowups: number;
  conversionRate: number; // Percentage with 1 decimal place, e.g. 25.0
}

export interface StatusDistributionItem {
  stage: LeadStatus;
  count: number;
  percentage: number;
  color: string;
}

export interface SourceDistributionItem {
  source: LeadSource;
  count: number;
  percentage: number;
  convertedCount: number;
  yieldPercentage: number;
}

export const metricsService = {
  /**
   * Calculate live KPI metrics and distributions reconciling directly with database records
   */
  async getDashboardMetrics(): Promise<{
    kpis: DashboardMetrics;
    statusDistribution: StatusDistributionItem[];
    sourceDistribution: SourceDistributionItem[];
    recentLeads: Lead[];
    urgentFollowups: FollowUp[];
  }> {
    if (!isSupabaseConfigured) {
      return {
        kpis: {
          totalLeads: 0,
          newLeads: 0,
          convertedLeads: 0,
          overdueFollowups: 0,
          conversionRate: 0,
        },
        statusDistribution: [],
        sourceDistribution: [],
        recentLeads: [],
        urgentFollowups: [],
      };
    }

    // 1. Query all leads accessible to the user under RLS
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select(`
        *,
        assigned_profile:profiles!assigned_to(id, full_name, role),
        creator_profile:profiles!created_by(id, full_name, role)
      `)
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('Error calculating lead metrics:', leadsError);
      throw leadsError;
    }

    const leads = (leadsData as unknown as Lead[]) || [];

    // 2. Query all follow-ups accessible to the user under RLS
    const { data: followupsData, error: followupsError } = await supabase
      .from('follow_ups')
      .select(`
        *,
        lead:leads(id, full_name, phone, course_interest),
        assignee:profiles!assigned_to(id, full_name, role)
      `)
      .order('due_at', { ascending: true });

    if (followupsError) {
      console.error('Error calculating follow-up metrics:', followupsError);
      throw followupsError;
    }

    const followups = (followupsData as unknown as FollowUp[]) || [];

    // 3. Compute KPI Counts
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'New').length;
    const convertedLeads = leads.filter((l) => l.status === 'Converted').length;

    // Overdue is strictly pending items where due_at < now()
    const now = Date.now();
    const overdueFollowups = followups.filter(
      (f) => f.status === 'pending' && new Date(f.due_at).getTime() < now
    ).length;

    // Conversion rate protected against division by zero
    const conversionRate =
      totalLeads > 0
        ? parseFloat(((convertedLeads / totalLeads) * 100).toFixed(1))
        : 0;

    // 4. Compute Status Distribution
    const stages: { stage: LeadStatus; color: string }[] = [
      { stage: 'New', color: 'bg-blue-500' },
      { stage: 'Contacted', color: 'bg-amber-500' },
      { stage: 'Qualified', color: 'bg-purple-500' },
      { stage: 'Converted', color: 'bg-emerald-500' },
      { stage: 'Lost', color: 'bg-rose-500' },
    ];

    const statusDistribution: StatusDistributionItem[] = stages.map(({ stage, color }) => {
      const count = leads.filter((l) => l.status === stage).length;
      const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
      return { stage, count, percentage, color };
    });

    // 5. Compute Source Distribution
    const sources: LeadSource[] = [
      'Website',
      'Walk-in',
      'Phone Call',
      'Referral',
      'Social Media',
      'Other',
    ];

    const sourceDistribution: SourceDistributionItem[] = sources
      .map((source) => {
        const sourceLeads = leads.filter((l) => l.source === source);
        const count = sourceLeads.length;
        const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
        const sourceConverted = sourceLeads.filter((l) => l.status === 'Converted').length;
        const yieldPercentage =
          count > 0 ? Math.round((sourceConverted / count) * 100) : 0;

        return {
          source,
          count,
          percentage,
          convertedCount: sourceConverted,
          yieldPercentage,
        };
      })
      .filter((s) => s.count > 0); // Only show sources that have at least 1 enquiry

    // 6. Recent Leads (top 5)
    const recentLeads = leads.slice(0, 5);

    // 7. Urgent Follow-ups (top 5 pending items, prioritizing overdue)
    const pendingFollowups = followups.filter((f) => f.status === 'pending');
    const urgentFollowups = pendingFollowups.slice(0, 5);

    return {
      kpis: {
        totalLeads,
        newLeads,
        convertedLeads,
        overdueFollowups,
        conversionRate,
      },
      statusDistribution,
      sourceDistribution,
      recentLeads,
      urgentFollowups,
    };
  },
};
