import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import type { Lead, LeadSource, Profile } from '../../types';
import type { CreateLeadInput, UpdateLeadInput } from '../../services/leadsService';

export interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadInput | UpdateLeadInput) => Promise<void>;
  initialData?: Lead | null;
  staffProfiles?: Profile[];
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  staffProfiles = [],
}) => {
  const isEditing = Boolean(initialData);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [courseInterest, setCourseInterest] = useState('');
  const [source, setSource] = useState<LeadSource>('Website');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.full_name || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setCourseInterest(initialData.course_interest || '');
      setSource(initialData.source || 'Website');
      setAssignedTo(initialData.assigned_to || '');
      setNotes(initialData.notes || '');
    } else {
      setFullName('');
      setPhone('');
      setEmail('');
      setCourseInterest('');
      setSource('Website');
      setAssignedTo('');
      setNotes('');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Student full name is required.');
      return;
    }

    if (!phone.trim()) {
      setError('Contact phone number is required.');
      return;
    }

    if (!courseInterest.trim()) {
      setError('Target course of interest is required.');
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please provide a valid email format or leave it blank.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        course_interest: courseInterest.trim(),
        source,
        assigned_to: assignedTo || null,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save lead record';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sourceOptions = [
    { value: 'Website', label: 'Website Form' },
    { value: 'Walk-in', label: 'Walk-in (Campus)' },
    { value: 'Phone Call', label: 'Incoming Phone Call' },
    { value: 'Referral', label: 'Student / Parent Referral' },
    { value: 'Social Media', label: 'Social Media / Ad Campaign' },
    { value: 'Other', label: 'Other Source' },
  ];

  const assigneeOptions = [
    { value: '', label: 'Unassigned / Auto-assign to me' },
    ...staffProfiles.map((p) => ({
      value: p.id,
      label: `${p.full_name} (${p.role})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Student Enquiry' : 'Register New Enquiry'}
      description={
        isEditing
          ? 'Update student contact details or target academic program.'
          : 'Capture a prospective student enquiry into the admissions funnel.'
      }
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
            {isEditing ? 'Save Changes' : 'Register Enquiry'}
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

        <Input
          label="Student Full Name"
          placeholder="e.g. Aarav Sharma"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Phone Number"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <Input
            label="Email Address (Optional)"
            placeholder="e.g. student@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Input
          label="Target Course of Interest"
          placeholder="e.g. JEE Advanced 2-Year Batch / NEET FastTrack"
          value={courseInterest}
          onChange={(e) => setCourseInterest(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Enquiry Channel"
            options={sourceOptions}
            value={source}
            onChange={(e) => setSource(e.target.value as LeadSource)}
          />

          <Select
            label="Assigned Counsellor"
            options={assigneeOptions}
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Initial Counsellor Notes (Optional)
          </label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            placeholder="Student batch preferences, questions about scholarships, or parent requirements..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
