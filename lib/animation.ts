/**
 * 動畫設定常數 — 與 globals.css 的 Animation Tokens 對應
 *
 * CSS var       JS 對應
 * --anim-fast   ANIM.fast      (0.2)
 * --anim-normal ANIM.normal    (0.3)
 * --anim-ease   ANIM.ease      ('easeOut')
 * --anim-stagger ANIM.stagger  (0.04)
 * --anim-stagger-delay ANIM.staggerDelay (0.1)
 */
export const ANIM = {
  fast: 0.2,
  normal: 0.3,
  ease: 'easeOut' as const,
  stagger: 0.04,
  staggerDelay: 0.1,
  scale: {
    from: 0.95, // 卡片出現起始
    fromCard: 0.92, // 強調卡片出現起始（winner）
    tap: 0.97, // 點擊回饋
    exit: 0.95, // 離場縮放
  },
  y: {
    page: 6, // 頁面過場 y 偏移
    card: 10, // 強調卡片 y 偏移
  },
} as const;

// ─── 預設 Variant 組合 ────────────────────────────────────────────

/** 頁面過場：淡入 + 輕微上移 */
export const fadeSlideUp = {
  initial: { opacity: 0, y: ANIM.y.page },
  animate: { opacity: 1, y: 0 },
  transition: { duration: ANIM.fast, ease: ANIM.ease },
} as const;

/** 卡片出現：淡入 + 縮放 */
export const scaleIn = {
  initial: { opacity: 0, scale: ANIM.scale.from },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: ANIM.fast, ease: ANIM.ease },
} as const;

/** 強調卡片（winner）：淡入 + 縮放 + 上移，支援 exit */
export const cardReveal = {
  initial: { opacity: 0, scale: ANIM.scale.fromCard, y: ANIM.y.card },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: ANIM.scale.exit },
} as const;

/** 列表 stagger 容器 */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: ANIM.stagger } },
} as const;
