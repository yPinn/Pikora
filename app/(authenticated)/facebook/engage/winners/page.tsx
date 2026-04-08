'use client';

import { useEffect, useMemo, useState, useRef } from 'react';

import { useSearchParams } from 'next/navigation';

import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import {
  Bell,
  BellOff,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  Download,
  ExternalLink,
  Gift,
  Loader2,
  MessageSquare,
  Send,
  Trash2,
  Trophy,
  UserRound,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { EmptyCard } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { PageTitleBar } from '@/components/common/page-title-bar';
import { PersonRow } from '@/components/common/person-row';
import { FacebookAvatar } from '@/components/facebook/facebook-avatar';
import { CommentLink } from '@/components/facebook/giveaway/comment-link';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFacebookPage } from '@/contexts/facebook-page-store';
import {
  useGiveawayHistory,
  type GiveawayRecord,
  type GiveawayWinner,
} from '@/hooks/use-giveaway-history';
import { renderTemplate } from '@/lib/giveaway/template';
import { apiPath, cn } from '@/lib/utils';
import { buildCommentUrl, isAnonymousUser } from '@/lib/utils/facebook';

// ── 通知模板預設值 ─────────────────────────────────────────────────────────────

const DEFAULT_REPLY_TEMPLATE = `恭喜您中獎！請私訊本粉絲專頁完成領獎。`;

const DEFAULT_DM_TEMPLATE = `恭喜您獲得【{{prizeName}}】（{{activityName}}）！

請提供以下資訊：
{{contactFields}}

請於 7 天內回覆，逾期視同放棄。
原貼文：{{postLink}}`;

const CONTACT_FIELD_OPTIONS = [
  { id: 'phone', label: '電話' },
  { id: 'email', label: 'Email' },
  { id: 'address', label: '收件地址' },
  { id: 'note', label: '備註' },
];

function buildContactFields(selected: string[]): string {
  if (selected.length === 0) return '（請告知您的聯絡方式）';
  return selected
    .map((id) => `- ${CONTACT_FIELD_OPTIONS.find((f) => f.id === id)?.label ?? id}`)
    .join('\n');
}

// ── Excel 匯出工具 ────────────────────────────────────────────────────────────

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

