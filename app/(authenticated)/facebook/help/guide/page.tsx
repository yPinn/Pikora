'use client';

import { PageHeader } from '@/components/common/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GuidePage() {
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
                <AccordionTrigger>步驟 1：以 Facebook 帳號登入</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>1. 在登入頁面點擊「以 Facebook 登入」</p>
                  <p>2. 在 Facebook 授權畫面中，勾選您要管理的所有粉絲專頁</p>
                  <p>3. 完成授權後系統自動導回，並載入您的粉絲專頁清單</p>
                  <p>4. 從左側選單的粉絲專頁選擇器切換目前操作的粉專</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-2">
                <AccordionTrigger>步驟 2：瀏覽貼文並載入留言</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>1. 前往左側選單「Content → 貼文」</p>
                  <p>2. 系統會列出該粉專最近的貼文，包含發布時間與互動數</p>
                  <p>3. 點擊貼文的「查看留言」或前往「Content → 留言」</p>
                  <p>4. 貼上目標貼文網址，點擊載入；留言將分頁批次讀取</p>
                  <p>5. 可使用關鍵字搜尋快速篩選特定留言</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-3">
                <AccordionTrigger>步驟 3：設定抽獎條件</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>1. 前往「Engage → 抽獎」</p>
                  <p>2. 選擇或貼上目標貼文網址，載入留言</p>
                  <p>3. 依需求設定以下篩選條件（可選）：</p>
                  <ul className="mt-1 list-inside list-disc space-y-1 pl-3">
                    <li>留言時間區間（起訖時間）</li>
                    <li>
                      關鍵字過濾（支援正規表達式，如 <code>^我要參加</code>）
                    </li>
                    <li>@提及人數下限（例如：至少標記 1 位朋友）</li>
                    <li>指定按讚反應類型（如：限愛心、哈哈等）</li>
                    <li>是否排除重複參加者（同人多留言只計一次）</li>
                  </ul>
                  <p>4. 設定各獎項名額與是否允許同人重複得獎</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-4">
                <AccordionTrigger>步驟 4：執行抽獎並管理結果</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>1. 確認抽獎池人數後，點擊「開始抽獎」</p>
                  <p>2. 系統以密碼學安全亂數即時抽出得獎者</p>
                  <p>3. 得獎結果自動儲存至歷史紀錄</p>
                  <p>4. 如需重抽，點擊「重抽」將自動排除已中獎者</p>
                  <p>5. 可對得獎者一鍵加入黑名單，或點擊連結前往其 Facebook 留言</p>
                  <p>6. 於「Engage → 得獎紀錄」可查閱所有歷史結果並匯出 CSV</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>抽獎篩選條件詳解</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion collapsible className="w-full" type="single">
              <AccordionItem value="filter-1">
                <AccordionTrigger>關鍵字篩選（正規表達式）</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>
                    系統支援完整的正規表達式語法。例如輸入 <code>我要參加|+1</code>{' '}
                    可匹配任一關鍵字；輸入 <code>^參加</code>{' '}
                    則要求留言以「參加」開頭。留言內容不符合的將自動排除。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="filter-2">
                <AccordionTrigger>@提及人數下限</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    設定後，留言中 @ 標記的朋友數量必須達到指定下限才符合資格。適合「標記 1
                    位朋友即可參加」類型的活動。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="filter-3">
                <AccordionTrigger>排除重複參加者</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    啟用後，同一用戶無論留言幾次，抽獎池中只計算一次（以最早留言為準）。確保每位參加者機會均等。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="filter-4">
                <AccordionTrigger>黑名單排除</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>
                    黑名單針對單一粉絲專頁維護。被加入黑名單的用戶將自動從該粉專所有抽獎的抽獎池中排除，無需每次手動設定。
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>得獎者驗證建議</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>若活動條件包含「需分享貼文」等需要額外驗證的要求，建議：</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>在得獎結果頁點擊得獎者的留言連結，直接跳轉至 Facebook 該則留言</li>
              <li>點擊得獎者名稱進入其 Facebook 個人頁面</li>
              <li>確認其動態牆是否有分享活動貼文</li>
              <li>若不符合資格，點擊「重抽」並可選擇將其加入黑名單</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
