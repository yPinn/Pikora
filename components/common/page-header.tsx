'use client';

import { usePathname } from 'next/navigation';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

function formatSegment(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function PageHeader() {
  const pathname = usePathname();

  const segments = pathname.split('/').filter((seg) => seg && !seg.startsWith('('));

  const lastSegment = segments[segments.length - 1] || '';

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator className="mr-2 data-[orientation=vertical]:h-4" orientation="vertical" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{formatSegment(lastSegment)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
