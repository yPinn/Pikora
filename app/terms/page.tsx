import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Link
        className="text-body text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1"
        href="/login"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </Link>

      <h1 className="text-title mb-2 font-bold">服務條款</h1>
      <p className="text-body text-muted-foreground mb-8">最後更新：2025 年 1 月</p>

      <div className="text-body space-y-6 leading-relaxed">
        <section>
          <h2 className="mb-2 font-semibold">1. 條款接受</h2>
          <p className="text-muted-foreground">
            歡迎使用
            Pikora。當您存取或使用本服務時，即表示您已閱讀、理解並同意受本服務條款約束。若您不同意本條款，請勿使用本服務。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">2. 服務內容</h2>
          <p className="text-muted-foreground">
            Pikora 提供 Facebook
            粉絲專頁留言抽獎功能。您可透過本服務讀取粉絲專頁貼文留言、設定抽獎條件並隨機抽選中獎者。本服務需要您授權存取
            Facebook 帳號及粉絲專頁相關權限。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">3. 使用者責任</h2>
          <p className="text-muted-foreground">
            您必須確保擁有所連結粉絲專頁的管理權限，並遵守 Facebook
            平台政策及當地法規。您對透過本服務舉辦之活動內容及結果負完全責任。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">4. 免責聲明</h2>
          <p className="text-muted-foreground">
            本服務按「現狀」提供，不提供任何明示或暗示之保證。我們不保證服務不中斷、無錯誤或符合您的特定需求。對於因使用本服務所產生之任何損失，我們不承擔責任。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">5. 條款修改</h2>
          <p className="text-muted-foreground">
            我們保留隨時修改本條款的權利。修改後的條款將於本頁面公布，繼續使用本服務即表示您接受修改後的條款。
          </p>
        </section>
      </div>
    </div>
  );
}
