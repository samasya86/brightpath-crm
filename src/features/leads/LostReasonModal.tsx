import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';

export interface LostReasonModalProps {
  isOpen: boolean;
  leadName: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export const LostReasonModal: React.FC<LostReasonModalProps> = ({
  isOpen,
  leadName,
  onClose,
  onConfirm,
}) => {
  const [selectedReason, setSelectedReason] = useState('Fees too high for parent');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasonOptions = [
    { value: 'Fees too high for parent', label: 'Fees too high / Budget constraint' },
    { value: 'Joined competitor coaching', label: 'Joined competitor institute' },
    { value: 'Batch timing mismatch', label: 'Class / Batch timing mismatch' },
    { value: 'Distance / Commute issue', label: 'Campus distance / Travel issue' },
    { value: 'Decided not to appear for exam', label: 'Decided not to pursue exam' },
    { value: 'Other', label: 'Other (Specify below)' },
  ];

  const handleConfirm = async () => {
    setError(null);
    const finalReason = selectedReason === 'Other' ? customReason.trim() : selectedReason;

    if (!finalReason) {
      setError('Please provide a specific reason before marking this enquiry as Lost.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(finalReason);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update lead status';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Reason for Lost Enquiry"
      description={`Specifying a reason is mandatory when marking "${leadName}" as Lost to maintain accurate admission conversion analytics.`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleConfirm}
          >
            Mark as Lost
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200/80 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>
            This action will update the lead lifecycle and record an audit log event with this explanation.
          </span>
        </div>

        <Select
          label="Primary Reason for Loss"
          options={reasonOptions}
          value={selectedReason}
          onChange={(e) => setSelectedReason(e.target.value)}
        />

        {selectedReason === 'Other' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Specific Explanation <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              placeholder="Explain why the student dropped off..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              required
            />
          </div>
        )}

        {error && (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        )}
      </div>
    </Modal>
  );
};
