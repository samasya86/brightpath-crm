import { useState, useEffect, useCallback, useMemo } from 'react';
import { followupsService, type CreateFollowupInput } from '../services/followupsService';
import type { FollowUp } from '../types';

export type FollowupTab = 'all' | 'overdue' | 'today' | 'upcoming' | 'completed';

export const isFollowupOverdue = (item: FollowUp): boolean => {
  return item.status === 'pending' && new Date(item.due_at).getTime() < Date.now();
};

export const isFollowupDueToday = (item: FollowUp): boolean => {
  if (item.status !== 'pending') return false;
  const dueDate = new Date(item.due_at);
  const today = new Date();
  return (
    dueDate.getDate() === today.getDate() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getFullYear() === today.getFullYear()
  );
};

export const useFollowups = (leadId?: string) => {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FollowupTab>('all');

  const fetchFollowups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await followupsService.getFollowups({ leadId });
      setFollowups(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load follow-up schedules';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  // Tab counts
  const counts = useMemo(() => {
    let overdue = 0;
    let today = 0;
    let upcoming = 0;
    let completed = 0;

    for (const f of followups) {
      if (f.status === 'completed') {
        completed++;
      } else if (isFollowupOverdue(f)) {
        overdue++;
      } else if (isFollowupDueToday(f)) {
        today++;
      } else if (f.status === 'pending') {
        upcoming++;
      }
    }

    return {
      all: followups.length,
      overdue,
      today,
      upcoming,
      completed,
    };
  }, [followups]);

  // Filtered list
  const filteredFollowups = useMemo(() => {
    return followups.filter((item) => {
      if (activeTab === 'overdue') return isFollowupOverdue(item);
      if (activeTab === 'today') return isFollowupDueToday(item);
      if (activeTab === 'upcoming') return item.status === 'pending' && !isFollowupOverdue(item);
      if (activeTab === 'completed') return item.status === 'completed';
      return true;
    });
  }, [followups, activeTab]);

  const scheduleFollowup = async (input: CreateFollowupInput): Promise<FollowUp> => {
    const created = await followupsService.createFollowup(input);
    setFollowups((prev) => [...prev, created].sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()));
    return created;
  };

  const markCompleted = async (id: string, note?: string): Promise<FollowUp> => {
    const target = followups.find((f) => f.id === id);
    const updated = await followupsService.markCompleted(id, target?.lead_id, note || target?.note);
    setFollowups((prev) => prev.map((f) => (f.id === id ? updated : f)));
    return updated;
  };

  const cancelFollowup = async (id: string): Promise<FollowUp> => {
    const target = followups.find((f) => f.id === id);
    const updated = await followupsService.cancelFollowup(id, target?.lead_id);
    setFollowups((prev) => prev.map((f) => (f.id === id ? updated : f)));
    return updated;
  };

  return {
    followups: filteredFollowups,
    allFollowups: followups,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    counts,
    refetch: fetchFollowups,
    scheduleFollowup,
    markCompleted,
    cancelFollowup,
  };
};
