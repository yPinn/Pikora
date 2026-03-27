'use client';

import { useEffect, useRef } from 'react';

export function ScrollIndicator({ scrollRef }: { scrollRef: React.RefObject<HTMLElement | null> }) {
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    const thumb = thumbRef.current;
    if (!el || !thumb) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight) return;
      const pct = (clientHeight / scrollHeight) * 100;
      const top = (scrollTop / (scrollHeight - clientHeight)) * (100 - pct);
      thumb.style.height = `${pct}%`;
      thumb.style.top = `${top}%`;
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    return () => el.removeEventListener('scroll', update);
  }, [scrollRef]);

  // top-14 = 3.5rem = nav-h; track covers only the content scroll area, not the header
  return (
    <div className="pointer-events-none fixed top-14 right-0 bottom-0 z-50 flex w-5 items-stretch py-4">
      <div className="relative mx-[5px] flex-1">
        <div className="absolute inset-0 rounded-full bg-white/10" />
        <div
          ref={thumbRef}
          className="absolute inset-x-0 rounded-full border border-white/60"
          style={{ height: '25%', top: '0%' }}
        />
      </div>
    </div>
  );
}
