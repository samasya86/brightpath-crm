import React from 'react';
import { Card } from '../../components/common/Card';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  iconBg: string;
  urgent?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  urgent = false,
}) => {
  return (
    <Card hoverLift className="hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={`text-2xl font-extrabold tracking-tight ${
            urgent ? 'text-rose-600' : 'text-slate-900'
          }`}
        >
          {value}
        </span>
      </div>

      <p className="text-xs text-slate-500 mt-1 truncate">
        {subtitle}
      </p>
    </Card>
  );
};
