'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme = 'light' } = useTheme();

  return (
    <Sonner
      richColors
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--toast-success-bg)',
          '--success-text': 'var(--toast-success-text)',
          '--success-border': 'var(--toast-success-border)',
          '--error-bg': 'var(--toast-error-bg)',
          '--error-text': 'var(--toast-error-text)',
          '--error-border': 'var(--toast-error-border)',
          '--warning-bg': 'var(--toast-warning-bg)',
          '--warning-text': 'var(--toast-warning-text)',
          '--warning-border': 'var(--toast-warning-border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      theme={resolvedTheme as ToasterProps['theme']}
      {...props}
    />
  );
};

export { Toaster };
