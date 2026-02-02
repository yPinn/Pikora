'use client';

import { PageHeader } from '@/components/common/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GuidePagePage() {
  return (
    <>
      <PageHeader />
      <div className="gap-page p-page flex flex-1 flex-col pt-0">
        <h2 className="text-heading font-semibold">使用指南</h2>

        <Card>
          <CardHeader>
            <CardTitle>快速開始</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion collapsible className="w-full" type="single">
              <AccordionItem value="step-1">
                <AccordionTrigger>步驟 1：連接 Facebook 粉絲專頁</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>1. 點擊左上角的粉專選擇器</p>
                  <p>2. 選擇「新增粉絲專頁」</p>
                  <p>3. 使用 Facebook 帳號授權</p>
                  <p>4. 選擇要管理的粉絲專頁</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-2">
                <AccordionTrigger>步驟 2：瀏覽貼文與留言</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>1. 前往「Content → 貼文管理」</p>
                  <p>2. 選擇想要查看的貼文</p>
                  <p>3. 點擊「查看留言」載入該貼文的所有留言</p>
                  <p>4. 可使用搜尋功能篩選特定留言</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-3">
                <AccordionTrigger>步驟 3：舉辦抽獎活動</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>1. 前往「Engage → 抽獎活動」</p>
                  <p>2. 選擇要抽獎的貼文</p>
                  <p>3. 設定抽獎條件（關鍵字、排除重複等）</p>
                  <p>4. 點擊「開始抽獎」</p>
                  <p>5. 查看中獎者並可重抽或加入黑名單</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>抽獎功能詳解</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion collapsible className="w-full" type="single">
              <AccordionItem value="filter-1">
                <AccordionTrigger>關鍵字篩選</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    設定留言必須包含的關鍵字，例如「+1」、「我要參加」等。系統會自動過濾不符合條件的留言。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="filter-2">
                <AccordionTrigger>排除重複參加者</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>啟用後，同一個用戶多次留言只會計算一次，確保公平性。</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="filter-3">
                <AccordionTrigger>黑名單管理</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    可將特定用戶加入黑名單，這些用戶將不會出現在抽獎池中。適用於排除測試帳號或違規用戶。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="filter-4">
                <AccordionTrigger>重新抽獎</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    如果中獎者不符合資格（如未分享貼文），可點擊重抽按鈕，系統會自動排除已中獎者並重新抽取。
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>驗證中獎者</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>抽獎完成後，您可能需要驗證中獎者是否符合活動條件（如分享貼文）：</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>點擊中獎者旁的「查看留言」圖示</li>
              <li>系統會跳轉到 Facebook 該留言位置</li>
              <li>點擊留言者的名稱進入其個人頁面</li>
              <li>檢查其動態牆是否有分享您的貼文</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
