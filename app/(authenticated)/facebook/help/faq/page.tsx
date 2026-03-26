'use client';

import { PageHeader } from '@/components/common/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FAQPage() {
  return (
    <>
      <PageHeader />
      <div className="gap-page p-page flex flex-1 flex-col pt-0">
        <h2 className="text-heading font-semibold">常見問題</h2>

        <Card>
          <CardHeader>
            <CardTitle>帳號與授權</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion collapsible className="w-full" type="single">
              <AccordionItem value="q1">
                <AccordionTrigger>為什麼我看不到某個粉絲專頁？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    請確認在 Facebook
                    授權畫面中有勾選該粉絲專頁。若當時未勾選，請登出後重新登入，並在授權步驟中選擇所有需要管理的粉專。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q2">
                <AccordionTrigger>系統提示 Token 過期或無效怎麼辦？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    Facebook 的使用者存取權杖有效期通常為 60
                    天。過期後系統會提示重新授權，請點擊提示連結或直接登出再登入即可更新
                    Token。若粉絲專頁管理員身分有異動，也可能造成 Token 失效。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q3">
                <AccordionTrigger>可以同時管理多個粉絲專頁嗎？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    可以。授權後，所有已勾選的粉絲專頁都會出現在左側選單的粉專選擇器中，點擊即可切換。每個粉專的黑名單與抽獎紀錄各自獨立。
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>抽獎功能</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion collapsible className="w-full" type="single">
              <AccordionItem value="q4">
                <AccordionTrigger>抽獎結果是公正的嗎？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    是的。系統採用密碼學安全亂數（CSPRNG）進行抽取，並使用無模數偏差的演算法，確保每位符合資格的參加者機率完全相等。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q5">
                <AccordionTrigger>為什麼某些留言沒有出現在抽獎池中？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>可能的原因包括：</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>留言內容不符合設定的關鍵字條件</li>
                    <li>留言時間不在設定的時間區間內</li>
                    <li>@ 提及人數不足設定的下限</li>
                    <li>按讚反應類型不符合設定</li>
                    <li>啟用了「排除重複」，且該用戶已有更早的留言被計入</li>
                    <li>該用戶已被加入此粉絲專頁的黑名單</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q6">
                <AccordionTrigger>重抽會抽到之前的中獎者嗎？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    不會。執行重抽時，系統會自動排除本次活動中所有已中獎的用戶，僅從剩餘符合資格的參加者中重新抽取。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q7">
                <AccordionTrigger>黑名單會影響其他活動或其他粉專嗎？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    黑名單是針對單一粉絲專頁設定的，不同粉專的黑名單互相獨立。被加入黑名單的用戶會在該粉專的所有未來抽獎中自動排除。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q8">
                <AccordionTrigger>留言數量很多，載入需要很久嗎？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    留言透過 Meta Graph API
                    分頁批次載入。留言量較大時（數千則以上），載入時間會相對較長。載入期間可以看到進度，完成後方可進行抽獎。貼文與留言資料僅暫存於當次瀏覽
                    session，不會儲存至伺服器。
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>資料與隱私</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion collapsible className="w-full" type="single">
              <AccordionItem value="q9">
                <AccordionTrigger>哪些資料會被儲存？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>系統僅儲存以下必要資料：</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>您的 Facebook 帳號基本資訊（ID、姓名、頭像）</li>
                    <li>加密儲存的 OAuth 存取權杖</li>
                    <li>您建立的抽獎紀錄、獎項設定與得獎名單</li>
                    <li>各粉絲專頁的黑名單</li>
                  </ul>
                  <p className="mt-2">
                    貼文內容、完整留言清單等資料僅於前端暫存，不會上傳至伺服器。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q10">
                <AccordionTrigger>如何撤銷授權並刪除我的資料？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    您可前往 Facebook 設定 → 應用程式與網站，移除 Pikora
                    的存取授權。授權撤銷後，系統儲存的 Token
                    將立即失效。若需完整刪除所有資料（包含抽獎紀錄與黑名單），請透過 Facebook
                    的「資料刪除請求」提交，系統將自動清除您的所有相關資料。
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
