import { BarChart3, HelpCircle, Layers, Trophy } from 'lucide-react';

import type { NavMainItem } from './types';

/**
 * Facebook 平台的導航配置
 * 路由結構: /facebook/{category}/{feature}
 */
export const facebookNavConfig: {
  navMain: NavMainItem[];
} = {
  navMain: [
    {
      title: 'Content',
      icon: Layers,
      isActive: true,
      items: [
        { title: '貼文管理', url: '/facebook/content/posts' },
        { title: '留言管理', url: '/facebook/content/comments' },
      ],
    },
    {
      title: 'Engage',
      icon: Trophy,
      items: [
        { title: '抽獎活動', url: '/facebook/engage/giveaway' },
        { title: '中獎名單', url: '/facebook/engage/winners' },
        { title: '通知發送', url: '/facebook/engage/notify' },
      ],
    },
    {
      title: 'Insights',
      icon: BarChart3,
      items: [
        { title: '總覽報告', url: '/facebook/insights/overview' },
        { title: '粉絲洞察', url: '/facebook/insights/audience' },
      ],
    },
    {
      title: 'Help',
      icon: HelpCircle,
      items: [
        { title: '系統介紹', url: '/facebook/help/info' },
        { title: '使用指南', url: '/facebook/help/guide' },
        { title: '常見問題', url: '/facebook/help/faq' },
      ],
    },
  ],
};
