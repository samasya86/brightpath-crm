import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Inbox,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { FollowupCard } from '../features/followups/FollowupCard';
import { FollowupModal } from '../features/followups/FollowupModal';
import { useFollowups, type FollowupTab } from '../hooks/useFollowups';
import { leadsService } from '../services/leadsService';
import type { Profile } from '../types';
import type { CreateFollowupInput } from '../services/followupsService';

export const FollowupsPage: React.FC = () => {
  const {
    followups,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    counts,
    scheduleFollowup,
    markCompleted,
    cancelFollowup,
  } = useFollowups();

  const [staffProfiles, setStaffProfiles] = useState<Profile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    leadsService.getStaffProfiles().then(setStaffProfiles);
  }, []);

  const handleCreate = async (input: CreateFollowupInput) => {
    await scheduleFollowup(input);
  };

  const tabs: { key: FollowupTab; label: string; count: number; badgeColor?: string }[] = [
    { key: 'all', label: 'All Schedules', count: counts.all },
    {
      key: 'overdue',
      label: 'Overdue',
      count: counts.overdue,
      badgeColor: counts.overdue > 0 ? 'bg-rose-500 text-white' : undefined,
    },
    { key: 'today', label: 'Due Today', count: counts.today },
    { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { key: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Follow-up Queue & Schedules
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Fetching callback queue...
              </span>
            ) : (
              'Manage prospective student interactions and eliminate enquiry drop-offs'
            )}
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          New Follow-up
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tab.badgeColor
                  ? tab.badgeColor
                  : activeTab === tab.key
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Main List */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading follow-ups...</p>
        </div>
      ) : followups.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'overdue'
              ? 'No overdue follow-ups!'
              : activeTab === 'today'
              ? 'No follow-ups due today'
              : 'No follow-up schedules found'
          }
          description={
            activeTab === 'overdue'
              ? 'Excellent work! All student callbacks are current and up-to-date.'
              : 'You have no scheduled follow-ups under this tab. Schedule a callback to stay connected.'
          }
          icon={<CalendarCheck className="w-8 h-8 text-slate-400" />}
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Schedule Follow-up
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {followups.map((item) => (
            <FollowupCard
              key={item.id}
              followup={item}
              onMarkComplete={markCompleted}
              onCancel={cancelFollowup}
            />
          ))}
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      <FollowupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        staffProfiles={staffProfiles}
      />
    </div>
  );
};
