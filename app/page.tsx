import Link from 'next/link';

import {
  ArrowRight,
  Filter,
  Gift,
  History,
  MessageSquare,
  ShieldCheck,
  Shuffle,
  Users,
  Zap,
} from 'lucide-react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';

import { ModeToggle } from '@/components/mode-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const platforms = [
  {
    icon: FaFacebook,
    name: 'Facebook',
    description: '讀取粉絲專頁貼文留言，進行抽獎篩選與得獎者管理。',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
    available: true,
  },
  {
    icon: FaInstagram,
    name: 'Instagram',
    description: '管理 Instagram 商業帳號的貼文互動與抽獎活動。',
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/15',
    available: false,
  },
  {
    icon: SiThreads,
    name: 'Threads',
    description: '針對 Threads 貼文回覆，輕鬆舉辦社群互動抽獎。',
    iconColor: 'text-slate-300',
    iconBg: 'bg-white/10',
    available: false,
  },
];

const features = [
  {
    icon: MessageSquare,
    title: '一鍵載入留言',
    description: '貼上貼文網址，自動批次載入全部留言，支援大量留言分頁讀取。',
  },
  {
    icon: Filter,
    title: '多條件進階篩選',
    description: '依時間區間、留言關鍵字（正規表達式）、@提及人數、按讚反應等條件彈性過濾。',
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

const steps = [
  {
    step: '01',
    title: '連結帳號',
    description: '以 Meta 帳號登入，選擇您管理的粉絲專頁或帳號。',
  },
  {
    step: '02',
    title: '貼上貼文網址',
    description: '將活動貼文網址貼入，系統自動載入全部留言或回覆。',
  },
  {
    step: '03',
    title: '設定篩選條件',
    description: '依需求設定時間、格式、提及人數等參與資格條件。',
  },
  {
    step: '04',
    title: '抽出得獎者',
    description: '一鍵公正抽獎，結果即時顯示並可儲存備查。',
  },
];

export default function Home() {
  return (
    // Force dark context so all shadcn tokens resolve to dark values throughout
    <div className="dark flex min-h-screen flex-col bg-slate-900 text-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className="text-lg font-bold tracking-tight text-white">Pikora</span>
          <div className="flex items-center gap-3">
            <div className="[&>button]:border-white/20 [&>button]:bg-white/10 [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:hover:text-white">
              <ModeToggle />
            </div>
            <Button asChild size="sm">
              <Link href="/login">登入</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
          />

          <div className="relative container mx-auto max-w-6xl px-6 py-24 lg:py-32">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              {/* Left */}
              <div>
                <div className="mb-5 flex items-center gap-2">
                  <FaFacebook className="h-4 w-4 text-blue-400" />
                  <FaInstagram className="h-4 w-4 text-pink-400" />
                  <SiThreads className="h-4 w-4 text-slate-300" />
                  <span className="text-sm text-slate-400">Meta 生態系全平台</span>
                </div>
                <h1 className="mb-5 text-4xl leading-tight font-bold tracking-tight text-white lg:text-5xl xl:text-6xl">
                  跨平台社群抽獎
                  <br />
                  <span className="text-blue-400">一站管理</span>
                </h1>
                <p className="mb-8 max-w-md text-base leading-relaxed text-slate-300 lg:text-lg">
                  整合
                  Facebook、Instagram、Threads，自動載入留言、彈性篩選參與者、密碼學安全抽獎，讓每場活動更省力、更公正。
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button asChild size="lg">
                    <Link href="/login">
                      免費開始使用
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Link
                    className="inline-flex items-center gap-1 text-sm text-slate-200 transition-colors hover:text-white"
                    href="#platforms"
                  >
                    了解更多
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right: product preview */}
              <div className="hidden lg:block">
                <div className="rounded-2xl border border-white/10 bg-slate-800/80 p-6 shadow-2xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/20">
                        <FaFacebook className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="text-sm font-semibold text-white">Facebook 抽獎</span>
                    </div>
                    <Badge className="border-0 bg-blue-500/20 text-xs text-blue-300">進行中</Badge>
                  </div>

                  <div className="mb-5 grid grid-cols-3 gap-3">
                    {[
                      { label: '符合資格', value: '1,284' },
                      { label: '已排除', value: '23' },
                      { label: '得獎名額', value: '3' },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-lg bg-slate-700/60 px-3 py-2.5 text-center"
                      >
                        <div className="text-lg font-bold text-white tabular-nums">{value}</div>
                        <div className="text-xs text-slate-400">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4 space-y-2">
                    {[
                      { rank: '🥇', name: 'Emily Wang', comment: '好期待這個活動！' },
                      { rank: '🥈', name: 'Jason Lin', comment: '已分享給朋友 @friend' },
                      { rank: '🥉', name: 'Sarah Chen', comment: '參加抽獎 ❤️' },
                    ].map(({ rank, name, comment }) => (
                      <div
                        key={name}
                        className="flex items-center gap-3 rounded-lg border border-white/8 bg-slate-700/40 px-3 py-2"
                      >
                        <span className="text-base">{rank}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-white">{name}</div>
                          <div className="truncate text-xs text-slate-400">{comment}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-center">
                    <span className="text-sm font-medium text-blue-300">
                      ✓ 結果已儲存，可隨時查閱
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Platforms ── slate-800 */}
        <section className="bg-slate-800" id="platforms">
          <div className="container mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <div className="mb-10 lg:mb-12">
              <h2 className="mb-2 text-2xl font-bold text-white lg:text-3xl">支援 Meta 全平台</h2>
              <p className="text-sm text-slate-400 lg:text-base">
                Facebook 已開放使用，Instagram 與 Threads 即將推出
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:gap-6">
              {platforms.map(({ icon: Icon, name, description, iconColor, iconBg, available }) => (
                <div
                  key={name}
                  className={`rounded-xl border border-white/10 bg-slate-700/50 p-6 ${!available ? 'opacity-50' : ''}`}
                >
                  <div className={`mb-3 inline-flex rounded-md p-2.5 ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="font-semibold text-white">{name}</h3>
                    {available ? (
                      <Badge className="border-0 bg-blue-500/20 text-xs text-blue-300">可用</Badge>
                    ) : (
                      <Badge className="border-0 bg-white/10 text-xs text-slate-400">
                        即將推出
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── slate-900 */}
        <section className="bg-slate-900" id="how-it-works">
          <div className="container mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <div className="mb-10 lg:mb-12">
              <h2 className="mb-2 text-2xl font-bold text-white lg:text-3xl">四步驟完成抽獎</h2>
              <p className="text-sm text-slate-400 lg:text-base">從設定到結果，流程簡單直覺</p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
              {steps.map(({ step, title, description }, i) => (
                <div key={step} className="relative flex flex-col gap-3 lg:pr-8">
                  {i < steps.length - 1 && (
                    <div className="absolute top-5 left-10 hidden h-px w-[calc(100%-2.5rem)] border-t border-dashed border-slate-700 lg:block" />
                  )}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400">
                    {step}
                  </div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── slate-800 */}
        <section className="bg-slate-800">
          <div className="container mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <div className="mb-10 lg:mb-12">
              <h2 className="mb-2 text-2xl font-bold text-white lg:text-3xl">豐富功能一次滿足</h2>
              <p className="text-sm text-slate-400 lg:text-base">
                專為社群版面管理者設計的完整抽獎解決方案
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-xl border border-white/10 bg-slate-700/50 p-6">
                  <div className="mb-3 inline-flex rounded-md bg-blue-500/15 p-2.5">
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="mb-1.5 font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── mirrors hero gradient */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          <div className="container mx-auto max-w-6xl px-6 py-20 text-center lg:py-28">
            <Zap className="mx-auto mb-4 h-8 w-8 text-blue-400" />
            <h2 className="mb-3 text-2xl font-bold text-white lg:text-3xl">
              立即開始您的第一場抽獎
            </h2>
            <p className="mb-8 text-sm text-slate-400 lg:text-base">
              連結 Meta 帳號，幾分鐘內完成設定
            </p>
            <Button asChild size="lg">
              <Link href="/login">
                <Users className="mr-2 h-4 w-4" />
                立即登入
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 bg-slate-900">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-center sm:flex-row">
          <span className="text-sm text-slate-500">© 2025 Pikora. All rights reserved.</span>
          <div className="flex gap-4 text-sm text-slate-500">
            <Link className="transition-colors hover:text-slate-300" href="/privacy">
              隱私政策
            </Link>
            <Link className="transition-colors hover:text-slate-300" href="/terms">
              服務條款
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
