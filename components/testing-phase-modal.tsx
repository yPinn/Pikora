'use client';

import { useState } from 'react';

import { AlertCircleIcon, ExternalLinkIcon, FlaskConicalIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STORAGE_KEY = 'pikora_testing_notice_dismissed';

export function TestingPhaseModal() {
  const [open, setOpen] = useState(
    () => typeof window !== 'undefined' && !sessionStorage.getItem(STORAGE_KEY)
  );

  function handleDismiss() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleDismiss();
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <FlaskConicalIcon className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-base">測試階段使用須知</DialogTitle>
          </div>
          <DialogDescription className="sr-only">測試階段授權說明</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-900/20">
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="leading-relaxed text-amber-800 dark:text-amber-300">
              目前此應用程式處於<strong>測試階段</strong>，僅限已獲授權的測試人員使用。
            </p>
          </div>

          <div className="text-muted-foreground space-y-2 leading-relaxed">
            <p>若您無法正常使用功能，請確認您已完成以下步驟：</p>
            <ol className="list-inside list-decimal space-y-1.5 pl-1">
              <li>前往 Meta 帳號設定的「應用程式和網站」</li>
              <li>在測試人員邀請中確認授權本應用程式</li>
              <li>重新登入以套用權限</li>
            </ol>
          </div>

          <a
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline dark:text-blue-400"
            href="https://www.facebook.com/settings?tab=applications"
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLinkIcon className="size-3" />
            前往 Meta 應用程式和網站設定
          </a>
        </div>

        <DialogFooter>
          <Button className="w-full sm:w-auto" onClick={handleDismiss}>
            我已了解，繼續使用
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
