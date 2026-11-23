import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, User } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { LeadStatusBadge } from '../leads/LeadStatusBadge';
import type { Lead } from '../../types';

export interface RecentLeadsWidgetProps {
  leads: Lead[];
}

export const RecentLeadsWidget: React.FC<RecentLeadsWidgetProps> = ({ leads }) => {
  return (
    <Card
      title="Recent Enquiries"
      subtitle="Latest student applications registered"
      headerAction={
        <Link
          to="/leads"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      }
      bodyClassName="p-0 overflow-x-auto"
    >
      {leads.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          <User className="w-6 h-6 mx-auto mb-2 text-slate-300" />
          No enquiries registered yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              to={`/leads/${lead.id}`}
              className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors block"
            >
              <div className="min-w-0 mr-3">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {lead.full_name}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {lead.course_interest} • {lead.source}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <LeadStatusBadge status={lead.status} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
};
