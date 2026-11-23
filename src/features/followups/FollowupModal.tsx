import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { leadsService } from '../../services/leadsService';
import type { Lead, Profile } from '../../types';
import type { CreateFollowupInput } from '../../services/followupsService';

export interface FollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateFollowupInput) => Promise<void>;
  preselectedLead?: { id: string; full_name: string } | null;
  staffProfiles?: Profile[];
}

export const FollowupModal: React.FC<FollowupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  preselectedLead,
  staffProfiles = [],
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState(preselectedLead?.id || '');
  const [availableLeads, setAvailableLeads] = useState<Lead[]>([]);
  const [dueAt, setDueAt] = useState('');
  const [note, setNote] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default due_at to tomorrow at 10:00 AM
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Format to YYYY-MM-DDTHH:mm for datetime-local
      const tzOffset = tomorrow.getTimezoneOffset() * 60000;
      const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
      setDueAt(localISOTime);

      setSelectedLeadId(preselectedLead?.id || '');
      setNote('');
      setAssignedTo('');
      setError(null);

      // If no preselected lead, load recent leads for selection
      if (!preselectedLead) {
        leadsService.getLeads().then((data) => {
          setAvailableLeads(data);
          if (data.length > 0 && !selectedLeadId) {
            setSelectedLeadId(data[0].id);
          }
        });
      }
    }
  }, [isOpen, preselectedLead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const targetLeadId = preselectedLead?.id || selectedLeadId;

    if (!targetLeadId) {
      setError('Please select a student enquiry for this callback.');
      return;
    }

    if (!dueAt) {
      setError('Please specify a due date and time.');
      return;
    }

    if (!note.trim()) {
      setError('Please provide a follow-up instruction or note.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        lead_id: targetLeadId,
        due_at: new Date(dueAt).toISOString(),
        note: note.trim(),
        assigned_to: assignedTo || null,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to schedule follow-up';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const leadOptions = availableLeads.map((l) => ({
    value: l.id,
    label: `${l.full_name} (${l.course_interest})`,
  }));

  const assigneeOptions = [
    { value: '', label: 'Assign to me (default)' },
    ...staffProfiles.map((p) => ({
      value: p.id,
      label: `${p.full_name} (${p.role})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Follow-up Interaction"
      description="Plan a student callback, counselling session, or parent follow-up."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Save Schedule
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Lead Selector or Preselected Readonly Name */}
        {preselectedLead ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Student Enquiry
            </label>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900">
              {preselectedLead.full_name}
            </div>
          </div>
        ) : (
          <Select
            label="Select Student Enquiry"
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            options={leadOptions}
            required
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Due Date & Time"
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            required
          />

          <Select
            label="Assignee"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            options={assigneeOptions}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Callback Instructions / Note <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            placeholder="e.g. Call parent regarding scholarship test syllabus and fee structure discount..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
};
