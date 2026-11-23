import React from 'react';
import { Badge, type BadgeVariant } from '../../components/common/Badge';
import type { LeadStatus } from '../../types';

export interface LeadStatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const getVariant = (s: LeadStatus): BadgeVariant => {
    switch (s) {
      case 'New':
        return 'blue';
      case 'Contacted':
        return 'amber';
      case 'Qualified':
        return 'purple';
      case 'Converted':
        return 'green';
      case 'Lost':
        return 'rose';
      default:
        return 'slate';
    }
  };

  return (
    <Badge variant={getVariant(status)} size={size} dot className={className}>
      {status}
    </Badge>
  );
};
