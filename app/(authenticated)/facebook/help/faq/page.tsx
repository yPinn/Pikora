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
            <CardTitle>帳號與連接</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion collapsible className="w-full" type="single">
              <AccordionItem value="q1">
                <AccordionTrigger>為什麼我看不到我的粉絲專頁？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    請確認您在 Facebook
                    授權時已勾選該粉絲專頁。您可以嘗試重新連接帳號，並在授權畫面中選擇需要管理的粉專。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q2">
                <AccordionTrigger>Token 過期怎麼辦？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    Facebook 的存取權杖會定期過期。當系統提示 Token
                    過期時，請點擊「重新連接」按鈕進行授權更新。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q3">
                <AccordionTrigger>可以同時管理多個粉絲專頁嗎？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    可以。您可以在左上角的粉專選擇器中切換不同的粉絲專頁。所有已授權的粉專都會顯示在列表中。
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
                <AccordionTrigger>抽獎結果是公平的嗎？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>是的。系統使用隨機演算法從符合條件的留言中抽取，每個參加者的中獎機率相同。</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q5">
                <AccordionTrigger>為什麼某些留言沒有被計入抽獎？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>可能的原因包括：</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>留言不包含指定的關鍵字</li>
                    <li>該用戶已在黑名單中</li>
                    <li>啟用了「排除重複」且該用戶已有其他留言被計入</li>
                    <li>留言可能是回覆而非直接留言</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q6">
                <AccordionTrigger>重抽會抽到之前的中獎者嗎？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    不會。重抽功能會自動排除所有已經中獎的用戶，確保每次重抽都是從剩餘的參加者中選取。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q7">
                <AccordionTrigger>黑名單會影響其他活動嗎？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    黑名單是針對單一粉絲專頁設定的。被加入黑名單的用戶在該粉專的所有抽獎活動中都會被排除。
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
              <AccordionItem value="q8">
                <AccordionTrigger>我的資料會被儲存嗎？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    系統僅儲存必要的連接資訊（如存取權杖）。貼文和留言資料是即時從 Facebook
                    取得，不會永久儲存在我們的伺服器上。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q9">
                <AccordionTrigger>如何刪除我的帳號連接？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    您可以在設定頁面中移除粉專連接。同時建議您前往 Facebook
                    設定的「應用程式和網站」中撤銷本應用的權限。
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
