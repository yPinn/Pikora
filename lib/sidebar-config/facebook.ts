import { BarChart3, Frame, Gift, Layers, Trophy, Users } from 'lucide-react';

import type { NavMainItem, NavProject } from './types';

/**
 * Facebook 平台的靜態導航配置
 * 動態資料（用戶、粉絲專頁）由 FacebookSidebar 組件從 API 取得
 */
export const facebookNavConfig: {
  navMain: NavMainItem[];
  projects: NavProject[];
} = {
  navMain: [
    {
      title: '內容管理',
      icon: Layers, // 代表貼文與數據層
      isActive: true,
      items: [
        { title: '貼文瀏覽', url: '/facebook/dashboard' }, // 瀏覽粉專貼文
        { title: '留言撈取', url: '/facebook/fetch' }, // 內容與反應抓取
      ],
    },
    {
      title: '抽獎引擎',
      icon: Trophy, // 核心抽獎功能
      items: [
        { title: '活動配置', url: '/giveaway/setup' }, // 獎項與篩選規則
        { title: '獎池驗證', url: '/giveaway/validator' }, // 資格預審
        { title: '開獎排程', url: '/giveaway/scheduler' }, // 時間預約
        { title: '開獎實境', url: '/giveaway/live' }, // 過程動畫與核對
      ],
    },
    {
      title: '中獎管理',
      icon: Gift, // 售後 CRM
      items: [
        { title: '得獎名單', url: '/winners/results' }, // 結果與歷史
        { title: '中獎通知', url: '/winners/notify' }, // 通知與圖卡生成
        { title: '私訊追蹤', url: '/winners/tracking' }, // CRM 狀態管理
      ],
    },
    {
      title: '數據分析',
      icon: BarChart3, // 成效回饋
      items: [
        { title: '成效報告', url: '/insights/report' },
        { title: '粉絲洞察', url: '/insights/audience' },
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
