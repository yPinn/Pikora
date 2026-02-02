import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Link
        className="text-body text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1"
        href="/login"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </Link>

      <h1 className="text-title mb-2 font-bold">隱私政策</h1>
      <p className="text-body text-muted-foreground mb-8">最後更新：2025 年 1 月</p>

      <div className="text-body space-y-6 leading-relaxed">
        <section>
          <h2 className="mb-2 font-semibold">1. 資料收集</h2>
          <p className="text-muted-foreground">
            當您使用 Facebook
            登入本服務時，我們會收集您的基本資料，包括姓名、電子郵件及頭像。此外，我們會存取您授權管理的粉絲專頁資訊及貼文留言資料。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">2. 資料使用</h2>
          <p className="text-muted-foreground">
            收集的資料僅用於提供抽獎服務功能，包括讀取留言、篩選參與者及記錄中獎結果。我們不會將您的資料用於其他目的。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">3. 資料分享</h2>
          <p className="text-muted-foreground">
            我們不會出售、交易或以其他方式將您的個人資料轉讓給第三方。您的資料僅在提供服務所必需的範圍內處理。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">4. 資料安全</h2>
          <p className="text-muted-foreground">
            我們採取合理的技術措施保護您的資料安全，包括加密傳輸及安全儲存。然而，網路傳輸無法保證絕對安全。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">5. 您的權利</h2>
          <p className="text-muted-foreground">
            您可隨時透過 Facebook
            設定撤銷本服務的存取權限。如需刪除您的資料，請聯絡我們，我們將在合理時間內處理您的請求。
          </p>
        </section>
      </div>
    </div>
  );
}
