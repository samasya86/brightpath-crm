import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LeadStatusBadge } from './LeadStatusBadge';
import type { Lead } from '../../types';

export interface LeadCardProps {
  lead: Lead;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  return (
    <Card bodyClassName="p-4 space-y-3" hoverLift>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            to={`/leads/${lead.id}`}
            className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
          >
            {lead.full_name}
          </Link>
          <p className="text-xs text-slate-500 mt-0.5">{lead.course_interest}</p>
        </div>
        <LeadStatusBadge status={lead.status} size="sm" />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        <a
          href={`tel:${lead.phone}`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-medium hover:text-indigo-600"
        >
          <Phone className="w-3 h-3 text-slate-400" />
          {lead.phone}
        </a>

        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 truncate max-w-[150px]"
          >
            <Mail className="w-3 h-3 text-slate-400" />
            {lead.email}
          </a>
        )}

        <Badge variant="slate" size="sm">
          {lead.source}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
          {lead.assigned_profile?.full_name || 'Unassigned'}
        </span>

        <Link
          to={`/leads/${lead.id}`}
          className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline"
        >
          View Profile <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </Card>
  );
};
