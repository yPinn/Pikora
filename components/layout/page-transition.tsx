'use client';

import { usePathname } from 'next/navigation';

import { motion } from 'motion/react';

import { fadeSlideUp } from '@/lib/animation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      animate={fadeSlideUp.animate}
      className="flex flex-1 flex-col"
      initial={fadeSlideUp.initial}
      transition={fadeSlideUp.transition}
    >
      {children}
    </motion.div>
  );
}
