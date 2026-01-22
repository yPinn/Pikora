'use client';

import * as React from 'react';

import Image from 'next/image';

import { ChevronsUpDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useFacebookPage } from '@/contexts/facebook-page-store';
import type { FacebookPage } from '@/lib/services/facebook';

// 權限對應表：用於顯示與排序權重
const ROLES: Record<string, { label: string; weight: number }> = {
  MANAGE: { label: '管理員', weight: 10 },
  CREATE_CONTENT: { label: '編輯者', weight: 5 },
  MODERATE: { label: '版主', weight: 4 },
  ADVERTISE: { label: '廣告主', weight: 3 },
  ANALYZE: { label: '分析師', weight: 2 },
};

export function PageSwitcher() {
  const { isMobile } = useSidebar();
  const { activePage, setActivePage, pages } = useFacebookPage();

  // 取得最高權限職稱
  const getTopRole = (tasks: string[] = []) => {
    const roleKey = Object.keys(ROLES).find((key) => tasks.includes(key));
    return roleKey ? ROLES[roleKey].label : '成員';
  };

  // 排序：依權限權重 > 字母順序
  const sortedPages = React.useMemo(
    () =>
      [...pages].sort((a, b) => {
        const getWeight = (p: FacebookPage) =>
          Math.max(...(p.tasks?.map((t) => ROLES[t]?.weight || 0) || [0]));
        return getWeight(b) - getWeight(a) || a.name.localeCompare(b.name, 'zh-Hant');
      }),
    [pages]
  );

  // 快捷鍵 (Cmd/Ctrl + 1~9)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const target = sortedPages[parseInt(e.key) - 1];
        if (target) setActivePage(target);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [sortedPages, setActivePage]);

  if (!activePage)
    return <div className="bg-sidebar-accent/50 h-12 w-full animate-pulse rounded-lg" />;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent" size="lg">
              <div className="bg-background relative size-8 shrink-0 overflow-hidden rounded-lg border">
                {activePage.picture?.data?.url && (
                  <Image
                    fill
                    priority
                    alt={activePage.name}
                    className="object-cover"
                    sizes="32px"
                    src={activePage.picture.data.url}
                  />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activePage.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {getTopRole(activePage.tasks)}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              粉絲專頁
            </DropdownMenuLabel>
            {sortedPages.map((page, i) => (
              <DropdownMenuItem
                key={page.id}
                className="cursor-pointer gap-2 p-2"
                onClick={() => setActivePage(page)}
              >
                <div className="bg-background relative size-6 shrink-0 overflow-hidden rounded border">
                  {page.picture?.data?.url && (
                    <Image
                      fill
                      alt={page.name}
                      className="object-cover"
                      sizes="24px"
                      src={page.picture.data.url}
                    />
                  )}
                </div>
                <span
                  className={`flex-1 truncate ${activePage.id === page.id ? 'text-primary font-bold' : ''}`}
                >
                  {page.name}
                </span>
                {i < 9 && <DropdownMenuShortcut>⌘{i + 1}</DropdownMenuShortcut>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
