'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Lang = 'zh' | 'en';

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'EN' },
];

interface Section {
  id: string;
  zh: { title: string; body: React.ReactNode };
  en: { title: string; body: React.ReactNode };
}

const sections: Section[] = [
  {
    id: 's1',
    zh: {
      title: '條款接受',
      body: (
        <p>
          歡迎使用
          Pikora。當您存取或使用本服務時，即表示您已閱讀、理解並同意受本服務條款約束。若您不同意本條款，請勿使用本服務。
        </p>
      ),
    },
    en: {
      title: 'Acceptance of Terms',
      body: (
        <p>
          Welcome to Pikora. By accessing or using the Service, you confirm that you have read,
          understood, and agreed to be bound by these Terms of Service. If you do not agree, please
          do not use the Service.
        </p>
      ),
    },
  },
  {
    id: 's2',
    zh: {
      title: '服務說明',
      body: (
        <p>
          Pikora 是一款 Facebook
          粉絲專頁抽獎管理工具，供粉絲專頁管理者使用。透過本服務，您可以載入貼文留言、設定篩選條件、建立黑名單，並以密碼學安全方式隨機抽選中獎者。本服務需要您授予
          Facebook 帳號及粉絲專頁的相關管理權限。
        </p>
      ),
    },
    en: {
      title: 'Service Description',
      body: (
        <p>
          Pikora is a Facebook Page giveaway management tool designed for Page administrators. The
          Service enables you to load post comments, configure filter criteria, maintain blocklists,
          and draw winners using cryptographically secure randomization. Use of the Service requires
          you to grant authorization to your Facebook account and managed Pages.
        </p>
      ),
    },
  },
  {
    id: 's3',
    zh: {
      title: '使用資格',
      body: (
        <p>
          您必須年滿 18 歲，並擁有有效的 Facebook
          帳號及至少一個粉絲專頁的管理員權限。您對帳號安全負完全責任，且不得允許他人以您的帳號使用本服務。
        </p>
      ),
    },
    en: {
      title: 'Eligibility',
      body: (
        <p>
          You must be at least 18 years of age and hold a valid Facebook account with administrator
          access to at least one Facebook Page. You are solely responsible for the security of your
          account and must not permit others to access the Service through your credentials.
        </p>
      ),
    },
  },
  {
    id: 's4',
    zh: {
      title: '合規使用',
      body: (
        <p>
          您僅得以合法目的使用本服務，並須遵守 Meta
          平台政策及所在地區適用法規。禁止使用本服務進行欺詐性抽獎、規避 Facebook
          政策、操控抽獎結果，或任何可能損害參與者權益的行為。
        </p>
      ),
    },
    en: {
      title: 'Authorized Use',
      body: (
        <p>
          You may use the Service only for lawful purposes and must comply with Meta&apos;s Platform
          Policies and all applicable laws. You must not use the Service to conduct fraudulent
          giveaways, circumvent Facebook&apos;s policies, manipulate draw results, or engage in any
          conduct that may harm participants.
        </p>
      ),
    },
  },
  {
    id: 's5',
    zh: {
      title: '使用者責任',
      body: (
        <p>
          您對以下事項承擔完全責任：(a) 所舉辦抽獎活動的內容、公告與獎品兌現；(b)
          遵守消費者保護法規及活動所在地的相關法律；(c) 向中獎者告知結果及後續事宜；(d)
          確保擁有所操作粉絲專頁的合法管理授權。
        </p>
      ),
    },
    en: {
      title: 'User Responsibilities',
      body: (
        <p>
          You are solely responsible for: (a) the content, announcement, and prize fulfillment of
          any giveaway you conduct; (b) compliance with consumer protection laws and regulations
          applicable to your activities; (c) notifying winners and managing follow-up
          communications; (d) ensuring you hold lawful administrative authorization for each Page
          you operate.
        </p>
      ),
    },
  },
  {
    id: 's6',
    zh: {
      title: 'Meta 平台合規',
      body: (
        <p>
          您對本服務的使用必須符合 Meta
          的服務條款、開發者政策及平台政策。若我們收到通知指出您的使用行為違反 Meta
          政策，我們保留暫停或終止您存取本服務之權利，且無需提前告知。
        </p>
      ),
    },
    en: {
      title: 'Meta Platform Compliance',
      body: (
        <p>
          Your use of the Service must comply with Meta&apos;s Terms of Service, Developer Policies,
          and Platform Policies. We reserve the right to suspend or terminate your access without
          prior notice if we receive notification that your use violates Meta&apos;s policies.
        </p>
      ),
    },
  },
  {
    id: 's7',
    zh: {
      title: '智慧財產權',
      body: (
        <p>
          本服務及其原始內容、功能與設計之智慧財產權歸服務提供者所有。您使用本服務不代表取得服務任何部分的所有權或授權，本條款亦不授予您使用我們商標或品牌的任何權利。
        </p>
      ),
    },
    en: {
      title: 'Intellectual Property',
      body: (
        <p>
          Pikora and its original content, features, and design are the intellectual property of the
          Service provider. Your use of the Service does not grant you ownership of any part
          thereof, nor does it confer any right to use our trademarks or branding.
        </p>
      ),
    },
  },
  {
    id: 's8',
    zh: {
      title: '免責聲明',
      body: (
        <p>
          本服務按「現狀」及「現有」基礎提供，不附帶任何明示或暗示之保證，包括但不限於適銷性、特定用途適用性或不侵權之保證。我們不保證服務不中斷、無錯誤，亦不保證任何錯誤將被修正。
        </p>
      ),
    },
    en: {
      title: 'Disclaimer of Warranties',
      body: (
        <p>
          The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis
          without warranties of any kind, express or implied, including but not limited to
          warranties of merchantability, fitness for a particular purpose, or non-infringement. We
          do not warrant that the Service will be uninterrupted, error-free, or that defects will be
          corrected.
        </p>
      ),
    },
  },
  {
    id: 's9',
    zh: {
      title: '責任限制',
      body: (
        <p>
          在適用法律允許的最大範圍內，我們對於因使用或無法使用本服務所產生的任何間接、附帶、特殊、衍生性或懲罰性損害（包括資料遺失、利潤損失或商譽損害）概不負責，無論是否已被告知此類損害之可能性。
        </p>
      ),
    },
    en: {
      title: 'Limitation of Liability',
      body: (
        <p>
          To the fullest extent permitted by applicable law, we shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages — including loss of
          data, profits, or goodwill — arising from your use of or inability to use the Service,
          even if advised of the possibility of such damages.
        </p>
      ),
    },
  },
  {
    id: 's10',
    zh: {
      title: '服務終止',
      body: (
        <p>
          我們保留在您違反本條款時，無需事先通知即暫停或終止您存取本服務的權利。您可隨時停止使用本服務，並透過
          Facebook 設定撤銷授權。帳號終止後，我們將依隱私政策處理您的資料。
        </p>
      ),
    },
    en: {
      title: 'Termination',
      body: (
        <p>
          We reserve the right to suspend or terminate your access to the Service without prior
          notice if you breach these Terms. You may stop using the Service at any time and revoke
          authorization via Facebook Settings. Upon termination, your data will be handled in
          accordance with our Privacy Policy.
        </p>
      ),
    },
  },
  {
    id: 's11',
    zh: {
      title: '條款修改',
      body: (
        <p>
          我們保留隨時修改本條款的權利。重大變更將於本頁面公告，並更新修改日期。繼續使用本服務即表示您接受修改後的條款。建議您定期查閱本頁面以了解最新版本。
        </p>
      ),
    },
    en: {
      title: 'Changes to Terms',
      body: (
        <p>
          We reserve the right to modify these Terms at any time. Material changes will be announced
          on this page with an updated date. Continued use of the Service after changes are posted
          constitutes your acceptance of the revised Terms. We encourage you to review this page
          periodically.
        </p>
      ),
    },
  },
  {
    id: 's12',
    zh: {
      title: '聯絡我們',
      body: <p>如對本服務條款有任何疑問，請透過 Facebook 粉絲專頁聯絡我們。</p>,
    },
    en: {
      title: 'Contact Us',
      body: (
        <p>
          If you have any questions about these Terms of Service, please contact us via our Facebook
          Page.
        </p>
      ),
    },
  },
];

