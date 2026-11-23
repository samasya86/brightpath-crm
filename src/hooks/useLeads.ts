import { useState, useEffect, useCallback } from 'react';
import { leadsService, type LeadFilters, type CreateLeadInput, type UpdateLeadInput } from '../services/leadsService';
import type { Lead, LeadStatus, LeadSource, Profile } from '../types';

export const useLeads = (initialFilters?: LeadFilters) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<LeadFilters>({
    search: initialFilters?.search || '',
    status: initialFilters?.status || 'all',
    source: initialFilters?.source || 'all',
    assigneeId: initialFilters?.assigneeId || 'all',
  });

  const fetchStaff = useCallback(async () => {
    try {
      const profiles = await leadsService.getStaffProfiles();
      setStaffProfiles(profiles);
    } catch (err) {
      console.warn('Could not load staff profiles:', err);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await leadsService.getLeads(filters);
      setLeads(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load leads from database';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    // Debounce search/filter queries by 200ms
    const timer = setTimeout(() => {
      fetchLeads();
    }, 200);

    return () => clearTimeout(timer);
  }, [fetchLeads]);

  const setFilter = <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      source: 'all',
      assigneeId: 'all',
    });
  };

  const createLead = async (input: CreateLeadInput): Promise<Lead> => {
    const newLead = await leadsService.createLead(input);
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  };

  const updateLead = async (id: string, updates: UpdateLeadInput): Promise<Lead> => {
    const updated = await leadsService.updateLead(id, updates);
    setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
    return updated;
  };

  const updateStatus = async (
    id: string,
    newStatus: LeadStatus,
    lostReason?: string | null,
    previousStatus?: string
  ): Promise<Lead> => {
    const updated = await leadsService.updateLeadStatus(id, newStatus, lostReason, previousStatus);
    setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
    return updated;
  };

  const deleteLead = async (id: string): Promise<void> => {
    await leadsService.deleteLead(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  return {
    leads,
    staffProfiles,
    isLoading,
    error,
    filters,
    setFilter,
    resetFilters,
    refetch: fetchLeads,
    createLead,
    updateLead,
    updateStatus,
    deleteLead,
  };
};
