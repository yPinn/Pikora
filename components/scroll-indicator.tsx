'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollIndicatorProps {
  scrollRef: React.RefObject<HTMLElement | null>;
  className?: string;
  trackClassName?: string;
  thumbClassName?: string;
}

export function ScrollIndicator({
  scrollRef,
  className = 'top-0',
  trackClassName = 'bg-foreground/10',
  thumbClassName = 'border border-foreground/30',
}: ScrollIndicatorProps) {
  const thumbRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    const thumb = thumbRef.current;
    if (!el || !thumb) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const canScroll = scrollHeight > clientHeight;
      setScrollable(canScroll);
      if (!canScroll) return;
      const pct = (clientHeight / scrollHeight) * 100;
      const top = (scrollTop / (scrollHeight - clientHeight)) * (100 - pct);
      thumb.style.height = `${pct}%`;
      thumb.style.top = `${top}%`;
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [scrollRef]);

  if (!scrollable) return null;

  return (
    <div
      className={`pointer-events-none fixed right-0 bottom-0 z-50 flex w-5 items-stretch py-4 ${className}`}
    >
      <div className="relative mx-1.25 flex-1">
        <div className={`absolute inset-0 rounded-full ${trackClassName}`} />
        <div
          ref={thumbRef}
          className={`absolute inset-x-0 rounded-full transition-[height] duration-150 ${thumbClassName}`}
          style={{ height: '25%', top: '0%' }}
        />
      </div>
    </div>
  );
}
