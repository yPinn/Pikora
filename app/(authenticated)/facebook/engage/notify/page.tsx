'use client';

import { useEffect, useMemo, useState, useRef } from 'react';

import {
  Bell,
  BellOff,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  ExternalLink,
  Gift,
  Loader2,
  MessageSquare,
  Send,
  Trash2,
  UserRound,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { EmptyCard } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { PageTitleBar } from '@/components/common/page-title-bar';
import { PersonRow } from '@/components/common/person-row';
import { FacebookAvatar } from '@/components/facebook/giveaway/facebook-avatar';
import { GiveawayRecordHeader } from '@/components/facebook/giveaway/giveaway-record-header';
import { NotificationStatusBadge } from '@/components/facebook/giveaway/notification-status-badge';
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
import { apiPath } from '@/lib/utils';
import { isAnonymousUser } from '@/lib/utils/facebook';

// ── 預設模板 ─────────────────────────────────────────────────────────────────

const DEFAULT_REPLY_TEMPLATE = `恭喜您中獎！請私訊本粉絲專頁以完成後續領獎流程。`;

const DEFAULT_DM_TEMPLATE = `您好，恭喜您獲得【{{prizeName}}】！

活動：{{activityName}}
原貼文：{{postLink}}

請提供以下資訊以完成領獎：
{{contactFields}}

請於 7 天內回覆，逾期視同放棄。`;

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

// ── 子元件：中獎者列 ──────────────────────────────────────────────────────────

function WinnerRow({
  winner,
  pageId,
  giveawayId,
  postUrl,
  mode,
  selected,
  onToggle,
  onClearNotification,
  onCopyDm,
  isCopied,
}: {
  winner: GiveawayWinner;
  pageId: string;
  giveawayId: string;
  postUrl?: string;
  /** reply = 留言回覆（有 checkbox）, dm = 私訊模板（有複製按鈕，無 checkbox） */
  mode: 'reply' | 'dm';
  selected: boolean;
  onToggle: () => void;
  onClearNotification: () => Promise<void>;
  onCopyDm: () => void;
  isCopied: boolean;
}) {
  const isAnonymous = isAnonymousUser(winner.from_id);
  const isNotified = !!winner.notified_at;
  const commentUrl =
    postUrl && winner.comment_id ? `${postUrl}?comment_id=${winner.comment_id}` : undefined;
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

  return (
    <PersonRow
      actions={
        <>
          {isAnonymous && commentUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild size="icon-sm" variant="ghost">
                  <a href={commentUrl} rel="noopener noreferrer" target="_blank">
                    <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>前往留言確認身份</TooltipContent>
            </Tooltip>
          )}
          {mode === 'dm' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon-sm" variant="ghost" onClick={onCopyDm}>
                  {isCopied ? (
                    <ClipboardCheck className="text-success size-3.5" />
                  ) : (
                    <Clipboard className="size-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isCopied ? '已複製' : '複製私訊'}</TooltipContent>
            </Tooltip>
          )}
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
          {isNotified && !isAnonymous && mode === 'reply' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={isClearing}
                  size="icon-sm"
                  variant="ghost"
                  onClick={(e) => void handleClear(e)}
                >
                  {isClearing ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="text-destructive size-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>清除通知記錄</TooltipContent>
            </Tooltip>
          )}
        </>
      }
      avatar={<FacebookAvatar name={winner.from_name} pageId={pageId} userId={winner.from_id} />}
      left={
        mode === 'reply' ? (
          <Checkbox
            checked={selected}
            disabled={isNotified || isAnonymous}
            id={`winner-${winner.id}`}
            onCheckedChange={onToggle}
          />
        ) : undefined
      }
      meta={winner.comment_message || undefined}
      name={
        <>
          <Label
            className={
              mode === 'reply' && !isAnonymous ? 'cursor-pointer font-medium' : 'font-medium'
            }
            htmlFor={mode === 'reply' ? `winner-${winner.id}` : undefined}
          >
            {winner.from_name}
          </Label>
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Gift className="h-3 w-3 shrink-0" />
            {winner.prize.name}
          </span>
        </>
      }
      variant="interactive"
    />
  );
}

// ── 子元件：活動通知面板 ──────────────────────────────────────────────────────

function GiveawayNotifyPanel({
  record,
  pageId,
  defaultOpen,
  onRefresh,
}: {
  record: GiveawayRecord;
  pageId: string;
  defaultOpen: boolean;
  onRefresh: () => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<'reply' | 'dm'>('reply');

  const notifiableWinners = useMemo(
    () => record.winners.filter((w) => w.isValid && !w.notified_at && !isAnonymousUser(w.from_id)),
    [record.winners]
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(notifiableWinners.map((w) => w.id))
  );
  // 當 notifiableWinners 更新（例如通知後 refresh）時，移除已不再可通知的 id
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
  const [isReplyTemplateCopied, setIsReplyTemplateCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTemplateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      if (replyTemplateTimerRef.current) clearTimeout(replyTemplateTimerRef.current);
    };
  }, []);

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

  const notifiedCount = allValid.filter((w) => w.notified_at).length;
  const totalCount = allValid.length;

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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <GiveawayRecordHeader
          actions={
            record.post_url ? (
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
            ) : undefined
          }
          badges={<NotificationStatusBadge notifiedCount={notifiedCount} totalCount={totalCount} />}
          isOpen={isOpen}
          record={record}
          winnerCount={totalCount}
        />

        <CollapsibleContent>
          <Separator />
          <div className="flex flex-col gap-4 px-4 pt-4 pb-4">
            {/* ── Tabs：模板設定 ── */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'reply' | 'dm')}>
              <TabsList>
                <TabsTrigger value="reply">
                  <Bell className="size-3.5" />
                  留言回覆通知
                </TabsTrigger>
                <TabsTrigger value="dm">
                  <MessageSquare className="size-3.5" />
                  私訊模板
                </TabsTrigger>
              </TabsList>

              {/* Tab 1：留言回覆 */}
              <TabsContent className="mt-4 flex flex-col gap-3" value="reply">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label>回覆訊息模板</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => {
                            void navigator.clipboard.writeText(replyTemplate).then(() => {
                              setIsReplyTemplateCopied(true);
                              if (replyTemplateTimerRef.current)
                                clearTimeout(replyTemplateTimerRef.current);
                              replyTemplateTimerRef.current = setTimeout(
                                () => setIsReplyTemplateCopied(false),
                                2000
                              );
                            });
                          }}
                        >
                          {isReplyTemplateCopied ? (
                            <ClipboardCheck className="text-success size-3.5" />
                          ) : (
                            <Clipboard className="size-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isReplyTemplateCopied ? '已複製' : '複製模板'}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    className="text-body min-h-24 resize-none font-mono"
                    maxLength={500}
                    value={replyTemplate}
                    onChange={(e) => setReplyTemplate(e.target.value)}
                  />
                  <p className="text-muted-foreground text-caption">
                    @mention 自動加於開頭。可使用變數：
                    <code className="bg-muted rounded px-1">{'{{prizeName}}'}</code>
                  </p>
                </div>
                {sendResults && (
                  <div className="rounded-lg border px-3 py-2">
                    <div className="flex items-center gap-3">
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
                  </div>
                )}
                <Button
                  disabled={isSending || selectedIds.size === 0}
                  onClick={() => void handleSendReply()}
                >
                  {isSending ? <Loader2 className="animate-spin" /> : <Send />}
                  {isSending ? '發送中...' : `發送留言回覆（${selectedIds.size} 位）`}
                </Button>
              </TabsContent>

              {/* Tab 2：私訊模板 */}
              <TabsContent className="mt-4 flex flex-col gap-3" value="dm">
                <div className="flex flex-col gap-2">
                  <Label>要求提供的聯絡資訊</Label>
                  <div className="flex flex-wrap gap-4">
                    {CONTACT_FIELD_OPTIONS.map((field) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedContactFields.includes(field.id)}
                          id={`field-${record.id}-${field.id}`}
                          onCheckedChange={() => toggleContactField(field.id)}
                        />
                        <Label
                          className="cursor-pointer font-normal"
                          htmlFor={`field-${record.id}-${field.id}`}
                        >
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>私訊模板</Label>
                  <Textarea
                    className="text-body min-h-32 resize-none font-mono"
                    value={dmTemplate}
                    onChange={(e) => setDmTemplate(e.target.value)}
                  />
                  <p className="text-muted-foreground text-caption">
                    變數：
                    <code className="bg-muted rounded px-1">{'{{prizeName}}'}</code>、
                    <code className="bg-muted rounded px-1">{'{{activityName}}'}</code>、
                    <code className="bg-muted rounded px-1">{'{{postLink}}'}</code>、
                    <code className="bg-muted rounded px-1">{'{{contactFields}}'}</code>
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* ── 中獎者名單 ── */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>中獎者名單</Label>
                {activeTab === 'reply' && notifiableWinners.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={toggleAll}>
                    {selectedIds.size === notifiableWinners.length ? '取消全選' : '全選未通知'}
                  </Button>
                )}
              </div>
              {allValid.length === 0 ? (
                <p className="text-muted-foreground text-caption py-3 text-center">
                  此活動尚無中獎者
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {allValid.map((winner) => (
                    <WinnerRow
                      key={winner.id}
                      giveawayId={record.id}
                      isCopied={copiedWinnerId === winner.id}
                      mode={activeTab}
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
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ── 主頁面 ────────────────────────────────────────────────────────────────────

export default function FacebookNotifyPage({
  searchParams,
}: {
  searchParams: Promise<{ giveawayId?: string }>;
}) {
  const { activePage } = useFacebookPage();
  const { records, isLoading, refresh } = useGiveawayHistory();
  const [resolvedParams, setResolvedParams] = useState<{ giveawayId?: string }>({});

  useEffect(() => {
    void searchParams.then(setResolvedParams);
  }, [searchParams]);

  const targetId = resolvedParams.giveawayId;

  const displayRecords = useMemo(() => {
    if (targetId) return records.filter((r) => r.id === targetId);
    return records;
  }, [records, targetId]);

  return (
    <>
      <PageHeader />
      <div className="gap-page p-page flex flex-1 flex-col pt-0">
        <PageTitleBar isLoading={isLoading} title="通知發送" onRefresh={refresh} />

        {isLoading && displayRecords.length === 0 ? (
          <EmptyCard
            icon={Loader2}
            iconClassName="h-8 w-8 animate-spin opacity-100"
            title="載入中..."
          />
        ) : displayRecords.length === 0 ? (
          <EmptyCard
            description="前往「抽獎活動」進行抽獎並儲存結果"
            icon={Bell}
            title="尚無抽獎紀錄"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {displayRecords.map((record, index) => (
              <GiveawayNotifyPanel
                key={record.id}
                defaultOpen={index === 0}
                pageId={activePage?.id ?? ''}
                record={record}
                onRefresh={refresh}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
