'use client';

import { useState } from 'react';

import { ExternalLinkIcon, FlaskConicalIcon } from 'lucide-react';

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
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <FlaskConicalIcon className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-heading font-semibold wrap-break-word">
                測試階段限定
              </DialogTitle>
              <p className="text-caption text-muted-foreground">Beta access required</p>
            </div>
          </div>
          <DialogDescription className="sr-only">測試階段授權說明</DialogDescription>
        </DialogHeader>

        <p className="text-body text-muted-foreground leading-relaxed wrap-break-word">
          此應用程式目前僅限已獲 <strong className="text-foreground font-medium">Meta 授權</strong>
          的測試人員登入使用。若登入失敗，請確認您已接受測試邀請。
        </p>

        <a
          className="text-caption text-primary inline-flex items-center gap-1.5 hover:underline"
          href="https://www.facebook.com/settings?tab=applications"
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLinkIcon className="size-3" />
          前往 Meta 應用程式設定
        </a>

        <DialogFooter>
          <Button className="w-full" onClick={handleDismiss}>
            了解
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
