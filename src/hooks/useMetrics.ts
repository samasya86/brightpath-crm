import { useState, useEffect, useCallback } from 'react';
import {
  metricsService,
  type DashboardMetrics,
  type StatusDistributionItem,
  type SourceDistributionItem,
} from '../services/metricsService';
import type { Lead, FollowUp } from '../types';

export const useMetrics = () => {
  const [kpis, setKpis] = useState<DashboardMetrics>({
    totalLeads: 0,
    newLeads: 0,
    convertedLeads: 0,
    overdueFollowups: 0,
    conversionRate: 0,
  });

  const [statusDistribution, setStatusDistribution] = useState<StatusDistributionItem[]>([]);
  const [sourceDistribution, setSourceDistribution] = useState<SourceDistributionItem[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [urgentFollowups, setUrgentFollowups] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await metricsService.getDashboardMetrics();
      setKpis(data.kpis);
      setStatusDistribution(data.statusDistribution);
      setSourceDistribution(data.sourceDistribution);
      setRecentLeads(data.recentLeads);
      setUrgentFollowups(data.urgentFollowups);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to calculate CRM metrics';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    kpis,
    statusDistribution,
    sourceDistribution,
    recentLeads,
    urgentFollowups,
    isLoading,
    error,
    refetch: fetchMetrics,
  };
};
