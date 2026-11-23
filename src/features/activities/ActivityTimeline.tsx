import React, { useState } from 'react';
import {
  UserPlus,
  ArrowRightCircle,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Clock,
  Send,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useActivities } from '../../hooks/useActivities';
import type { Activity, ActivityType } from '../../types';

export interface ActivityTimelineProps {
  leadId: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ leadId }) => {
  const { activities, isLoading, error, logNote } = useActivities(leadId);
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    try {
      await logNote(newNote.trim());
      setNewNote('');
    } catch (err) {
      console.error('Failed to log note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'created':
        return <UserPlus className="w-3.5 h-3.5 text-blue-600" />;
      case 'status_change':
        return <ArrowRightCircle className="w-3.5 h-3.5 text-indigo-600" />;
      case 'followup_created':
        return <Calendar className="w-3.5 h-3.5 text-amber-600" />;
      case 'followup_completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'note':
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  const getIconBackground = (type: ActivityType) => {
    switch (type) {
      case 'created':
        return 'bg-blue-100 ring-4 ring-blue-50';
      case 'status_change':
        return 'bg-indigo-100 ring-4 ring-indigo-50';
      case 'followup_created':
        return 'bg-amber-100 ring-4 ring-amber-50';
      case 'followup_completed':
        return 'bg-emerald-100 ring-4 ring-emerald-50';
      case 'note':
      default:
        return 'bg-purple-100 ring-4 ring-purple-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Add Note Box */}
      <form onSubmit={handleAddNote} className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Add Interaction Note
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            placeholder="Log call discussion, parent question, or counselling note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmittingNote}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Post
          </Button>
        </div>
      </form>

      {/* Timeline Stream */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
          Loading audit trail...
        </div>
      ) : error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : activities.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          No activity recorded yet for this enquiry.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {activities.map((act) => (
            <div key={act.id} className="relative flex items-start gap-3 text-xs">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${getIconBackground(
                  act.activity_type
                )}`}
              >
                {getActivityIcon(act.activity_type)}
              </div>

              {/* Activity Card */}
              <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="font-semibold text-slate-700">
                    {act.actor?.full_name || 'Staff Member'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(act.created_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {act.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
