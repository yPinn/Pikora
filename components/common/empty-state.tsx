import { type LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Extra classes on the icon — use to override size or add animate-spin */
  iconClassName?: string;
  className?: string;
}

/**
 * Full-width Card with a centred icon, title, and optional description.
 * Use for page-level loading and empty states.
 *
 * @example
 * // Loading
 * <EmptyCard icon={Loader2} title="載入中..." iconClassName="h-8 w-8 animate-spin opacity-100" />
 * // Empty
 * <EmptyCard icon={Bell} title="尚無紀錄" description="前往抽獎活動建立紀錄" />
 */
export function EmptyCard({
  icon: Icon,
  title,
  description,
  iconClassName,
  className,
}: EmptyCardProps) {
  return (
    <Card className={cn('flex flex-col items-center justify-center py-16', className)}>
      <Icon className={cn('text-muted-foreground mb-4 h-12 w-12 opacity-50', iconClassName)} />
      <p className="text-muted-foreground text-body">{title}</p>
      {description && (
        <p className="text-muted-foreground text-caption mt-1 text-center">{description}</p>
      )}
    </Card>
  );
}
