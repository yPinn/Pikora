import { facebookConfig } from './facebook';

import type { Platform, SidebarConfig } from './types';

export type { Platform, SidebarConfig } from './types';

const configs: Record<Platform, SidebarConfig> = {
  facebook: facebookConfig,
  // 未來新增其他平台
  instagram: facebookConfig, // 暫時使用 facebook config
  threads: facebookConfig, // 暫時使用 facebook config
};

/**
 * 根據平台名稱取得 sidebar 配置
 */
export function getSidebarConfig(platform: Platform): SidebarConfig {
  return configs[platform];
}

/**
 * 從路徑中提取平台名稱
 * @param pathname - 當前路徑，例如 "/facebook/dashboard"
 * @returns 平台名稱或 null
 */
export function getPlatformFromPath(pathname: string): Platform | null {
  const match = pathname.match(/^\/(facebook|instagram|threads)/);
  return match ? (match[1] as Platform) : null;
}
