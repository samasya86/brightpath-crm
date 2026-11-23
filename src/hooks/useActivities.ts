import { useState, useEffect, useCallback } from 'react';
import { activitiesService } from '../services/activitiesService';
import type { Activity } from '../types';

export const useActivities = (leadId?: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!leadId) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await activitiesService.getActivitiesByLeadId(leadId);
      setActivities(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve activity log';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const logNote = async (noteText: string): Promise<Activity> => {
    if (!leadId) throw new Error('leadId is required to log note.');
    const newActivity = await activitiesService.logNote(leadId, noteText);
    setActivities((prev) => [newActivity, ...prev]);
    return newActivity;
  };

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivities,
    logNote,
  };
};
