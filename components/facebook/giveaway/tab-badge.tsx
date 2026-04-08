import { Badge } from '@/components/ui/badge';

interface TabBadgeProps {
  count: number;
}

export function TabBadge({ count }: TabBadgeProps) {
  return (
    <Badge className="ml-2" variant="secondary">
      {count}
    </Badge>
  );
}
