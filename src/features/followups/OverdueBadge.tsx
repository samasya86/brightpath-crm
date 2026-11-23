import React from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { isFollowupOverdue } from '../../hooks/useFollowups';
import type { FollowUp } from '../../types';

export interface OverdueBadgeProps {
  followup: FollowUp;
  size?: 'sm' | 'md';
}

export const OverdueBadge: React.FC<OverdueBadgeProps> = ({ followup, size = 'sm' }) => {
  if (followup.status === 'completed') {
    return (
      <Badge variant="green" size={size} dot>
        Completed
      </Badge>
    );
  }

  if (followup.status === 'cancelled') {
    return (
      <Badge variant="slate" size={size} dot>
        Cancelled
      </Badge>
    );
  }

  const isOverdue = isFollowupOverdue(followup);

  if (isOverdue) {
    return (
      <Badge variant="rose" size={size} dot className="font-bold">
        Overdue
      </Badge>
    );
  }

  return (
    <Badge variant="amber" size={size} dot>
      Pending
    </Badge>
  );
};
