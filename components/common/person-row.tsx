import * as React from 'react';

import { cn } from '@/lib/utils';

interface PersonRowProps extends React.ComponentProps<'div'> {
  avatar?: React.ReactNode;
  name: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  /** left slot — e.g. Checkbox placed before avatar */
  left?: React.ReactNode;
  /**
   * `'default'`     — static bg-muted/50 (non-interactive list item)
   * `'interactive'` — hover/active states, no background at rest
   */
  variant?: 'default' | 'interactive';
}

export function PersonRow({
  avatar,
  name,
  meta,
  actions,
  left,
  variant = 'default',
  className,
  ...props
}: PersonRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2',
        variant === 'interactive' ? 'hover:bg-muted/50 active:bg-muted/70' : 'bg-muted/50',
        className
      )}
      {...props}
    >
      {left}
      {avatar && <div className="shrink-0">{avatar}</div>}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">{name}</div>
        {meta != null && <p className="text-muted-foreground text-caption truncate">{meta}</p>}
      </div>
      {actions != null && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
