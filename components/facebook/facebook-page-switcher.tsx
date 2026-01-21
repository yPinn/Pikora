'use client';

import * as React from 'react';

import { ChevronsUpDown } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import type { FacebookPage } from '@/lib/services/facebook';

interface FacebookPageSwitcherProps {
  pages: FacebookPage[];
}

/**
 * 將 Facebook tasks 轉換為中文角色名稱
 */
function getPageRole(tasks?: string[]): string {
  if (!tasks || tasks.length === 0) return '成員';

  // tasks 包含: ADVERTISE, ANALYZE, CREATE_CONTENT, MODERATE, MANAGE
  if (tasks.includes('MANAGE')) return '管理員';
  if (tasks.includes('CREATE_CONTENT')) return '編輯者';
  if (tasks.includes('MODERATE')) return '版主';
  if (tasks.includes('ADVERTISE')) return '廣告主';
  if (tasks.includes('ANALYZE')) return '分析師';

  return '成員';
}

export function FacebookPageSwitcher({ pages }: FacebookPageSwitcherProps) {
  const { isMobile } = useSidebar();
  // 初始值設為第一個 page（Server 已取得資料）
  const [activePage, setActivePage] = React.useState<FacebookPage | null>(
    pages.length > 0 ? pages[0] : null
  );

  if (pages.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled size="lg">
            <div className="bg-muted flex aspect-square size-8 items-center justify-center rounded-lg">
              <span className="text-xs">?</span>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">無粉絲專頁</span>
              <span className="text-muted-foreground truncate text-xs">請先建立粉絲專頁</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!activePage) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage alt={activePage.name} src={activePage.picture?.data?.url} />
                <AvatarFallback className="rounded-lg">{activePage.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activePage.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {getPageRole(activePage.tasks)}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              粉絲專頁
            </DropdownMenuLabel>
            {pages.map((page, index) => (
              <DropdownMenuItem
                key={page.id}
                className="gap-2 p-2"
                onClick={() => setActivePage(page)}
              >
                <Avatar className="size-6">
                  <AvatarImage alt={page.name} src={page.picture?.data?.url} />
                  <AvatarFallback className="text-xs">{page.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">{page.name}</span>
                {index < 9 && <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
