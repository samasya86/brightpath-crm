import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import type { LeadStatus, LeadSource, Profile } from '../../types';
import type { LeadFilters } from '../../services/leadsService';

export interface LeadFilterBarProps {
  filters: LeadFilters;
  onFilterChange: <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => void;
  onReset: () => void;
  staffProfiles?: Profile[];
}

export const LeadFilterBar: React.FC<LeadFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  staffProfiles = [],
}) => {
  const isFiltered =
    Boolean(filters.search) ||
    filters.status !== 'all' ||
    filters.source !== 'all' ||
    filters.assigneeId !== 'all';

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Search by student name, phone, course, or email..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onChange={(e) => onFilterChange('status', e.target.value as LeadStatus | 'all')}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'New', label: 'New' },
            { value: 'Contacted', label: 'Contacted' },
            { value: 'Qualified', label: 'Qualified' },
            { value: 'Converted', label: 'Converted' },
            { value: 'Lost', label: 'Lost' },
          ]}
        />

        {/* Source Filter */}
        <Select
          value={filters.source || 'all'}
          onChange={(e) => onFilterChange('source', e.target.value as LeadSource | 'all')}
          options={[
            { value: 'all', label: 'All Sources' },
            { value: 'Website', label: 'Website' },
            { value: 'Walk-in', label: 'Walk-in' },
            { value: 'Phone Call', label: 'Phone Call' },
            { value: 'Referral', label: 'Referral' },
            { value: 'Social Media', label: 'Social Media' },
            { value: 'Other', label: 'Other' },
          ]}
        />

        {/* Assignee Filter */}
        <div className="flex gap-2">
          <Select
            value={filters.assigneeId || 'all'}
            onChange={(e) => onFilterChange('assigneeId', e.target.value)}
            options={[
              { value: 'all', label: 'All Counsellors' },
              { value: 'unassigned', label: 'Unassigned' },
              ...staffProfiles.map((p) => ({
                value: p.id,
                label: p.full_name,
              })),
            ]}
          />

          {isFiltered && (
            <Button
              variant="outline"
              size="md"
              onClick={onReset}
              className="shrink-0 text-slate-500 hover:text-slate-800"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
