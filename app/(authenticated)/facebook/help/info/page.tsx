'use client';

import { BarChart3, Layers, Settings, Trophy } from 'lucide-react';

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
            <CardTitle>Pikora - Facebook 粉專管理工具</CardTitle>
            <CardDescription>一站式管理您的 Facebook 粉絲專頁，提升互動效率</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Pikora
              是一款專為粉絲專頁管理者設計的工具，整合貼文管理、留言互動、抽獎活動等功能，讓您更有效率地經營社群。
            </p>
          </CardContent>
        </Card>

        <h3 className="mt-4 font-semibold">主要功能</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Layers className="text-primary h-8 w-8" />
              <div>
                <CardTitle className="text-base">Content 內容管理</CardTitle>
                <CardDescription>貼文與留言的統一管理</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground text-body list-inside list-disc space-y-1">
                <li>瀏覽所有粉專貼文</li>
                <li>查看並管理留言</li>
                <li>快速篩選與搜尋</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Trophy className="text-primary h-8 w-8" />
              <div>
                <CardTitle className="text-base">Engage 互動功能</CardTitle>
                <CardDescription>抽獎與通知工具</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground text-body list-inside list-disc space-y-1">
                <li>公平透明的抽獎系統</li>
                <li>中獎名單管理</li>
                <li>批次通知發送</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <BarChart3 className="text-primary h-8 w-8" />
              <div>
                <CardTitle className="text-base">Insights 數據分析</CardTitle>
                <CardDescription>粉專表現與受眾洞察</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground text-body list-inside list-disc space-y-1">
                <li>總覽報告與趨勢</li>
                <li>粉絲組成分析</li>
                <li>互動數據追蹤</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Settings className="text-primary h-8 w-8" />
              <div>
                <CardTitle className="text-base">安全與隱私</CardTitle>
                <CardDescription>資料保護機制</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground text-body list-inside list-disc space-y-1">
                <li>OAuth 2.0 安全認證</li>
                <li>資料本地處理</li>
                <li>不儲存敏感資訊</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
