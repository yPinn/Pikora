'use client';

import { useState } from 'react';

import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import ExcelJS from 'exceljs';
import {
  Trophy,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  Trash2,
  Download,
  Calendar,
  Gift,
  Users,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/page-header';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  useGiveawayHistory,
  type GiveawayRecord,
  type GiveawayWinner,
} from '@/hooks/use-giveaway-history';

export default function FacebookWinnersPage() {
  const { records, isLoading, refresh, deleteRecord } = useGiveawayHistory();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const success = await deleteRecord(id);
    if (success) {
      toast.success('已刪除抽獎紀錄');
    } else {
      toast.error('刪除失敗');
    }
    setDeletingId(null);
  };

  const exportXLSX = async (record: GiveawayRecord) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('中獎名單');

    // ── 顏色 tokens ──────────────────────────────
    const C = {
      titleBg: 'FF0F172A', // slate-900
      titleFg: 'FFFFFFFF',
      headerBg: 'FF1E293B', // slate-800
      headerFg: 'FFFFFFFF',
      prizeABg: 'FFEFF6FF', // blue-50
      prizeBBg: 'FFF0FDF4', // green-50
      rowAlt: 'FFF8FAFC', // slate-50
      fillBg: 'FFFEFCE8', // yellow-50
      fillFg: 'FF94A3B8', // slate-400
      linkFg: 'FF2563EB', // blue-600
      border: 'FFCBD5E1', // slate-300
    };

    const border: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: C.border } },
      bottom: { style: 'thin', color: { argb: C.border } },
      left: { style: 'thin', color: { argb: C.border } },
      right: { style: 'thin', color: { argb: C.border } },
    };

    // ── 欄寬 ─────────────────────────────────────
    ws.columns = [
      { key: 'prize', width: 14 },
      { key: 'name', width: 20 },
      { key: 'message', width: 44 },
      { key: 'time', width: 18 },
      { key: 'link', width: 12 },
      { key: 'status', width: 14 },
      { key: 'note', width: 26 },
    ];

    // ── 第 1 列：標題（合併全欄） ─────────────────
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

    // ── 第 2 列：欄位標頭 ─────────────────────────
    const headers = ['獎項', '中獎者', '留言內容', '留言時間', '留言連結', '領獎狀態', '備註'];
    const headerRow = ws.addRow(headers);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: C.headerFg } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = border;
    });

    // ── 凍結前 2 列 ───────────────────────────────
    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 2 }];

    // ── 資料列 ────────────────────────────────────
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
        const isFill = colNum >= 6; // 領獎狀態、備註
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
        if (isFill) {
          cell.font = { italic: true, color: { argb: C.fillFg } };
        }
        // 留言連結：超連結樣式
        if (colNum === 5 && commentUrl) {
          cell.value = { text: '查看留言', hyperlink: commentUrl };
          cell.font = { color: { argb: C.linkFg }, underline: true };
        }
      });
    });

    // ── 匯出 ─────────────────────────────────────
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

  // 按獎項分組中獎者
  const groupWinnersByPrize = (record: GiveawayRecord) => {
    const groups: { prize: GiveawayRecord['prizes'][0]; winners: GiveawayWinner[] }[] = [];

    record.prizes.forEach((prize) => {
      const prizeWinners = record.winners.filter((w) => w.prize.id === prize.id);
      groups.push({ prize, winners: prizeWinners });
    });

    return groups;
  };

  return (
    <>
      <PageHeader />
      <div className="gap-page p-page flex flex-1 flex-col pt-0">
        <div className="flex items-center justify-between">
          <h2 className="text-heading font-semibold">中獎名單</h2>
          <Button disabled={isLoading} size="sm" variant="outline" onClick={refresh}>
            <RefreshCw className={`mr-1 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            重新整理
          </Button>
        </div>

        {isLoading && records.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16">
            <Loader2 className="text-muted-foreground mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-body">載入中...</p>
          </Card>
        ) : records.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16">
            <Trophy className="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
            <p className="text-muted-foreground text-body">尚無抽獎紀錄</p>
            <p className="text-muted-foreground text-caption mt-1">
              前往「抽獎活動」進行抽獎並儲存結果
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {records.map((record) => {
              const isExpanded = expandedIds.has(record.id);
              const winnerGroups = groupWinnersByPrize(record);

              return (
                <Collapsible
                  key={record.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpand(record.id)}
                >
                  <Card className="overflow-hidden">
                    {/* Header */}
                    <CollapsibleTrigger asChild>
                      <div className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 px-4 py-3">
                        <div className="text-muted-foreground">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{record.name || '未命名抽獎'}</span>
                            <span className="text-muted-foreground text-caption font-mono">
                              #{record.id.slice(-6)}
                            </span>
                            <Badge variant="secondary">
                              {record.status === 'COMPLETED' ? '已完成' : '草稿'}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground text-caption mt-1 flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(record.createdAt), 'yyyy/MM/dd HH:mm', {
                                locale: zhTW,
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Gift className="h-3 w-3" />
                              {record.prizes.length} 個獎項
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {record.winners.length} 位中獎者
                            </span>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            title="匯出 CSV"
                            variant="ghost"
                            onClick={() => void exportXLSX(record)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {record.post_url && (
                            <a
                              href={record.post_url}
                              rel="noopener noreferrer"
                              target="_blank"
                              title="查看貼文"
                            >
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" title="刪除" variant="ghost">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
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
                                  onClick={() => handleDelete(record.id)}
                                >
                                  {deletingId === record.id ? (
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                  ) : null}
                                  刪除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    {/* Content */}
                    <CollapsibleContent>
                      <div className="border-t px-4 pb-3">
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
                              <div className="space-y-2">
                                {winners.map((winner) => (
                                  <div
                                    key={winner.id}
                                    className="bg-muted/50 flex items-center gap-3 rounded-lg px-3 py-2"
                                  >
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={`/api/facebook/picture?userId=${winner.from_id}&pageId=${record.pageId}`}
                                      />
                                      <AvatarFallback>{winner.from_name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-body font-medium">{winner.from_name}</p>
                                      {winner.comment_message && (
                                        <p className="text-muted-foreground text-caption truncate">
                                          {winner.comment_message}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {winner.comment_created_time && (
                                        <span className="text-muted-foreground text-caption">
                                          {format(
                                            new Date(winner.comment_created_time),
                                            'MM/dd HH:mm'
                                          )}
                                        </span>
                                      )}
                                      {record.post_url && winner.comment_id && (
                                        <a
                                          className="text-muted-foreground hover:text-primary"
                                          href={`${record.post_url}?comment_id=${winner.comment_id}`}
                                          rel="noopener noreferrer"
                                          target="_blank"
                                          title="查看留言"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
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
