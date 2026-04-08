import { Bell, BellOff, CheckCircle2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface NotificationStatusBadgeProps {
  notifiedCount: number;
  totalCount: number;
}

export function NotificationStatusBadge({
  notifiedCount,
  totalCount,
}: NotificationStatusBadgeProps) {
  if (totalCount === 0) return null;

  if (notifiedCount === totalCount) {
    return (
      <Badge variant="default">
        <CheckCircle2 />
        全部已通知
      </Badge>
    );
  }

  if (notifiedCount > 0) {
    return (
      <Badge variant="secondary">
        <Bell />
        {notifiedCount}/{totalCount} 已通知
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      <BellOff />
      未通知
    </Badge>
  );
}
