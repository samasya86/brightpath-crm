import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  BookOpen,
  User,
  Clock,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Select } from '../components/common/Select';
import { LeadStatusBadge } from '../features/leads/LeadStatusBadge';
import { LeadModal } from '../features/leads/LeadModal';
import { LostReasonModal } from '../features/leads/LostReasonModal';
import { leadsService, type UpdateLeadInput } from '../services/leadsService';
import { useAuth } from '../hooks/useAuth';
import type { Lead, LeadStatus, Profile } from '../types';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [lead, setLead] = useState<Lead | null>(null);
  const [staffProfiles, setStaffProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadLead = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [leadData, profiles] = await Promise.all([
        leadsService.getLeadById(id),
        leadsService.getStaffProfiles(),
      ]);
      setLead(leadData);
      setStaffProfiles(profiles);
      if (!leadData) {
        setError('The requested student enquiry could not be found or has been removed.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve enquiry details';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || isUpdatingStatus) return;

    if (newStatus === 'Lost') {
      setIsLostModalOpen(true);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const updated = await leadsService.updateLeadStatus(lead.id, newStatus, null, lead.status);
      setLead(updated);
    } catch (err: unknown) {
      console.error('Failed to update status:', err);
      alert('Could not update status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmLost = async (reason: string) => {
    if (!lead) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await leadsService.updateLeadStatus(lead.id, 'Lost', reason, lead.status);
      setLead(updated);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEditLead = async (updates: UpdateLeadInput) => {
    if (!lead) return;
    const updated = await leadsService.updateLead(lead.id, updates);
    setLead(updated);
  };

  const handleReassign = async (newAssigneeId: string) => {
    if (!lead) return;
    try {
      const updated = await leadsService.updateLead(lead.id, {
        assigned_to: newAssigneeId || null,
      });
      setLead(updated);
    } catch (err) {
      console.error('Failed to reassign:', err);
    }
  };

  const handleDeleteLead = async () => {
    if (!lead || !window.confirm(`Are you sure you want to delete "${lead.full_name}"? This action is permanent.`)) {
      return;
    }

    try {
      await leadsService.deleteLead(lead.id);
      navigate('/leads');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete lead';
      alert(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading student profile...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Enquiry Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
        <Link to="/leads">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to all enquiries
          </Button>
        </Link>
      </div>
    );
  }

  const initials = lead.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const statusOptions: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all enquiries
        </Link>

        {(role === 'admin' || role === 'manager') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteLead}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete Lead
          </Button>
        )}
      </div>

      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-700 font-extrabold text-xl shadow-2xs">
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {lead.full_name}
              </h2>
              <LeadStatusBadge status={lead.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span>Channel: <strong>{lead.source}</strong></span>
              <span>•</span>
              <span>Registered on {new Date(lead.created_at).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Quick Contact */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
          <a href={`tel:${lead.phone}`}>
            <Button variant="outline" size="sm" leftIcon={<Phone className="w-3.5 h-3.5" />}>
              Call
            </Button>
          </a>
          {lead.email && (
            <a href={`mailto:${lead.email}`}>
              <Button variant="outline" size="sm" leftIcon={<Mail className="w-3.5 h-3.5" />}>
                Email
              </Button>
            </a>
          )}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Edit className="w-3.5 h-3.5" />}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Details
          </Button>
        </div>
      </div>

      {/* Status Progression Bar */}
      <Card bodyClassName="p-4 bg-slate-50/70 border-dashed border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Enquiry Status:
            </span>
            <span className="text-xs text-slate-500">
              Click to advance student lifecycle
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {statusOptions.map((st) => (
              <button
                key={st}
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  lead.status === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Lost Reason Alert if applicable */}
      {lead.status === 'Lost' && lead.lost_reason && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Lead Marked as Lost</p>
            <p className="mt-0.5 font-medium">Reason recorded: "{lead.lost_reason}"</p>
          </div>
        </div>
      )}

      {/* Main Grid: Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Information */}
        <div className="space-y-6">
          <Card title="Student Information">
            <dl className="space-y-4 text-xs">
              <div>
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">
                  Target Course
                </dt>
                <dd className="text-slate-900 font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  {lead.course_interest}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">
                  Contact Phone
                </dt>
                <dd className="text-slate-900 font-medium text-sm mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${lead.phone}`} className="hover:text-indigo-600">
                    {lead.phone}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">
                  Email Address
                </dt>
                <dd className="text-slate-900 font-medium text-sm mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`} className="hover:text-indigo-600">
                      {lead.email}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">
                  Assigned Counsellor
                </dt>
                <dd className="text-slate-900 font-medium text-sm mt-1">
                  {role === 'admin' || role === 'manager' ? (
                    <Select
                      value={lead.assigned_to || ''}
                      onChange={(e) => handleReassign(e.target.value)}
                      options={[
                        { value: '', label: 'Unassigned' },
                        ...staffProfiles.map((p) => ({
                          value: p.id,
                          label: `${p.full_name} (${p.role})`,
                        })),
                      ]}
                    />
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-slate-700">
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      {lead.assigned_profile?.full_name || 'Unassigned'}
                    </span>
                  )}
                </dd>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">
                  Counsellor Notes
                </dt>
                <dd className="text-slate-700 mt-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {lead.notes || <span className="text-slate-400 italic">No notes recorded yet.</span>}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Right Columns: Follow-ups Queue & Activity Timeline Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Scheduled Interactions & Follow-ups"
            subtitle="Scheduled interactions for this student"
            headerAction={
              <Link to="/followups">
                <Button variant="outline" size="sm">
                  Manage in Follow-ups
                </Button>
              </Link>
            }
          >
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Follow-up Engine (Phase 6)</p>
              <p className="mt-0.5">
                Full callback scheduling, date/time picker, and overdue detection will connect in the next phase!
              </p>
            </div>
          </Card>

          <Card
            title="Activity Audit Log"
            subtitle="Timeline of lead creation and status changes"
          >
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Lead Status: <span className="font-bold">{lead.status}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Current stage in the admissions pipeline
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Enquiry Registered
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Source: {lead.source} • Created on {new Date(lead.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Lead Modal */}
      <LeadModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditLead}
        initialData={lead}
        staffProfiles={staffProfiles}
      />

      {/* Mandatory Lost Reason Modal */}
      <LostReasonModal
        isOpen={isLostModalOpen}
        leadName={lead.full_name}
        onClose={() => setIsLostModalOpen(false)}
        onConfirm={handleConfirmLost}
      />
    </div>
  );
};
