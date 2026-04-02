'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

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
      title: '我們收集的資料',
      body: (
        <>
          <p>當您透過 Facebook 登入本服務時，我們會收集以下資料：</p>
          <ul>
            <li>基本個人資訊：用戶 ID、姓名、電子郵件、頭像</li>
            <li>OAuth 存取權杖：用於代表您呼叫 Meta Graph API</li>
            <li>粉絲專頁資訊：您授權管理的粉絲專頁名稱與 ID</li>
            <li>
              抽獎相關資料：您建立的抽獎活動、獎項設定、中獎者資訊（姓名、Facebook ID、留言內容）
            </li>
            <li>黑名單資料：您針對特定粉絲專頁設定的排除名單</li>
          </ul>
        </>
      ),
    },
    en: {
      title: 'Information We Collect',
      body: (
        <>
          <p>When you sign in with Facebook, we collect the following:</p>
          <ul>
            <li>Basic profile data: user ID, name, email address, and profile picture</li>
            <li>OAuth access tokens: used to call the Meta Graph API on your behalf</li>
            <li>Page information: names and IDs of Facebook Pages you authorize us to manage</li>
            <li>
              Giveaway records: activities you create, prize configurations, and winner information
              (name, Facebook ID, comment content)
            </li>
            <li>Blocklist data: exclusion lists you configure per Page</li>
          </ul>
        </>
      ),
    },
  },
  {
    id: 's2',
    zh: {
      title: '我們不儲存的資料',
      body: (
        <>
          <p>以下資料僅在當次瀏覽 session 中於您的瀏覽器前端暫存，不會儲存至我們的伺服器：</p>
          <ul>
            <li>貼文內容或圖片</li>
            <li>完整留言列表（分頁載入後僅暫存於前端記憶體）</li>
            <li>按讚、表情符號等互動詳細資料</li>
          </ul>
        </>
      ),
    },
    en: {
      title: 'Data We Do Not Store',
      body: (
        <>
          <p>
            The following data is processed only within your browser session and is never stored on
            our servers:
          </p>
          <ul>
            <li>Post content or images</li>
            <li>Full comment lists (loaded pages are held in browser memory only)</li>
            <li>Reaction or emoji engagement details</li>
          </ul>
        </>
      ),
    },
  },
  {
    id: 's3',
    zh: {
      title: '資料使用目的',
      body: (
        <>
          <p>我們收集的資料僅用於以下目的：</p>
          <ul>
            <li>驗證您的身份並維持登入狀態</li>
            <li>代表您呼叫 Meta Graph API 以取得留言、按讚等資料</li>
            <li>儲存抽獎紀錄、獎項設定與中獎者名單</li>
            <li>維護各粉絲專頁的黑名單</li>
            <li>提供與服務相關的通知（如 token 過期提示）</li>
          </ul>
        </>
      ),
    },
    en: {
      title: 'How We Use Your Information',
      body: (
        <>
          <p>We use collected data solely for the following purposes:</p>
          <ul>
            <li>Authenticating your identity and maintaining your session</li>
            <li>Calling the Meta Graph API on your behalf to retrieve comments and reactions</li>
            <li>Storing giveaway records, prize configurations, and winner lists</li>
            <li>Maintaining per-Page blocklists</li>
            <li>Delivering service-related notifications (e.g., token expiry alerts)</li>
          </ul>
        </>
      ),
    },
  },
  {
    id: 's4',
    zh: {
      title: '資料儲存與保留',
      body: (
        <p>
          您的資料將保留至您撤銷本服務授權或要求刪除為止。抽獎紀錄在您主動刪除前將持續保留。OAuth
          存取權杖於您透過 Facebook 設定移除應用程式授權後立即失效並從系統中刪除。資料儲存於
          Supabase 提供的 PostgreSQL 資料庫，部署於符合產業安全標準的雲端基礎設施。
        </p>
      ),
    },
    en: {
      title: 'Data Retention',
      body: (
        <p>
          Your data is retained until you revoke authorization or request deletion. Giveaway records
          persist until you actively delete them. OAuth access tokens are invalidated and removed
          from our system immediately upon revocation through Facebook Settings. Data is stored in a
          PostgreSQL database provided by Supabase, hosted on cloud infrastructure meeting industry
          security standards.
        </p>
      ),
    },
  },
  {
    id: 's5',
    zh: {
      title: '資料分享',
      body: (
        <>
          <p>
            我們不會出售、交易或以其他方式將您的個人資料轉讓給第三方。我們使用以下基礎設施供應商處理資料，均受其服務條款及隱私政策約束：
          </p>
          <ul>
            <li>Supabase — 資料庫儲存</li>
            <li>Meta Graph API — 讀取 Facebook 貼文與留言資料</li>
          </ul>
        </>
      ),
    },
    en: {
      title: 'Data Sharing',
      body: (
        <>
          <p>
            We do not sell, trade, or otherwise transfer your personal data to third parties. We use
            the following infrastructure providers, each subject to their own terms and privacy
            policies:
          </p>
          <ul>
            <li>Supabase — database storage</li>
            <li>Meta Graph API — accessing Facebook post and comment data</li>
          </ul>
        </>
      ),
    },
  },
  {
    id: 's6',
    zh: {
      title: '資料安全',
      body: (
        <p>
          我們採取以下技術與組織措施保護您的資料：HTTPS 全程加密傳輸、OAuth
          權杖以存取控制保護儲存於資料庫、最小權限原則的資料庫存取控制，以及透過 Meta Webhook HMAC
          簽章驗證確保回調請求的真實性。儘管如此，網路傳輸無法保證絕對安全。如您發現任何安全疑慮，請立即聯絡我們。
        </p>
      ),
    },
    en: {
      title: 'Data Security',
      body: (
        <p>
          We implement the following technical and organizational measures to protect your data:
          HTTPS encryption for all data in transit, OAuth tokens stored in database with access
          controls, least-privilege database access controls, and HMAC signature verification for
          Meta Webhook callbacks to ensure authenticity. Despite these measures, no internet
          transmission is completely secure. If you identify any security concern, please contact us
          immediately.
        </p>
      ),
    },
  },
  {
    id: 's7',
    zh: {
      title: '您的權利與資料刪除',
      body: (
        <>
          <p>您擁有以下權利：</p>
          <ul>
            <li>
              <strong>撤銷授權：</strong>前往 Facebook 設定 → 應用程式與網站，移除 Pikora
              的存取授權。此操作將立即使我們系統中儲存的 OAuth 權杖失效，並強制登出。
            </li>
            <li>
              <strong>完整資料刪除：</strong>
              當您透過 Facebook 提交資料刪除請求時，Facebook 將呼叫我們的資料刪除
              Callback，系統將自動刪除您的帳號及所有相關資料（包括抽獎紀錄、黑名單）。
            </li>
            <li>
              <strong>查閱與匯出：</strong>
              您可於服務內查閱所有抽獎紀錄，並以 CSV 格式匯出中獎名單。
            </li>
          </ul>
        </>
      ),
    },
    en: {
      title: 'Your Rights & Data Deletion',
      body: (
        <>
          <p>You have the following rights:</p>
          <ul>
            <li>
              <strong>Revoke Authorization:</strong> Go to Facebook Settings &rarr; Apps and
              Websites and remove Pikora&apos;s access. This immediately invalidates the OAuth
              tokens stored in our system and signs you out.
            </li>
            <li>
              <strong>Complete Data Deletion:</strong> When you submit a data deletion request
              through Facebook, Facebook will invoke our Data Deletion Callback, which automatically
              deletes your account and all associated data (including giveaway records and
              blocklists).
            </li>
            <li>
              <strong>Access &amp; Export:</strong> You can review all giveaway records within the
              Service and export winner lists in CSV format at any time.
            </li>
          </ul>
        </>
      ),
    },
  },
  {
    id: 's8',
    zh: {
      title: 'Cookie 與 Session',
      body: (
        <p>
          本服務使用 HTTP-only Session Cookie 維持您的登入狀態，Cookie 中以 JWT
          格式儲存經簽署的身份驗證資訊。我們不使用任何追蹤用途或廣告用途的
          Cookie，亦不使用第三方分析工具。
        </p>
      ),
    },
    en: {
      title: 'Cookies & Sessions',
      body: (
        <p>
          The Service uses an HTTP-only session cookie to maintain your authenticated state, storing
          signed authentication information in JWT format. We do not use tracking or advertising
          cookies, nor any third-party analytics tools.
        </p>
      ),
    },
  },
  {
    id: 's9',
    zh: {
      title: '未成年人保護',
      body: (
        <p>本服務不面向未滿 18 歲的使用者。若我們得知已收集未成年人的個人資料，將立即予以刪除。</p>
      ),
    },
    en: {
      title: 'Minors',
      body: (
        <p>
          The Service is not directed to individuals under 18 years of age. If we become aware that
          we have collected personal data from a minor, we will delete it immediately.
        </p>
      ),
    },
  },
  {
    id: 's10',
    zh: {
      title: '隱私政策變更',
      body: (
        <p>
          我們可能不定期更新本隱私政策。重大變更將於本頁面公告並更新修改日期。建議您定期查閱以了解最新版本。繼續使用本服務即表示您接受更新後的政策。
        </p>
      ),
    },
    en: {
      title: 'Changes to This Policy',
      body: (
        <p>
          We may update this Privacy Policy from time to time. Material changes will be announced on
          this page with an updated date. We encourage you to review this page periodically.
          Continued use of the Service after changes are posted constitutes your acceptance of the
          revised Policy.
        </p>
      ),
    },
  },
  {
    id: 's11',
    zh: {
      title: '聯絡我們',
      body: <p>如對本隱私政策有任何疑問或想行使您的資料權利，請透過 Facebook 粉絲專頁聯絡我們。</p>,
    },
    en: {
      title: 'Contact Us',
      body: (
        <p>
          If you have questions about this Privacy Policy or wish to exercise your data rights,
          please contact us via our Facebook Page.
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

export default function PrivacyPolicy() {
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
            <button
              key={opt.value}
              className={cn(
                'text-caption rounded-md px-3 py-1.5 font-medium transition-all duration-150',
                lang === opt.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setLang(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-8">
        {lang === 'en' ? (
          <>
            <h1 className="text-title mb-1 font-bold">Privacy Policy</h1>
            <p className="text-body text-muted-foreground">Last updated: March 2026</p>
          </>
        ) : (
          <>
            <h1 className="text-title mb-1 font-bold">隱私政策</h1>
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
            <div className="mb-4 flex items-start gap-3">
              <span className="bg-muted text-muted-foreground text-caption mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-semibold tabular-nums">
                {i + 1}
              </span>
              <div>
                <h2 className="text-body text-foreground font-semibold">
                  {lang === 'en' ? s.en.title : s.zh.title}
                </h2>
              </div>
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
