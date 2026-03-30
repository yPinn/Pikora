/**
 * ReDoS 防護：檢查正則是否包含巢狀量詞等危險模式
 * 同時被 types.ts (server validation) 與 filters.ts (client filtering) 使用
 */

// 模組層級常數，避免每次呼叫重新編譯
const NESTED_QUANTIFIER = /\([^)]*[+*][^)]*\)[+*?]/;
const BOUNDED_NESTED_QUANTIFIER = /\([^)]*\{[0-9,]+\}[^)]*\)[+*{?]/;
const ALTERNATION_QUANTIFIER = /\(([^|)]+\|)+[^|)]+\)[+*]/;
const BACKREFERENCE = /\\[1-9]/;

export function isSafeRegex(pattern: string): boolean {
  if (pattern.length > 200) return false;
  // 拒絕巢狀量詞：(X+)+、(X*)* 等
  if (NESTED_QUANTIFIER.test(pattern)) return false;
  // 拒絕 bounded quantifier 巢狀：(X{n,m}){n,m}
  if (BOUNDED_NESTED_QUANTIFIER.test(pattern)) return false;
  // 拒絕 (a|a)+ 類型的重疊交替量詞
  if (ALTERNATION_QUANTIFIER.test(pattern)) return false;
  // 拒絕反向引用（可能結合量詞造成指數回溯）
  if (BACKREFERENCE.test(pattern)) return false;
  return true;
}
