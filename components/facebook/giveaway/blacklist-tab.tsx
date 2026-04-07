'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Trash2, UserX } from 'lucide-react';
import { toast } from 'sonner';

import { PersonRow } from '@/components/common/person-row';
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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { BlacklistEntry } from '@/lib/giveaway';

import { CardSectionHeader } from './card-section-header';

interface BlacklistTabProps {
  blacklist: BlacklistEntry[];
  onRemoveFromBlacklist: (fromId: string) => Promise<void>;
}

export function BlacklistTab({ blacklist, onRemoveFromBlacklist }: BlacklistTabProps) {
  const [blacklistRef] = useAutoAnimate<HTMLDivElement>();

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-col gap-0.5">
        <CardSectionHeader icon={UserX} title="黑名單管理" />
        <p className="text-muted-foreground text-caption pl-6">
          黑名單內的用戶將不會出現在抽獎池中
        </p>
      </div>

      {blacklist.length === 0 ? (
        <p className="text-muted-foreground text-body py-8 text-center">尚無黑名單</p>
      ) : (
        <div ref={blacklistRef} className="flex flex-col gap-2">
          {blacklist.map((entry) => (
            <PersonRow
              key={entry.from_id}
              actions={
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="h-7 shrink-0" size="sm" variant="ghost">
                      <Trash2 className="size-3" />
                      移除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>確認移除黑名單？</AlertDialogTitle>
                      <AlertDialogDescription>
                        將 <strong>{entry.from_name || entry.from_id}</strong>{' '}
                        從黑名單移除後，此用戶將重新出現在抽獎池中。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          await onRemoveFromBlacklist(entry.from_id);
                          toast.success(`已將 ${entry.from_name || entry.from_id} 從黑名單移除`);
                        }}
                      >
                        確認移除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              }
              meta={entry.reason || undefined}
              name={<p className="font-medium">{entry.from_name || entry.from_id}</p>}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
