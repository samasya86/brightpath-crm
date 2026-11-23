import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Percent,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { KpiCard } from '../features/dashboard/KpiCard';
import { StatusDistribution } from '../features/dashboard/StatusDistribution';
import { SourceDistribution } from '../features/dashboard/SourceDistribution';
import { RecentLeadsWidget } from '../features/dashboard/RecentLeadsWidget';
import { UrgentFollowupsWidget } from '../features/dashboard/UrgentFollowupsWidget';
import { LeadModal } from '../features/leads/LeadModal';
import { CardSkeleton } from '../components/common/Skeleton';
import { useMetrics } from '../hooks/useMetrics';
import { useAuth } from '../hooks/useAuth';
import { useLeads } from '../hooks/useLeads';
import { useToast } from '../hooks/useToast';
import type { CreateLeadInput } from '../services/leadsService';

export const DashboardPage: React.FC = () => {
  const { kpis, statusDistribution, sourceDistribution, recentLeads, urgentFollowups, isLoading, error, refetch } = useMetrics();
  const { profile, user, role } = useAuth();
  const { staffProfiles, createLead } = useLeads();
  const { showToast } = useToast();
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Counsellor';

  const handleCreateLead = async (input: CreateLeadInput) => {
    try {
      await createLead(input);
      refetch();
      showToast('success', 'Enquiry Created', `${input.name} has been enrolled in the pipeline.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create enquiry';
      showToast('error', 'Creation Failed', msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="blue" size="sm" dot>
              Live Analytics
            </Badge>
            <span className="text-xs text-slate-400 capitalize">
              Role: {role}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {displayName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Here is your live admissions intelligence. All counts reconcile with your active database records under PostgreSQL Row Level Security.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddLeadModalOpen(true)}
          className="shrink-0 shadow-lg shadow-indigo-600/30"
        >
          Add Enquiry
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to refresh KPI analytics</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <CardSkeleton rows={1} />
          <CardSkeleton rows={1} />
          <CardSkeleton rows={1} />
          <CardSkeleton rows={1} />
          <CardSkeleton rows={1} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="Total Enquiries"
            value={kpis.totalLeads}
            subtitle="Accessible student records"
            icon={Users}
            iconBg="bg-indigo-50 text-indigo-600"
          />

          <KpiCard
            title="New Leads"
            value={kpis.newLeads}
            subtitle="Awaiting initial outreach"
            icon={UserPlus}
            iconBg="bg-blue-50 text-blue-600"
          />

          <KpiCard
            title="Converted"
            value={kpis.convertedLeads}
            subtitle="Admitted students"
            icon={CheckCircle2}
            iconBg="bg-emerald-50 text-emerald-600"
          />

          <KpiCard
            title="Overdue Follow-ups"
            value={kpis.overdueFollowups}
            subtitle={kpis.overdueFollowups > 0 ? 'Requires immediate action' : 'All callbacks current'}
            icon={AlertCircle}
            iconBg={kpis.overdueFollowups > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}
            urgent={kpis.overdueFollowups > 0}
          />

          <KpiCard
            title="Conversion Rate"
            value={`${kpis.conversionRate}%`}
            subtitle="Admissions yield formula"
            icon={Percent}
            iconBg="bg-purple-50 text-purple-600"
          />
        </div>
      )}

      {/* Analytics & Pipeline Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatusDistribution
          distribution={statusDistribution}
          totalLeads={kpis.totalLeads}
        />

        <SourceDistribution
          distribution={sourceDistribution}
        />

        <UrgentFollowupsWidget
          followups={urgentFollowups}
        />
      </div>

      {/* Recent Leads Widget */}
      <RecentLeadsWidget leads={recentLeads} />

      {/* Add Lead Modal */}
      <LeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onSubmit={handleCreateLead}
        staffProfiles={staffProfiles}
      />
    </div>
  );
};
