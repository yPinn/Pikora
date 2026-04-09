'use client';

import { Filter, Gift, History, Layers, Lock, Shuffle } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SystemInfoPage() {
  return (
    <>
      <PageHeader />
      <div className="gap-page p-page flex flex-1 flex-col pt-0">
        <h2 className="text-heading font-semibold">系統介紹</h2>

        <Card>
          <CardHeader>
            <CardTitle>Pikora — Facebook 粉絲專頁抽獎管理工具</CardTitle>
            <CardDescription>
              專為粉絲專頁管理者設計，從載入留言到抽出得獎者，一站完成
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-body">
              Pikora 透過 Meta Graph API
              讀取您授權管理的粉絲專頁留言，提供進階篩選、密碼學安全抽獎、黑名單管理與完整歷史紀錄，讓每場社群抽獎活動更省力、更公正。
            </p>
          </CardContent>
        </Card>

        <h3 className="text-heading font-semibold">主要功能模組</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Layers className="text-primary h-8 w-8 shrink-0" />
              <div>
                <CardTitle className="text-heading">Content — 內容管理</CardTitle>
                <CardDescription>貼文與留言的瀏覽與查詢</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground text-body list-inside list-disc space-y-1">
                <li>瀏覽粉絲專頁貼文，點擊即可複製網址</li>
                <li>貼入貼文連結一鍵載入全部留言（含巢狀回覆）</li>
                <li>按關鍵字即時搜尋與排序留言</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Filter className="text-primary h-8 w-8 shrink-0" />
              <div>
                <CardTitle className="text-heading">進階篩選條件</CardTitle>
                <CardDescription>精準定義符合資格的留言</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground text-body list-inside list-disc space-y-1">
                <li>留言時間區間限制</li>
                <li>關鍵字過濾（支援正規表達式）</li>
                <li>@提及人數下限</li>
                <li>指定按讚反應類型</li>
                <li>排除重複參加（同人多留言只計一次）</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Shuffle className="text-primary h-8 w-8 shrink-0" />
              <div>
                <CardTitle className="text-heading">Engage — 抽獎系統</CardTitle>
                <CardDescription>公正透明的隨機抽獎</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground text-body list-inside list-disc space-y-1">
                <li>密碼學安全亂數（CSPRNG），避免模數偏差</li>
                <li>可設定多組獎項與各自名額</li>
                <li>支援同人限得一獎或可重複中獎</li>
                <li>重抽自動排除已中獎者</li>
                <li>抽獎前可預覽完整獎池名單</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Gift className="text-primary h-8 w-8 shrink-0" />
              <div>
                <CardTitle className="text-heading">得獎者管理</CardTitle>
                <CardDescription>紀錄與追蹤每場活動結果</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground text-body list-inside list-disc space-y-1">
                <li>完整保存每次抽獎的得獎名單</li>
                <li>可匯出 CSV 格式得獎者清單</li>
                <li>記錄得獎留言內容與當時篩選設定</li>
                <li>一鍵前往得獎者的 Facebook 留言原文</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <History className="text-primary h-8 w-8 shrink-0" />
              <div>
                <CardTitle className="text-heading">黑名單系統</CardTitle>
                <CardDescription>針對粉絲專頁的排除管理</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground text-body list-inside list-disc space-y-1">
                <li>每個粉絲專頁獨立維護黑名單</li>
                <li>可從得獎結果或獎池名單一鍵加入黑名單</li>
                <li>黑名單用戶自動排除於所有抽獎之外</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Lock className="text-primary h-8 w-8 shrink-0" />
              <div>
                <CardTitle className="text-heading">安全與資料保護</CardTitle>
                <CardDescription>最小權限原則，保護您的資料</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground text-body list-inside list-disc space-y-1">
                <li>OAuth 2.0 授權，Token 加密儲存於 HTTP-only Cookie</li>
                <li>貼文留言僅暫存於當次瀏覽 session，不上傳至伺服器</li>
                <li>僅儲存抽獎紀錄、黑名單等必要業務資料</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
