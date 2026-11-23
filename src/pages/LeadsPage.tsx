import React, { useState } from 'react';
import { Plus, Users, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LeadFilterBar } from '../features/leads/LeadFilterBar';
import { LeadTable } from '../features/leads/LeadTable';
import { LeadCard } from '../features/leads/LeadCard';
import { LeadModal } from '../features/leads/LeadModal';
import { useLeads } from '../hooks/useLeads';
import type { CreateLeadInput } from '../services/leadsService';

export const LeadsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    leads,
    staffProfiles,
    isLoading,
    error,
    filters,
    setFilter,
    resetFilters,
    createLead,
  } = useLeads();

  const handleCreateLead = async (input: CreateLeadInput) => {
    await createLead(input);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            All Student Enquiries
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Synchronizing with Supabase...
              </span>
            ) : (
              `${leads.length} ${leads.length === 1 ? 'enquiry' : 'enquiries'} found`
            )}
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add Enquiry
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <LeadFilterBar
        filters={filters}
        onFilterChange={setFilter}
        onReset={resetFilters}
        staffProfiles={staffProfiles}
      />

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to load enquiries</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content Area: Loading vs Empty vs Data */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading student pipeline...</p>
          <p className="text-xs text-slate-400 mt-1">Retrieving records under active Row Level Security</p>
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          title="No enquiries found"
          description={
            filters.search || filters.status !== 'all' || filters.source !== 'all'
              ? 'No student enquiries match your current search or filter criteria. Try resetting filters.'
              : 'Your admissions pipeline is currently empty. Register your first student enquiry to get started!'
          }
          icon={<Users className="w-8 h-8 text-slate-400" />}
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Add First Enquiry
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block">
            <LeadTable leads={leads} />
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </>
      )}

      {/* Create Lead Modal */}
      <LeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateLead}
        staffProfiles={staffProfiles}
      />
    </div>
  );
};
