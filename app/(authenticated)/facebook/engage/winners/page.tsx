'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { Bell, Download, ExternalLink, Loader2, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyCard } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { PageTitleBar } from '@/components/common/page-title-bar';
import { PersonRow } from '@/components/common/person-row';
import { CommentLink } from '@/components/facebook/giveaway/comment-link';
import { FacebookAvatar } from '@/components/facebook/giveaway/facebook-avatar';
import { GiveawayRecordHeader } from '@/components/facebook/giveaway/giveaway-record-header';
import { NotificationStatusBadge } from '@/components/facebook/giveaway/notification-status-badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useGiveawayHistory, type GiveawayRecord } from '@/hooks/use-giveaway-history';

export default function FacebookWinnersPage() {
  const router = useRouter();
  const { records, isLoading, refresh, deleteRecord } = useGiveawayHistory();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const success = await deleteRecord(id);
    if (success) toast.success('已刪除抽獎紀錄');
    else toast.error('刪除失敗');
    setDeletingId(null);
  };

  /** 計算字串的顯示寬度（CJK 全形字元算 2，其他算 1） */
  function strDisplayWidth(text: string): number {
    let w = 0;
    for (const ch of text) {
      w +=
        /[\u1100-\u115f\u2e80-\u303e\u3041-\u33bf\u33ff\ua960-\ua97f\uac00-\ud7ff\uf900-\ufaff\ufe10-\ufe6f\uff00-\uffef]/.test(
          ch
        )
          ? 2
          : 1;
    }
    return w;
  }

  /** 掃描各欄所有儲存格，自動設定最適寬度 */
  function autoFitColumns(
    ws: ExcelJS.Worksheet,
    caps: Record<number, number> = {} // colIndex(0-based) → 最大寬度上限
  ) {
    ws.columns.forEach((col, i) => {
      let max = 0;
      col.eachCell?.({ includeEmpty: false }, (cell) => {
        const v = cell.value;
        if (!v) return;
        const text =
          v !== null && typeof v === 'object' && 'text' in v
            ? String((v as { text: unknown }).text)
            : String(v);
        max = Math.max(max, strDisplayWidth(text));
      });
      const cap = caps[i] ?? 48;
      col.width = Math.min(Math.max(max + 2, 8), cap);
    });
  }

  const exportXLSX = async (record: GiveawayRecord) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('中獎名單');

    const C = {
      titleBg: 'FF0F172A',
      titleFg: 'FFFFFFFF',
      headerBg: 'FF1E293B',
      headerFg: 'FFFFFFFF',
      prizeABg: 'FFEFF6FF',
      prizeBBg: 'FFF0FDF4',
      rowAlt: 'FFF8FAFC',
      fillBg: 'FFFEFCE8',
      fillFg: 'FF94A3B8',
      linkFg: 'FF2563EB',
      border: 'FFCBD5E1',
    };

    const border: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: C.border } },
      bottom: { style: 'thin', color: { argb: C.border } },
      left: { style: 'thin', color: { argb: C.border } },
      right: { style: 'thin', color: { argb: C.border } },
    };

    ws.columns = [
      { key: 'prize' },
      { key: 'name' },
      { key: 'message' },
      { key: 'time' },
      { key: 'link' },
      { key: 'status' },
      { key: 'note' },
    ];

    const titleText =
      (record.name ? `${record.name}　` : '') +
      `中獎名單　${format(new Date(record.createdAt), 'yyyy/MM/dd HH:mm')}`;

    const titleRow = ws.addRow([titleText]);
    titleRow.height = 28;
    ws.mergeCells(1, 1, 1, 7);
    const titleCell = titleRow.getCell(1);
    titleCell.font = { bold: true, size: 13, color: { argb: C.titleFg } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.titleBg } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

    const headers = ['獎項', '中獎者', '留言內容', '留言時間', '留言連結', '領獎狀態', '備註'];
    const headerRow = ws.addRow(headers);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: C.headerFg } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = border;
    });

    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 2 }];

    const prizeOrder = new Map(record.prizes.map((p, i) => [p.id, i]));
    const sortedWinners = [...record.winners].sort(
      (a, b) => (prizeOrder.get(a.prize.id) ?? 0) - (prizeOrder.get(b.prize.id) ?? 0)
    );

    sortedWinners.forEach((winner, rowIdx) => {
      const prizeIdx = prizeOrder.get(winner.prize.id) ?? 0;
      const groupBg = prizeIdx % 2 === 0 ? C.prizeABg : C.prizeBBg;
      const rowBg = rowIdx % 2 === 0 ? groupBg : C.rowAlt;

      const commentUrl =
        record.post_url && winner.comment_id
          ? `${record.post_url}?comment_id=${winner.comment_id}`
          : '';

      const dataRow = ws.addRow([
        winner.prize.name,
        winner.from_name,
        winner.comment_message || '',
        winner.comment_created_time
          ? format(new Date(winner.comment_created_time), 'yyyy/MM/dd HH:mm')
          : '',
        commentUrl ? '查看留言' : '',
        '',
        '',
      ]);
      dataRow.height = 20;

      dataRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
        const isFill = colNum >= 6;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isFill ? C.fillBg : rowBg },
        };
        cell.border = border;
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNum === 3 ? 'left' : 'center',
          wrapText: colNum === 3,
        };
        if (isFill) cell.font = { italic: true, color: { argb: C.fillFg } };
        if (colNum === 5 && commentUrl) {
          cell.value = { text: '查看留言', hyperlink: commentUrl };
          cell.font = { color: { argb: C.linkFg }, underline: true };
        }
      });
    });

    // 留言欄（index 2）限 50；備註欄（index 6）限 40；其餘自動
    autoFitColumns(ws, { 2: 50, 6: 40 });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const namePrefix = record.name ? `${record.name}_` : '';
    link.download = `抽獎名單_${namePrefix}${format(new Date(record.createdAt), 'yyyyMMdd_HHmm')}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const groupWinnersByPrize = (record: GiveawayRecord) =>
    record.prizes.map((prize) => ({
      prize,
      winners: record.winners.filter((w) => w.prize.id === prize.id),
    }));

  return (
    <>
      <PageHeader />
      <div className="gap-page p-page flex flex-1 flex-col pt-0">
        <PageTitleBar isLoading={isLoading} title="中獎名單" onRefresh={refresh} />

        {isLoading && records.length === 0 ? (
          <EmptyCard
            icon={Loader2}
            iconClassName="h-8 w-8 animate-spin opacity-100"
            title="載入中..."
          />
        ) : records.length === 0 ? (
          <EmptyCard
            description="前往「抽獎活動」進行抽獎並儲存結果"
            icon={Trophy}
            title="尚無抽獎紀錄"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {records.map((record) => {
              const isExpanded = expandedIds.has(record.id);
              const winnerGroups = groupWinnersByPrize(record);
              const validWinners = record.winners.filter((w) => w.isValid);
              const notifiedCount = validWinners.filter((w) => w.notified_at).length;

              return (
                <Collapsible
                  key={record.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpand(record.id)}
                >
                  <Card className="overflow-hidden">
                    <GiveawayRecordHeader
                      actions={
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() =>
                                  router.push(`/facebook/engage/notify?giveawayId=${record.id}`)
                                }
                              >
                                <Bell />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>發送通知</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => void exportXLSX(record)}
                              >
                                <Download />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>匯出 Excel</TooltipContent>
                          </Tooltip>
                          {record.post_url && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button asChild size="icon-sm" variant="ghost">
                                  <a
                                    href={record.post_url}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                  >
                                    <ExternalLink />
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>查看貼文</TooltipContent>
                            </Tooltip>
                          )}
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon-sm" variant="ghost">
                                    <Trash2 />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>刪除</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>確定要刪除嗎？</AlertDialogTitle>
                                <AlertDialogDescription>
                                  此操作將永久刪除這筆抽獎紀錄及所有中獎者資料，無法復原。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  disabled={deletingId === record.id}
                                  onClick={() => void handleDelete(record.id)}
                                >
                                  {deletingId === record.id && <Loader2 className="animate-spin" />}
                                  刪除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      }
                      badges={
                        <>
                          <Badge variant="secondary">
                            {record.status === 'COMPLETED' ? '已完成' : '草稿'}
                          </Badge>
                          <NotificationStatusBadge
                            notifiedCount={notifiedCount}
                            totalCount={validWinners.length}
                          />
                        </>
                      }
                      isOpen={isExpanded}
                      record={record}
                    />

                    <CollapsibleContent>
                      <Separator />
                      <div className="px-4 pb-3">
                        {winnerGroups.map(({ prize, winners }) => (
                          <div key={prize.id} className="mt-3">
                            <h4 className="text-body mb-2 flex items-center gap-2 font-medium">
                              <Trophy className="text-primary h-4 w-4" />
                              {prize.name}
                              <span className="text-muted-foreground font-normal">
                                ({winners.length}/{prize.quantity} 名)
                              </span>
                            </h4>

                            {winners.length === 0 ? (
                              <p className="text-muted-foreground text-caption py-2 text-center">
                                無中獎者
                              </p>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {winners.map((winner) => (
                                  <PersonRow
                                    key={winner.id}
                                    actions={
                                      <>
                                        {winner.comment_created_time && (
                                          <span className="text-muted-foreground text-caption">
                                            {format(
                                              new Date(winner.comment_created_time),
                                              'MM/dd HH:mm'
                                            )}
                                          </span>
                                        )}
                                        {record.post_url && winner.comment_id && (
                                          <CommentLink
                                            commentId={winner.comment_id}
                                            postUrl={record.post_url}
                                          />
                                        )}
                                      </>
                                    }
                                    avatar={
                                      <FacebookAvatar
                                        name={winner.from_name}
                                        pageId={record.pageId}
                                        userId={winner.from_id}
                                      />
                                    }
                                    meta={winner.comment_message || undefined}
                                    name={
                                      <p className="text-body font-medium">{winner.from_name}</p>
                                    }
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
