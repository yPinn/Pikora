'use client';

import { useEffect, useRef, useState } from 'react';
import { type ElementType } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowDown,
  ArrowRight,
  Filter,
  Gift,
  History,
  Info,
  MessageSquare,
  ShieldCheck,
  Shuffle,
  X,
} from 'lucide-react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';

import { ModeToggle } from '@/components/mode-toggle';
import { ScrollIndicator } from '@/components/scroll-indicator';
import { Button } from '@/components/ui/button';
import momonga1 from '@/public/Momonga_1.jpg';

// Navbar is h-14 (3.5rem); each section fills the remainder so header+section = 100dvh
const SECTION = 'h-[calc(100dvh-3.5rem)] snap-start snap-always';

const features: { icon: ElementType; title: string; description: string }[] = [
  {
    icon: MessageSquare,
    title: '一鍵載入留言',
    description: '貼上貼文網址，自動批次載入全部留言，支援大量留言分頁讀取。',
  },
  {
    icon: Filter,
    title: '多條件進階篩選',
    description: '依時間區間、留言關鍵字、@提及人數、按讚反應等條件彈性過濾。',
  },
  {
    icon: Shuffle,
    title: '公正隨機抽獎',
    description: '採用密碼學安全亂數，避免模數偏差，確保每位符合資格的參與者機會均等。',
  },
  {
    icon: Gift,
    title: '多獎項管理',
    description: '自由設定多個獎項等級與數量，支援同人可重複得獎或限制每人僅得一獎。',
  },
  {
    icon: ShieldCheck,
    title: '黑名單系統',
    description: '針對特定版面設定黑名單，自動排除不符資格的參與者，可從結果頁一鍵新增。',
  },
  {
    icon: History,
    title: '完整歷史紀錄',
    description: '每次抽獎結果完整保存，可隨時查閱得獎名單、留言內容及當時篩選設定。',
  },
];

// expo-out easing matching --ease-expo token
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

// CSS custom property stagger — read by [data-active] .anim-item animation-delay
const delay = (s: number) => ({ '--anim-delay': `${s}s` }) as React.CSSProperties;

function scrollToIndex(el: HTMLElement, index: number, onDone?: () => void) {
  const start = el.scrollTop;
  const end = index * el.clientHeight;
  const diff = end - start;
  if (diff === 0) {
    onDone?.();
    return;
  }
  const duration = 700; // matches --dur-scroll token
  let t0: number | null = null;
  const tick = (now: number) => {
    t0 ??= now;
    const t = Math.min((now - t0) / duration, 1);
    el.scrollTop = start + diff * easeOutExpo(t);
    if (t < 1) requestAnimationFrame(tick);
    else onDone?.();
  };
  requestAnimationFrame(tick);
}