function autoFitColumns(ws: ExcelJS.Worksheet, caps: Record<number, number> = {}) {
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

async function exportXLSX(record: GiveawayRecord) {
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
        ? buildCommentUrl(record.post_url, winner.comment_id)
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
}

// ── 模板編輯器（textarea + 變數插入按鈕） ────────────────────────────────────

function TemplateEditor({
  value,
  onChange,
  variables,
  hint,
  minHeight = 'min-h-24',
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  variables: { label: string; key: string }[];
  hint?: string;
  minHeight?: string;
  maxLength?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const insert = (key: string) => {
    const el = ref.current;
    const token = `{{${key}}}`;
    if (!el) {
      onChange(value + token);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    onChange(value.substring(0, start) + token + value.substring(end));
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const copyAll = () => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        ref={ref}
        className={`text-body ${minHeight} resize-none font-mono`}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground text-caption shrink-0 select-none">插入：</span>
          {variables.map(({ label, key }) => (
            <Button
              key={key}
              className="text-caption bg-muted hover:bg-accent h-auto rounded px-2 py-0.5 font-mono"
              variant="ghost"
              onClick={() => insert(key)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="shrink-0" size="icon-sm" variant="ghost" onClick={copyAll}>
              {copied ? <ClipboardCheck className="text-success" /> : <Clipboard />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? '已複製' : '複製全文'}</TooltipContent>
        </Tooltip>
      </div>
      {hint && <p className="text-muted-foreground text-caption">{hint}</p>}
    </div>
  );
}

// ── 狀態 icon tooltip（純展示，無互動）────────────────────────────────────────

function StatusIconTooltip({
  icon: Icon,
  iconClassName,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex size-9 cursor-default items-center justify-center">
          <Icon className={cn('h-4 w-4', iconClassName)} />
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

// ── 通知頁中獎者列 ────────────────────────────────────────────────────────────

function WinnerNotifyRow({
  winner,
  pageId,
  giveawayId,
  postUrl,
  selected,
  compact = false,
  onToggle,
  onClearNotification,
  onCopyDm,
  isCopied,
}: {
  winner: GiveawayWinner;
  pageId: string;
  giveawayId: string;
  postUrl?: string;
  selected: boolean;
  /** 精簡模式：隱藏留言文字、badge 改 icon-only、隱藏清除按鈕 */
  compact?: boolean;
  onToggle: () => void;
  onClearNotification: () => Promise<void>;
  onCopyDm: () => void;
  isCopied: boolean;
}) {
  const isAnonymous = isAnonymousUser(winner.from_id);
  const isNotified = !!winner.notified_at;
  const commentUrl =
    postUrl && winner.comment_id ? buildCommentUrl(postUrl, winner.comment_id) : undefined;
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClearing(true);
    try {
      const res = await fetch(
        apiPath(`/api/giveaway/${giveawayId}/notify?winnerId=${winner.id}&pageId=${pageId}`),
        { method: 'DELETE' }
      );
      if (res.ok) {
        await onClearNotification();
      } else {
        const data = await res.json();
        toast.error(data.error || '清除失敗');
      }
    } catch {
      toast.error('清除失敗，請稍後再試');
    } finally {
      setIsClearing(false);
    }
  };

  const isSelectable = !(isNotified || isAnonymous);

  const statusIcon = (
    <StatusIconTooltip
      icon={isAnonymous ? UserRound : isNotified ? CheckCircle2 : BellOff}
      iconClassName={isNotified ? 'text-success' : 'text-muted-foreground'}
      label={isAnonymous ? '待確認身份' : isNotified ? '已通知' : '未通知'}
    />
  );

  return (
    <PersonRow
      actions={
        <>
          {isAnonymous && commentUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild size="icon-sm" variant="ghost">
                  <a href={commentUrl} rel="noopener noreferrer" target="_blank">
                    <ExternalLink />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>前往留言確認身份</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon-sm" variant="ghost" onClick={onCopyDm}>
                {isCopied ? <ClipboardCheck className="text-success" /> : <Clipboard />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isCopied ? '已複製' : '複製私訊'}</TooltipContent>
          </Tooltip>
          {compact ? (
            statusIcon
          ) : (
            <Badge className="shrink-0" variant={isNotified ? 'default' : 'outline'}>
              {isAnonymous ? (
                <span className="flex items-center gap-1">
                  <UserRound className="h-3 w-3" />
                  待確認
                </span>
              ) : isNotified ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  已通知
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <BellOff className="h-3 w-3" />
                  未通知
                </span>
              )}
            </Badge>
          )}
          {!compact && isNotified && !isAnonymous && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={isClearing}
                  size="icon-sm"
                  variant="ghost"
                  onClick={(e) => void handleClear(e)}
                >
                  {isClearing ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Trash2 className="text-destructive" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>清除通知記錄</TooltipContent>
            </Tooltip>
          )}
        </>
      }
      avatar={<FacebookAvatar name={winner.from_name} pageId={pageId} userId={winner.from_id} />}
      className={isSelectable ? 'cursor-pointer' : undefined}
      left={
        <Checkbox
          checked={selected}
          className="pointer-events-none"
          disabled={isNotified || isAnonymous}
          id={`winner-notify-${winner.id}`}
        />
      }
      meta={compact ? undefined : winner.comment_message || undefined}
      name={
        <>
          <span className="text-body font-medium select-none">{winner.from_name}</span>
          {!compact && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs select-none">
              <Gift className="h-3 w-3 shrink-0" />
              {winner.prize.name}
            </span>
          )}
        </>
      }
      variant="interactive"
      onClick={isSelectable ? onToggle : undefined}
    />
  );
}

// ── Tab：通知發送 ─────────────────────────────────────────────────────────────

function NotifyTabContent({
  record,
  pageId,
  onRefresh,
}: {
  record: GiveawayRecord;
  pageId: string;
  onRefresh: () => Promise<void>;
}) {
  const notifiableWinners = useMemo(
    () => record.winners.filter((w) => w.isValid && !w.notified_at && !isAnonymousUser(w.from_id)),
    [record.winners]
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(notifiableWinners.map((w) => w.id))
  );

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const notifiableIds = new Set(notifiableWinners.map((w) => w.id));
    setSelectedIds((prev) => new Set([...prev].filter((id) => notifiableIds.has(id))));
  }, [notifiableWinners]);

  const [replyTemplate, setReplyTemplate] = useState(DEFAULT_REPLY_TEMPLATE);
  const [dmTemplate, setDmTemplate] = useState(DEFAULT_DM_TEMPLATE);
  const [selectedContactFields, setSelectedContactFields] = useState<string[]>(['phone']);
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<{
    successCount: number;
    failCount: number;
  } | null>(null);
  const [copiedWinnerId, setCopiedWinnerId] = useState<string | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    },
    []
  );

  const prizeOrder = useMemo(
    () => Object.fromEntries(record.prizes.map((p) => [p.id, p.sort_order])),
    [record.prizes]
  );
  const allValid = useMemo(
    () =>
      record.winners
        .filter((w) => w.isValid)
        .sort((a, b) => (prizeOrder[a.prize.id] ?? 0) - (prizeOrder[b.prize.id] ?? 0)),
    [record.winners, prizeOrder]
  );

  const toggleWinner = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(
      selectedIds.size === notifiableWinners.length
        ? new Set()
        : new Set(notifiableWinners.map((w) => w.id))
    );
  };

  const toggleContactField = (fieldId: string) => {
    setSelectedContactFields((prev) =>
      prev.includes(fieldId) ? prev.filter((f) => f !== fieldId) : [...prev, fieldId]
    );
  };

  const dmPreviewFor = (winner: GiveawayWinner) =>
    renderTemplate(dmTemplate, {
      winnerName: winner.from_name,
      prizeName: winner.prize.name,
      activityName: record.name || '（未命名活動）',
      postLink: record.post_url || '（無貼文連結）',
      contactFields: buildContactFields(selectedContactFields),
    });

  const handleCopyDm = (winner: GiveawayWinner) => {
    void navigator.clipboard.writeText(dmPreviewFor(winner)).then(() => {
      setCopiedWinnerId(winner.id);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopiedWinnerId(null), 2000);
    });
  };

  const handleSendReply = async () => {
    if (selectedIds.size === 0) {
      toast.warning('請選擇至少一位中獎者');
      return;
    }
    setIsSending(true);
    setSendResults(null);
    try {
      const res = await fetch(apiPath(`/api/giveaway/${record.id}/notify`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          winnerIds: Array.from(selectedIds),
          template: replyTemplate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || '發送失敗');
        return;
      }
      const { successCount, failCount } = data.data;
      setSendResults({ successCount, failCount });
      if (failCount === 0) toast.success(`成功通知 ${successCount} 位中獎者`);
      else toast.warning(`${successCount} 位成功，${failCount} 位失敗`);
      setSelectedIds(new Set());
      await onRefresh();
    } catch {
      toast.error('發送失敗，請稍後再試');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 lg:items-start">
      {/* ══ 左欄：設定區 ══ */}
      <div className="flex min-w-0 flex-col gap-5">
        {/* ── 自動回覆 ── */}
        <div className="flex flex-col gap-3">
          <div className="select-none">
            <div className="flex items-center gap-1.5">
              <Bell className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="text-body font-medium">留言自動回覆</span>
            </div>
            <p className="text-muted-foreground text-caption mt-0.5 pl-5.5">
              系統在原留言下方回覆，@mention 自動加於開頭
            </p>
          </div>
          <TemplateEditor
            maxLength={500}
            minHeight="min-h-[88px]"
            value={replyTemplate}
            variables={[
              { label: '得獎者姓名', key: 'winnerName' },
              { label: '獎項名稱', key: 'prizeName' },
            ]}
            onChange={setReplyTemplate}
          />
          {sendResults && (
            <div className="flex items-center gap-3 rounded-lg border px-3 py-2 select-none">
              {sendResults.successCount > 0 && (
                <span className="text-success flex items-center gap-1 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  {sendResults.successCount} 則成功
                </span>
              )}
              {sendResults.failCount > 0 && (
                <span className="text-destructive flex items-center gap-1 text-sm">
                  <XCircle className="h-4 w-4" />
                  {sendResults.failCount} 則失敗
                </span>
              )}
            </div>
          )}
          <Button
            className="w-full"
            disabled={isSending || selectedIds.size === 0}
            onClick={() => void handleSendReply()}
          >
            {isSending ? <Loader2 className="animate-spin" /> : <Send />}
            {isSending ? '發送中...' : `發送回覆（${selectedIds.size} 位）`}
          </Button>
        </div>

        <Separator />

        {/* ── 私訊草稿 ── */}
        <div className="flex flex-col gap-3">
          <div className="select-none">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="text-body font-medium">私訊草稿</span>
            </div>
            <p className="text-muted-foreground text-caption mt-0.5 pl-5.5">
              手動複製後逐一傳送給得獎者
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <span className="text-muted-foreground text-caption w-full select-none">
              領獎需提供的聯絡資訊
            </span>
            {CONTACT_FIELD_OPTIONS.map((field) => (
              <Label
                key={field.id}
                className="flex cursor-pointer items-center gap-2 font-normal select-none"
                htmlFor={`field-${record.id}-${field.id}`}
              >
                <Checkbox
                  checked={selectedContactFields.includes(field.id)}
                  id={`field-${record.id}-${field.id}`}
                  onCheckedChange={() => toggleContactField(field.id)}
                />
                {field.label}
              </Label>
            ))}
          </div>
          <TemplateEditor
            minHeight="min-h-[112px]"
            value={dmTemplate}
            variables={[
              { label: '得獎者姓名', key: 'winnerName' },
              { label: '獎項名稱', key: 'prizeName' },
              { label: '活動名稱', key: 'activityName' },
              { label: '原貼文連結', key: 'postLink' },
              { label: '聯絡資訊欄位', key: 'contactFields' },
            ]}
            onChange={setDmTemplate}
          />
        </div>
      </div>

      {/* ══ 右欄：中獎者名單 ══ */}
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-body font-medium">中獎者</span>
            <span className="text-muted-foreground text-caption">{allValid.length} 位</span>
          </div>
          {notifiableWinners.length > 0 && (
            <Button size="sm" variant="ghost" onClick={toggleAll}>
              {selectedIds.size === notifiableWinners.length ? '取消全選' : '全選'}
            </Button>
          )}
        </div>
        <div className="bg-muted/40 flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto rounded-lg p-2">
          {allValid.length === 0 ? (
            <p className="text-muted-foreground text-caption py-6 text-center">此活動尚無中獎者</p>
          ) : (
            record.prizes.map((prize) => {
              const prizeWinners = allValid.filter((w) => w.prize.id === prize.id);
              if (prizeWinners.length === 0) return null;
              return (
                <div key={prize.id} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 select-none">
                    <Trophy className="text-primary h-3 w-3 shrink-0" />
                    <span className="text-caption truncate font-medium">{prize.name}</span>
                    <Badge className="shrink-0" variant="secondary">
                      {prizeWinners.length} 名
                    </Badge>
                  </div>
                  {prizeWinners.map((winner) => (
                    <WinnerNotifyRow
                      key={winner.id}
                      compact
                      giveawayId={record.id}
                      isCopied={copiedWinnerId === winner.id}
                      pageId={pageId}
                      postUrl={record.post_url}
                      selected={selectedIds.has(winner.id)}
                      winner={winner}
                      onClearNotification={onRefresh}
                      onCopyDm={() => handleCopyDm(winner)}
                      onToggle={() => toggleWinner(winner.id)}
                    />
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab：中獎名單 ─────────────────────────────────────────────────────────────

function WinnersTabContent({ record }: { record: GiveawayRecord }) {
  const winnerGroups = record.prizes.map((prize) => ({
    prize,
    winners: record.winners.filter((w) => w.prize.id === prize.id),
  }));

  return (
    <div className="flex flex-col gap-3">
      {winnerGroups.map(({ prize, winners }) => (
        <div key={prize.id}>
          <h4 className="text-body mb-2 flex items-center gap-2 font-medium select-none">
            <Trophy className="text-primary h-4 w-4" />
            {prize.name}
            <span className="text-muted-foreground font-normal">
              ({winners.length}/{prize.quantity} 名)
            </span>
          </h4>

          {winners.length === 0 ? (
            <p className="text-muted-foreground text-caption py-2 text-center">無中獎者</p>
          ) : (
            <div className="flex flex-col gap-2">
              {winners.map((winner) => (
                <PersonRow
                  key={winner.id}
                  actions={
                    <>
                      {winner.comment_created_time && (
                        <span className="text-muted-foreground text-caption select-none">
                          {format(new Date(winner.comment_created_time), 'MM/dd HH:mm')}
                        </span>
                      )}
                      {record.post_url && winner.comment_id && (
                        <CommentLink commentId={winner.comment_id} postUrl={record.post_url} />
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
                  name={<p className="text-body font-medium select-none">{winner.from_name}</p>}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── 活動卡片（含兩個 tab） ────────────────────────────────────────────────────

function GiveawayRecordCard({
  record,
  pageId,
  defaultOpen,
  defaultTab,
  onDelete,
  onRefresh,
}: {
  record: GiveawayRecord;
  pageId: string;
  defaultOpen: boolean;
  defaultTab: 'winners' | 'notify';
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<'winners' | 'notify'>(defaultTab);
  const [isDeleting, setIsDeleting] = useState(false);

  const validWinners = record.winners.filter((w) => w.isValid);
  const notifiedCount = validWinners.filter((w) => w.notified_at).length;

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(record.id);
    setIsDeleting(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="gap-0 overflow-hidden py-0">
        <GiveawayRecordHeader
          actions={
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon-sm" variant="ghost" onClick={() => void exportXLSX(record)}>
                    <Download />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>匯出 Excel</TooltipContent>
              </Tooltip>
              {record.post_url && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild size="icon-sm" variant="ghost">
                      <a href={record.post_url} rel="noopener noreferrer" target="_blank">
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
                    <AlertDialogAction disabled={isDeleting} onClick={() => void handleDelete()}>
                      {isDeleting && <Loader2 className="animate-spin" />}
                      刪除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          }
          badges={
            <>
              <Badge variant="secondary">{record.status === 'COMPLETED' ? '已完成' : '草稿'}</Badge>
              <NotificationStatusBadge
                notifiedCount={notifiedCount}
                totalCount={validWinners.length}
              />
            </>
          }
          isOpen={isOpen}
          record={record}
        />

        <CollapsibleContent>
          <Separator />
          <div className="px-4 pt-3 pb-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'winners' | 'notify')}>
              <TabsList className="mb-4">
                <TabsTrigger value="winners">
                  <Trophy data-icon="inline-start" />
                  中獎名單
                </TabsTrigger>
                <TabsTrigger value="notify">
                  <Bell data-icon="inline-start" />
                  通知發送
                </TabsTrigger>
              </TabsList>

              <TabsContent value="winners">
                <WinnersTabContent record={record} />
              </TabsContent>

              <TabsContent value="notify">
                <NotifyTabContent pageId={pageId} record={record} onRefresh={onRefresh} />
              </TabsContent>
            </Tabs>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ── 主頁面 ────────────────────────────────────────────────────────────────────

export default function FacebookWinnersPage() {
  const { activePage } = useFacebookPage();
  const { records, isLoading, refresh, deleteRecord } = useGiveawayHistory();
  const searchParams = useSearchParams();

  const targetId = searchParams.get('giveawayId');
  const targetTab = searchParams.get('tab') === 'notify' ? 'notify' : 'winners';

  const handleDelete = async (id: string) => {
    const success = await deleteRecord(id);
    if (success) toast.success('已刪除抽獎紀錄');
    else toast.error('刪除失敗');
  };

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
            {records.map((record, index) => (
              <GiveawayRecordCard
                key={record.id}
                defaultOpen={targetId ? record.id === targetId : index === 0}
                defaultTab={record.id === targetId ? targetTab : 'winners'}
                pageId={activePage?.id ?? ''}
                record={record}
                onDelete={handleDelete}
                onRefresh={refresh}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
