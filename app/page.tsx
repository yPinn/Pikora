import Link from 'next/link';

import {
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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const platforms = [
  {
    icon: FaFacebook,
    name: 'Facebook',
    description: '讀取粉絲專頁貼文留言，進行抽獎篩選與得獎者管理。',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950',
    available: true,
  },
  {
    icon: FaInstagram,
    name: 'Instagram',
    description: '管理 Instagram 商業帳號的貼文互動與抽獎活動。',
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-50 dark:bg-pink-950',
    available: false,
  },
  {
    icon: SiThreads,
    name: 'Threads',
    description: '針對 Threads 貼文回覆，輕鬆舉辦社群互動抽獎。',
    color: 'text-foreground',
    bg: 'bg-muted',
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
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="border-b">
        <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-lg font-bold tracking-tight">Pikora</span>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Button asChild size="sm">
              <Link href="/login">登入</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto max-w-5xl px-4 py-20 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <FaFacebook className="h-5 w-5 text-blue-500" />
            <FaInstagram className="h-5 w-5 text-pink-500" />
            <SiThreads className="h-5 w-5" />
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight">
            跨平台社群抽獎
            <br />
            <span className="text-primary">一站管理</span>
          </h1>
          <p className="text-muted-foreground mx-auto mb-8 max-w-xl text-lg leading-relaxed">
            Pikora 整合 Meta
            生態系——Facebook、Instagram、Threads，自動載入留言、彈性篩選參與者、密碼學安全抽獎，讓每場活動更省力、更公正。
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/login">免費開始使用</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#platforms">支援平台</Link>
            </Button>
          </div>
        </section>

        <Separator />

        {/* Platforms */}
        <section className="container mx-auto max-w-5xl px-4 py-16" id="platforms">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-2xl font-bold">支援 Meta 全平台</h2>
            <p className="text-muted-foreground text-sm">
              Facebook 已開放使用，Instagram 與 Threads 即將推出
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {platforms.map(({ icon: Icon, name, description, color, bg, available }) => (
              <Card key={name} className={!available ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className={`mb-3 inline-flex rounded-md p-2 ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-semibold">{name}</h3>
                    {available ? (
                      <Badge className="text-xs" variant="default">
                        可用
                      </Badge>
                    ) : (
                      <Badge className="text-xs" variant="secondary">
                        即將推出
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* How it works */}
        <section className="container mx-auto max-w-5xl px-4 py-16" id="how-it-works">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-2xl font-bold">四步驟完成抽獎</h2>
            <p className="text-muted-foreground text-sm">從設定到結果，流程簡單直覺</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ step, title, description }) => (
              <div key={step} className="flex flex-col gap-2">
                <span className="text-primary text-3xl font-bold">{step}</span>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Features */}
        <section className="container mx-auto max-w-5xl px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-2xl font-bold">豐富功能一次滿足</h2>
            <p className="text-muted-foreground text-sm">
              專為社群版面管理者設計的完整抽獎解決方案
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardContent className="pt-6">
                  <div className="bg-primary/10 mb-3 inline-flex rounded-md p-2">
                    <Icon className="text-primary h-5 w-5" />
                  </div>
                  <h3 className="mb-1 font-semibold">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* CTA */}
        <section className="container mx-auto max-w-5xl px-4 py-16 text-center">
          <Zap className="text-primary mx-auto mb-4 h-8 w-8" />
          <h2 className="mb-3 text-2xl font-bold">立即開始您的第一場抽獎</h2>
          <p className="text-muted-foreground mb-6 text-sm">連結 Meta 帳號，幾分鐘內完成設定</p>
          <Button asChild size="lg">
            <Link href="/login">
              <Users className="mr-2 h-4 w-4" />
              立即登入
            </Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row">
          <span className="text-muted-foreground text-sm">© 2025 Pikora. All rights reserved.</span>
          <div className="text-muted-foreground flex gap-4 text-sm">
            <Link className="hover:text-foreground transition-colors" href="/privacy">
              隱私政策
            </Link>
            <Link className="hover:text-foreground transition-colors" href="/terms">
              服務條款
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
