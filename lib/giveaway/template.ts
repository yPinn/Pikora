/**
 * 通知訊息模板替換
 * vars 中不存在的 key 保留原始 {{key}} 佔位符（方便 UI 預覽）
 */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}
