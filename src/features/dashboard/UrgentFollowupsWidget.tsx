import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Clock } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { OverdueBadge } from '../followups/OverdueBadge';
import type { FollowUp } from '../../types';

export interface UrgentFollowupsWidgetProps {
  followups: FollowUp[];
}

export const UrgentFollowupsWidget: React.FC<UrgentFollowupsWidgetProps> = ({ followups }) => {
  return (
    <Card
      title="Urgent Callbacks"
      subtitle="Pending interactions requiring attention"
      headerAction={
        <Link
          to="/followups"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
        >
          View queue <ArrowRight className="w-3 h-3" />
        </Link>
      }
    >
      {followups.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          <CalendarCheck className="w-6 h-6 mx-auto mb-2 text-slate-300" />
          No urgent callbacks scheduled. All caught up!
        </div>
      ) : (
        <div className="space-y-3">
          {followups.map((fu) => (
            <Link
              key={fu.id}
              to={fu.lead ? `/leads/${fu.lead_id}` : '/followups'}
              className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors bg-white flex items-start justify-between gap-3 block"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {fu.lead?.full_name || 'Student Lead'}
                </p>
                <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                  {fu.note}
                </p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  Due: {new Date(fu.due_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="shrink-0">
                <OverdueBadge followup={fu} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
};
