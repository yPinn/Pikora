import {
  AudioWaveform,
  BarChart3,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
  Users,
} from 'lucide-react';

import type { SidebarConfig } from './types';

export const facebookConfig: SidebarConfig = {
  user: {
    name: '小桃寶寶',
    email: 'm@example.com',
    avatar: '/Momonga_2.jpg',
  },
  pages: [
    {
      name: '粉絲專頁A',
      logo: GalleryVerticalEnd,
      role: '管理者',
    },
    {
      name: '粉絲專頁B',
      logo: AudioWaveform,
      role: '擁有者',
    },
    {
      name: '粉絲專頁C',
      logo: Command,
      role: '編輯者',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '/facebook/dashboard',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: '總覽',
          url: '/facebook/dashboard',
        },
        {
          title: '近期活動',
          url: '/facebook/dashboard/recent',
        },
        {
          title: '統計數據',
          url: '/facebook/dashboard/stats',
        },
      ],
    },
    {
      title: '貼文管理',
      url: '/facebook/posts',
      icon: Bot,
      items: [
        {
          title: '所有貼文',
          url: '/facebook/posts',
        },
        {
          title: '草稿',
          url: '/facebook/posts/drafts',
        },
        {
          title: '已排程',
          url: '/facebook/posts/scheduled',
        },
      ],
    },
    {
      title: '抽獎活動',
      url: '/facebook/lottery',
      icon: BookOpen,
      items: [
        {
          title: '建立抽獎',
          url: '/facebook/lottery/create',
        },
        {
          title: '進行中',
          url: '/facebook/lottery/active',
        },
        {
          title: '歷史記錄',
          url: '/facebook/lottery/history',
        },
        {
          title: '得獎名單',
          url: '/facebook/lottery/winners',
        },
      ],
    },
    {
      title: '設定',
      url: '/facebook/settings',
      icon: Settings2,
      items: [
        {
          title: '一般設定',
          url: '/facebook/settings/general',
        },
        {
          title: '連結管理',
          url: '/facebook/settings/connections',
        },
        {
          title: '通知',
          url: '/facebook/settings/notifications',
        },
        {
          title: '帳號設定',
          url: '/facebook/settings/account',
        },
      ],
    },
  ],
  projects: [
    {
      name: '粉絲專頁',
      url: '/facebook/pages',
      icon: Frame,
    },
    {
      name: '數據分析',
      url: '/facebook/analytics',
      icon: BarChart3,
    },
    {
      name: '使用者管理',
      url: '/facebook/users',
      icon: Users,
    },
  ],
};
