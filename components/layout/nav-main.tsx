'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ChevronRight, type LucideIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavMainItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavSubItem[];
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Console</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isGroupActive = item.items?.some((sub) => pathname === sub.url);

          if (hasSubItems) {
            return (
              <Collapsible
                key={item.title}
                asChild
                className="group/collapsible"
                defaultOpen={item.isActive || isGroupActive}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          const isActive = item.url ? pathname === item.url : false;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild={!!item.url} isActive={isActive} tooltip={item.title}>
                {item.url ? (
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
