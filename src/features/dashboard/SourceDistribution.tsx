import React from 'react';
import { Compass } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import type { SourceDistributionItem } from '../../services/metricsService';

export interface SourceDistributionProps {
  distribution: SourceDistributionItem[];
}

export const SourceDistribution: React.FC<SourceDistributionProps> = ({ distribution }) => {
  return (
    <Card
      title="Top Acquisition Channels"
      subtitle="Where student enquiries originate"
    >
      {distribution.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          <Compass className="w-6 h-6 mx-auto mb-2 text-slate-300" />
          No channel data available yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {distribution.map((item) => (
            <div
              key={item.source}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-800">
                {item.source}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  {item.count}
                </span>
                <Badge size="sm" variant="slate">
                  {item.percentage}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
