export type { NavMainItem, NavProject, Platform } from './types';

// 各平台導航配置
export { facebookNavConfig } from './facebook';

/**
 * 從路徑中提取平台名稱
 * @param pathname - 當前路徑，例如 "/facebook/dashboard"
 * @returns 平台名稱或 null
 */
export function getPlatformFromPath(pathname: string): 'facebook' | 'instagram' | 'threads' | null {
  const match = pathname.match(/^\/(facebook|instagram|threads)/);
  return match ? (match[1] as 'facebook' | 'instagram' | 'threads') : null;
}