function SectionBody({ body }: { body: React.ReactNode }) {
  return (
    <div className="[&_li]:text-muted-foreground [&_p]:text-muted-foreground [&_strong]:text-foreground text-body leading-[1.75] [&_li+li]:mt-1 [&_p]:mb-0 [&_p+ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
      {body}
    </div>
  );
}

export default function TermsOfService() {
  const [lang, setLang] = useState<Lang>('zh');

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* Top bar */}
      <div className="mb-10 flex items-center justify-between gap-4">
        <Link
          className="text-body text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          href="/login"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>

        {/* Language toggle */}
        <div className="bg-muted flex items-center rounded-lg p-1">
          {LANG_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              className={cn(
                'text-caption h-auto rounded-md px-3 py-1.5 font-medium transition-all duration-150',
                lang === opt.value
                  ? 'bg-background text-foreground hover:bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
              )}
              variant="ghost"
              onClick={() => setLang(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-8">
        {lang === 'en' ? (
          <>
            <h1 className="text-title mb-1 font-bold">Terms of Service</h1>
            <p className="text-body text-muted-foreground">Last updated: March 2026</p>
          </>
        ) : (
          <>
            <h1 className="text-title mb-1 font-bold">服務條款</h1>
            <p className="text-body text-muted-foreground">最後更新：2026 年 3 月</p>
          </>
        )}
      </div>

      {/* TOC */}
      <nav className="bg-muted/50 border-border mb-10 rounded-xl border p-5">
        <p className="text-foreground text-caption mb-3 font-semibold tracking-widest uppercase">
          {lang === 'en' ? 'Contents' : '目錄'}
        </p>
        <ol className="text-body text-muted-foreground space-y-1.5">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                className="hover:text-foreground inline-flex items-baseline gap-2 transition-colors"
                href={`#${s.id}`}
              >
                <span className="text-muted-foreground/50 text-caption w-5 shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{lang === 'en' ? s.en.title : s.zh.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Sections */}
      <div className="space-y-2">
        {sections.map((s, i) => (
          <section
            key={s.id}
            className="border-border scroll-mt-6 rounded-xl border px-6 py-5"
            id={s.id}
          >
            {/* Heading */}
            <div className="mb-4 flex items-center gap-3 select-none">
              <span className="bg-muted text-muted-foreground text-caption flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-semibold tabular-nums">
                {i + 1}
              </span>
              <h2 className="text-body text-foreground font-semibold">
                {lang === 'en' ? s.en.title : s.zh.title}
              </h2>
            </div>

            {/* Body */}
            <div className="pl-9">
              <SectionBody body={lang === 'en' ? s.en.body : s.zh.body} />
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <p className="text-muted-foreground/60 text-caption mt-10 text-center">
        {lang === 'en'
          ? 'In the event of any discrepancy between the Traditional Chinese and English versions, the Traditional Chinese version shall prevail.'
          : '如中英文版本有任何歧異，以正體中文版本為準。'}
      </p>
    </div>
  );
}