// Sticker icon container shared in hero — uses card token for theme-awareness
function Sticker({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`border-card bg-card border-[5px] p-5 shadow-2xl transition-transform duration-300 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  // Once a section index is added it is never removed — animations play only once
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const [notifVisible, setNotifVisible] = useState(true);
  const markSeen = (i: number) => setSeen((prev) => (prev.has(i) ? prev : new Set([...prev, i])));

  // setTimeout(0) fires after the browser has committed the first paint, ensuring
  // .anim-item { opacity: 0 } is rendered before data-active triggers the animation.
  // rAF fires before paint, so the hidden state was never seen → no animation baseline.
  useEffect(() => {
    const id = setTimeout(() => markSeen(0), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const count = el.querySelectorAll('section').length;
    let locked = false;
    let unlockTimer: ReturnType<typeof setTimeout>;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (locked) return;
      locked = true;
      clearTimeout(unlockTimer);
      const cur = Math.round(el.scrollTop / el.clientHeight);
      const target = e.deltaY > 0 ? Math.min(cur + 1, count - 1) : Math.max(cur - 1, 0);
      scrollToIndex(el, target, () => markSeen(target));
      unlockTimer = setTimeout(() => {
        locked = false;
      }, 800);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      clearTimeout(unlockTimer);
    };
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/*
        ── Navigation bar ──────────────────────────────────────────────
        Tokens (globals.css): --nav-h 56px, --nav-px 24px,
        --nav-btn-icon-w 56px (ModeToggle square), --nav-btn-px 24px.
        overflow-hidden clips buttons to nav height. Button group uses
        border-l separator — no inner div needed (avoids bleed artifacts).
        ────────────────────────────────────────────────────────────────
      */}
      <header className="bg-background z-20 shrink-0 overflow-hidden border-2 border-black">
        <div
          className="flex w-full items-stretch"
          style={{ height: 'var(--nav-h)' } as React.CSSProperties}
        >
          {/* ── Logo ── fills remaining space */}
          <Link
            className="flex flex-1 items-center gap-2 transition-opacity hover:opacity-80"
            href="/"
            style={{ paddingLeft: 'var(--nav-px)' } as React.CSSProperties}
          >
            <Image
              alt="pikora"
              className="rounded-full object-cover"
              height={28}
              src={momonga1}
              width={28}
            />
            <span className="text-sm font-semibold text-blue-500">pikora</span>
          </Link>

          {/*
            ── Button group ─────────────────────────────────────────────
            border-l separates logo zone from actions.
            ModeToggle: !important ensures amber shows in both themes.
            LOGIN: border-l separates from icon btn cleanly.
          */}
          <div className="flex items-stretch border-l-2 border-black">
            {/* ModeToggle — square: width = nav-h */}
            <div
              className="flex items-stretch [&>button]:h-full [&>button]:w-full [&>button]:!rounded-none [&>button]:!border-0 [&>button]:!bg-amber-500 [&>button]:!text-gray-900 [&>button]:!shadow-none [&>button]:transition-colors [&>button]:duration-150 [&>button]:hover:!bg-amber-400"
              style={{ width: 'var(--nav-btn-icon-w)' } as React.CSSProperties}
            >
              <ModeToggle />
            </div>

            {/* LOGIN */}
            <Button
              asChild
              className="h-full rounded-none border-l-2 border-black bg-blue-600 text-sm font-extrabold tracking-[0.15em] text-white uppercase transition-colors duration-150 hover:bg-blue-700"
              style={{ paddingInline: 'var(--nav-btn-px)' } as React.CSSProperties}
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      <main
        ref={mainRef}
        className="h-[calc(100dvh-3.5rem)] snap-y snap-mandatory overflow-y-scroll scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* ── Hero ── */}
        <section
          className={`${SECTION} flex items-center bg-gradient-to-b from-blue-600 to-blue-400`}
          data-active={seen.has(0) ? '' : undefined}
        >
          <div className="mx-auto w-full max-w-screen-xl px-8">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_420px]">
              <div>
                <div
                  className="anim-item mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-sm"
                  style={delay(0.05)}
                >
                  <FaFacebook className="h-3.5 w-3.5 text-white" />
                  <FaInstagram className="h-3.5 w-3.5 text-white" />
                  <SiThreads className="h-3.5 w-3.5 text-white" />
                  <span className="mx-0.5 h-3 w-px bg-white/40" />
                  <span className="text-xs font-semibold tracking-wide text-white">
                    Meta 生態系全平台
                  </span>
                </div>
                {/* On the always-bright blue gradient: dark in light mode, white in dark mode */}
                <h1
                  className="anim-item mb-6 leading-[1.05] text-gray-900 dark:text-white"
                  style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', ...delay(0.18) }}
                >
                  跨平台社群抽獎
                  <br />
                  一站式管理
                </h1>
                <p
                  className="anim-item mb-8 max-w-md text-base leading-relaxed text-blue-950/80 dark:text-blue-100/80"
                  style={delay(0.3)}
                >
                  整合
                  Facebook、Instagram、Threads，自動載入留言、彈性篩選參與者、密碼學安全抽獎，讓每場活動更省力、更公正。
                </p>
                <div className="anim-item flex flex-wrap items-center gap-4" style={delay(0.42)}>
                  <Button
                    asChild
                    className="rounded-full bg-orange-500 px-7 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-xl"
                    size="lg"
                  >
                    <Link href="/login">
                      免費開始使用
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Link
                    className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 underline-offset-4 transition-colors hover:text-white hover:underline"
                    href="#platforms"
                  >
                    了解更多 <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Sticker icons — decorative only, not interactive */}
              <div className="relative hidden h-80 lg:block">
                <div
                  className="anim-item pointer-events-none absolute top-2 right-4"
                  style={delay(0.55)}
                >
                  <Sticker className="rotate-[12deg] [animation:float_3s_ease-in-out_0.2s_infinite] rounded-full">
                    <SiThreads className="text-card-foreground h-14 w-14" />
                  </Sticker>
                </div>
                <div
                  className="anim-item pointer-events-none absolute top-1/2 right-28 -translate-y-1/2"
                  style={delay(0.65)}
                >
                  <Sticker className="rotate-[5deg] [animation:float_3.5s_ease-in-out_0.9s_infinite] rounded-[28px]">
                    <FaFacebook className="text-card-foreground h-14 w-14" />
                  </Sticker>
                </div>
                <div
                  className="anim-item pointer-events-none absolute bottom-2 left-8"
                  style={delay(0.75)}
                >
                  <Sticker className="rotate-[-8deg] [animation:float_4s_ease-in-out_1.6s_infinite] rounded-[28px]">
                    <FaInstagram className="text-card-foreground h-14 w-14" />
                  </Sticker>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Platforms ── */}
        <section
          className={`${SECTION} relative overflow-hidden bg-gradient-to-b from-blue-400 to-blue-100 dark:from-blue-800 dark:to-blue-950`}
          data-active={seen.has(1) ? '' : undefined}
          id="platforms"
        >
          {/* Squiggly top line */}
          <svg
            aria-hidden
            className="anim-item pointer-events-none absolute top-0 left-0 w-full text-slate-900/20 dark:text-slate-200/20"
            fill="none"
            height="80"
            preserveAspectRatio="none"
            style={delay(0.08)}
            viewBox="0 0 1200 80"
          >
            <path
              className="[animation:path-draw_2.5s_ease-out_0.3s_both]"
              d="M 80 65 C 180 20, 320 70, 480 35 C 600 8, 720 55, 860 25 C 980 0, 1100 45, 1160 20"
              stroke="currentColor"
              strokeDasharray="1200"
              strokeLinecap="round"
              strokeWidth="2.5"
            />
          </svg>

          <div className="relative mx-auto flex h-full w-full max-w-screen-xl flex-col px-8 py-12">
            {/* Title + doodle underline */}
            <div className="anim-item mb-0 text-center" style={delay(0.05)}>
              <h2
                className="relative inline-block text-4xl font-bold text-[#d4f23a] lg:text-5xl"
                style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.18)' }}
              >
                支援 Meta 全平台
                {/* Hand-drawn underline drawn in after title appears */}
                <svg
                  aria-hidden
                  className="pointer-events-none absolute -bottom-2 left-0 w-full overflow-visible text-white/60"
                  fill="none"
                  height="10"
                  preserveAspectRatio="none"
                  viewBox="0 0 200 10"
                >
                  <path
                    className="[animation:path-draw_1s_ease-out_0.6s_both]"
                    d="M2 7 C45 3,95 9,135 5 C162 2,186 8,198 6"
                    stroke="currentColor"
                    strokeDasharray="220"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />
                </svg>
              </h2>
            </div>

            <div className="relative flex-1">
              {/* ── Instagram — top-left ── */}
              <div
                className="anim-item pointer-events-none absolute top-[15%] left-[4%]"
                style={delay(0.15)}
              >
                <div className="-rotate-12 [animation:float_3.2s_ease-in-out_infinite]">
                  <FaInstagram className="h-36 w-36 text-slate-900 drop-shadow-xl lg:h-44 lg:w-44 dark:text-slate-100" />
                  <div className="mt-2 inline-flex -rotate-6 items-center gap-1 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-md">
                    即將推出
                  </div>
                </div>
              </div>

              {/* Doodle ✕ over Instagram */}
              <div
                className="doodle-item pointer-events-none absolute top-[12%] left-[10%]"
                style={delay(0.3)}
              >
                <svg fill="none" height="40" viewBox="0 0 40 40" width="40">
                  <path
                    d="M6 6 L34 34 M34 6 L6 34"
                    stroke="#ef4444"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
              </div>

              {/* ── Threads — top-right ── */}
              <div
                className="anim-item pointer-events-none absolute top-[10%] right-[6%]"
                style={delay(0.2)}
              >
                <div className="rotate-[8deg] [animation:float_2.8s_ease-in-out_0.8s_infinite]">
                  <SiThreads className="h-36 w-36 text-slate-900 drop-shadow-xl lg:h-44 lg:w-44 dark:text-slate-100" />
                  <div className="mt-2 ml-auto inline-flex rotate-3 items-center gap-1 rounded-full bg-orange-400 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-md">
                    即將推出
                  </div>
                </div>
              </div>

              {/* Doodle annotation next to Threads */}
              <div
                className="doodle-item pointer-events-none absolute top-[8%] right-[22%]"
                style={{ ...delay(0.35), fontFamily: 'var(--font-caveat), cursive' }}
              >
                <span className="inline-block rotate-[8deg] text-lg font-bold text-slate-700 dark:text-slate-300">
                  ?!
                </span>
                <svg
                  aria-hidden
                  className="absolute top-5 left-4 text-slate-600/70 dark:text-slate-400/70"
                  fill="none"
                  height="24"
                  viewBox="0 0 30 24"
                  width="30"
                >
                  <path
                    d="M2 12 C8 4,20 6,26 14"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M22 10 L27 14 L22 17"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>

              {/* ── Facebook — center bottom ── */}
              <div
                className="anim-item pointer-events-none absolute bottom-[20%] left-1/2 -translate-x-1/2"
                style={delay(0.28)}
              >
                <div className="rotate-[3deg] [animation:float_3.8s_ease-in-out_1.5s_infinite]">
                  <FaFacebook className="h-44 w-44 text-slate-900 drop-shadow-xl lg:h-52 lg:w-52 dark:text-slate-100" />
                  <div className="mx-auto mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold tracking-wider text-slate-900 uppercase shadow-md">
                    <span>✓</span> Facebook
                  </div>
                </div>
              </div>

              {/* Doodle circle around Facebook */}
              <div
                className="doodle-item pointer-events-none absolute bottom-[14%] left-1/2 -translate-x-1/2"
                style={delay(0.42)}
              >
                <svg fill="none" height="220" viewBox="0 0 220 220" width="220">
                  <ellipse
                    className="text-emerald-400/60"
                    cx="110"
                    cy="110"
                    rx="100"
                    ry="95"
                    stroke="currentColor"
                    strokeDasharray="12 6"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    transform="rotate(-8 110 110)"
                  />
                </svg>
              </div>

              {/* Hand-written "ok!" annotation */}
              <div
                className="doodle-item pointer-events-none absolute right-[28%] bottom-[28%]"
                style={{ ...delay(0.48), fontFamily: 'var(--font-caveat), cursive' }}
              >
                <span className="inline-block -rotate-[10deg] text-2xl font-bold text-slate-700 dark:text-slate-300">
                  ok!
                </span>
                <svg
                  aria-hidden
                  className="absolute -bottom-1 left-0 w-full overflow-visible text-slate-600/60 dark:text-slate-400/60"
                  fill="none"
                  height="6"
                  preserveAspectRatio="none"
                  viewBox="0 0 40 6"
                >
                  <path
                    d="M2 4 C10 1,28 5,38 3"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>

              {/* Doodle stars */}
              <svg
                aria-hidden
                className="doodle-item pointer-events-none absolute top-[42%] left-[28%] text-yellow-300/80"
                fill="currentColor"
                height="16"
                style={delay(0.38)}
                viewBox="0 0 20 20"
                width="16"
              >
                <path d="M10 1l2.5 6.5h6.5L14 11.5l2 6.5-6-3.5-6 3.5 2-6.5-4.5-4h6.5z" />
              </svg>
              <svg
                aria-hidden
                className="doodle-item pointer-events-none absolute top-[36%] right-[24%] rotate-[20deg] text-yellow-200/80"
                fill="currentColor"
                height="12"
                style={delay(0.44)}
                viewBox="0 0 20 20"
                width="12"
              >
                <path d="M10 1l2.5 6.5h6.5L14 11.5l2 6.5-6-3.5-6 3.5 2-6.5-4.5-4h6.5z" />
              </svg>
            </div>

            {/* Notification card */}
            {notifVisible && (
              <div className="anim-item absolute bottom-8 left-8 w-72" style={delay(0.25)}>
                <div className="rounded-2xl border border-blue-300 bg-yellow-50 px-4 py-3 shadow-lg dark:border-blue-700 dark:bg-yellow-100">
                  {/* Header */}
                  <div className="mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 shrink-0 text-blue-500" />
                    <span className="flex-1 text-sm font-semibold">通知</span>
                    <button
                      aria-label="關閉通知"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setNotifVisible(false)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Body */}
                  <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                    Facebook 已開放使用，
                    <br />
                    Instagram 與 Threads 即將推出
                  </p>
                  {/* CTA */}
                  <Button
                    asChild
                    className="h-8 rounded-lg bg-orange-500 px-4 text-sm font-bold text-white transition-colors hover:bg-orange-600"
                    size="sm"
                  >
                    <Link href="/login">幫你搞</Link>
                  </Button>
                </div>
              </div>
            )}

            <Link
              className="anim-item group absolute right-8 bottom-8 flex items-center gap-2"
              href="#features"
              style={delay(0.35)}
            >
              <span className="text-foreground group-hover:text-foreground/70 text-sm font-extrabold tracking-widest uppercase transition-colors">
                Next
              </span>
              <div className="rounded-xl bg-orange-500 p-2 shadow-lg transition-colors group-hover:bg-orange-600">
                <ArrowDown className="h-6 w-6 [animation:bounce-arrow_1.2s_ease-in-out_infinite] text-white" />
              </div>
            </Link>
          </div>
        </section>

        {/* ── Features ── uses bg-muted for theme-aware neutral background */}
        <section
          className={`${SECTION} bg-muted flex flex-col justify-center overflow-hidden`}
          data-active={seen.has(2) ? '' : undefined}
          id="features"
        >
          <div className="mx-auto w-full max-w-screen-xl px-8">
            <h2
              className="anim-item text-foreground mb-2 text-3xl font-bold lg:text-4xl"
              style={delay(0.05)}
            >
              豐富功能一次滿足
            </h2>
            <p className="anim-item text-muted-foreground mb-8 text-sm" style={delay(0.15)}>
              專為社群版面管理者設計的完整抽獎解決方案
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }, i) => (
                <div
                  key={title}
                  className="anim-item border-border bg-card rounded-2xl border p-5 shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md"
                  style={delay(0.25 + i * 0.08)}
                >
                  <div className="mb-3 inline-flex rounded-xl bg-blue-600 p-3">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-card-foreground mb-1.5 font-semibold">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA + Footer ── strong blue gradient looks good in both modes */}
        <section
          className={`${SECTION} flex flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800`}
          data-active={seen.has(3) ? '' : undefined}
        >
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <h2
              className="anim-item mb-4 leading-[1.1] text-white"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', ...delay(0.05) }}
            >
              立即開始您的第一場抽獎
            </h2>
            <p className="anim-item mb-10 text-base text-white/75" style={delay(0.18)}>
              連結 Meta 帳號，幾分鐘內完成設定
            </p>
            <div className="anim-item" style={delay(0.3)}>
              <Button
                asChild
                className="rounded-full bg-white px-10 font-bold text-blue-700 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-2xl"
                size="lg"
              >
                <Link href="/login">立即免費登入</Link>
              </Button>
            </div>
          </div>
          <footer className="shrink-0 border-t border-white/20 px-8 py-5">
            <div className="mx-auto flex w-full max-w-screen-xl flex-col items-center justify-between gap-2 text-center sm:flex-row">
              <span className="text-xs text-white/50">© 2025 Pikora. All rights reserved.</span>
              <div className="flex gap-5 text-xs text-white/50">
                <Link className="transition-colors hover:text-white/80" href="/privacy">
                  隱私政策
                </Link>
                <Link className="transition-colors hover:text-white/80" href="/terms">
                  服務條款
                </Link>
              </div>
            </div>
          </footer>
        </section>
      </main>
      <ScrollIndicator scrollRef={mainRef} />
    </div>
  );
}
