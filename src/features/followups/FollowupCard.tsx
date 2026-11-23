import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, UserCheck, Check, Ban } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { OverdueBadge } from './OverdueBadge';
import { isFollowupOverdue } from '../../hooks/useFollowups';
import type { FollowUp } from '../../types';

export interface FollowupCardProps {
  followup: FollowUp;
  onMarkComplete: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  hideLeadLink?: boolean;
}

export const FollowupCard: React.FC<FollowupCardProps> = ({
  followup,
  onMarkComplete,
  onCancel,
  hideLeadLink = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isOverdue = isFollowupOverdue(followup);

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      await onMarkComplete(followup.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    setIsProcessing(true);
    try {
      await onCancel(followup.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const dueDateFormatted = new Date(followup.due_at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      bodyClassName={`p-4 transition-all duration-150 ${
        isOverdue ? 'bg-rose-50/20 border-rose-200' : 'bg-white'
      }`}
      hoverLift
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {!hideLeadLink && followup.lead && (
              <Link
                to={`/leads/${followup.lead_id}`}
                className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
              >
                {followup.lead.full_name}
              </Link>
            )}

            {!hideLeadLink && followup.lead && (
              <>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-600 truncate max-w-[200px]">
                  {followup.lead.course_interest}
                </span>
              </>
            )}

            <OverdueBadge followup={followup} />
          </div>

          <p className="text-sm text-slate-800 font-medium leading-relaxed">
            {followup.note}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Due: {dueDateFormatted}
            </span>

            {followup.assignee && (
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>{followup.assignee.full_name}</span>
              </span>
            )}

            {followup.completed_at && (
              <span className="text-emerald-700 font-medium">
                Completed on {new Date(followup.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {followup.status === 'pending' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                isLoading={isProcessing}
                leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={handleComplete}
                className="hover:border-emerald-300 hover:bg-emerald-50 text-slate-700"
              >
                Mark Completed
              </Button>

              {onCancel && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleCancel}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Cancel follow-up"
                  aria-label="Cancel follow-up"
                >
                  <Ban className="w-4 h-4" />
                </button>
              )}
            </>
          ) : followup.status === 'completed' ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Done
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium italic">
              Cancelled
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
