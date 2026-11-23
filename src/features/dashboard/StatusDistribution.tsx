import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import type { StatusDistributionItem } from '../../services/metricsService';

export interface StatusDistributionProps {
  distribution: StatusDistributionItem[];
  totalLeads: number;
}

export const StatusDistribution: React.FC<StatusDistributionProps> = ({
  distribution,
  totalLeads,
}) => {
  return (
    <Card
      title="Lead Pipeline by Stage"
      subtitle={`${totalLeads} total active enquiries`}
      headerAction={
        <Link
          to="/leads"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      }
    >
      {totalLeads === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          <BarChart2 className="w-6 h-6 mx-auto mb-2 text-slate-300" />
          No enquiries in the pipeline yet.
        </div>
      ) : (
        <div className="space-y-3.5">
          {distribution.map((item) => (
            <div key={item.stage}>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 font-semibold">{item.stage}</span>
                <span className="text-slate-500">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-500 ease-out`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
