import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Eye, Calendar, UserCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LeadStatusBadge } from './LeadStatusBadge';
import type { Lead } from '../../types';

export interface LeadTableProps {
  leads: Lead[];
  onOpenLostModal?: (lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads }) => {
  return (
    <Card bodyClassName="p-0 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-6">Student Name</th>
            <th className="py-3.5 px-6">Contact Info</th>
            <th className="py-3.5 px-6">Course of Interest</th>
            <th className="py-3.5 px-6">Source</th>
            <th className="py-3.5 px-6">Status</th>
            <th className="py-3.5 px-6">Assigned Counsellor</th>
            <th className="py-3.5 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="hover:bg-slate-50/70 transition-colors duration-150"
            >
              {/* Student Name */}
              <td className="py-4 px-6 font-semibold text-slate-900">
                <Link
                  to={`/leads/${lead.id}`}
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                >
                  <span>{lead.full_name}</span>
                </Link>
                <p className="text-xs font-normal text-slate-400 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(lead.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </td>

              {/* Contact Info */}
              <td className="py-4 px-6">
                <div className="space-y-1">
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-xs text-slate-700 hover:text-indigo-600 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3 h-3 text-slate-400" />
                    {lead.phone}
                  </a>
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors truncate max-w-[180px]"
                    >
                      <Mail className="w-3 h-3 text-slate-400" />
                      {lead.email}
                    </a>
                  )}
                </div>
              </td>

              {/* Course */}
              <td className="py-4 px-6 text-xs text-slate-800 font-medium max-w-xs truncate">
                {lead.course_interest}
              </td>

              {/* Channel / Source */}
              <td className="py-4 px-6">
                <Badge variant="slate" size="sm">
                  {lead.source}
                </Badge>
              </td>

              {/* Status */}
              <td className="py-4 px-6">
                <LeadStatusBadge status={lead.status} />
              </td>

              {/* Assigned Staff */}
              <td className="py-4 px-6 text-xs text-slate-600">
                {lead.assigned_profile ? (
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{lead.assigned_profile.full_name}</span>
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Unassigned</span>
                )}
              </td>

              {/* Actions */}
              <td className="py-4 px-6 text-right">
                <Link
                  to={`/leads/${lead.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};
