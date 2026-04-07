import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageTitleBarProps {
  title: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export function PageTitleBar({ title, isLoading, onRefresh }: PageTitleBarProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-heading font-semibold">{title}</h2>
      <Button disabled={isLoading} size="sm" variant="outline" onClick={onRefresh}>
        <RefreshCw className={cn('size-3', isLoading && 'animate-spin')} />
        重新整理
      </Button>
    </div>
  );
}
