/**
 * 統一 Logger
 *
 * - Server-side: 所有 level 都輸出（info+ in production）
 * - Client-side production: 只輸出 warn / error，避免洩漏內部資訊至 DevTools
 * - Dev: 輸出所有 level
 * - PII masking: maskId() 遮蔽用戶 ID
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function minLevel(): LogLevel {
  const isServer = typeof window === 'undefined';
  const isProd = process.env.NODE_ENV === 'production';

  if (!isServer && isProd) return 'warn'; // browser prod: 靜音 debug/info
  if (isServer && isProd) return 'info'; // server prod: 靜音 debug
  return 'debug'; // dev: 全開
}

/**
 * 遮蔽 PII 識別碼（Facebook user ID 等）
 * "1234567890" → "1234***"
 */
export function maskId(id: string | undefined | null): string {
  if (!id) return '[unknown]';
  if (id.length <= 6) return '***';
  return `${id.slice(0, 4)}***`;
}

export function createLogger(module: string) {
  const prefix = `[${module}]`;

  function log(level: LogLevel, message: string, context?: unknown): void {
    if (LEVEL_RANK[level] < LEVEL_RANK[minLevel()]) return;
    const args: unknown[] = context !== undefined ? [prefix, message, context] : [prefix, message];
    // eslint-disable-next-line no-console
    console[level](...(args as [string, ...unknown[]]));
  }

  return {
    debug: (msg: string, ctx?: unknown) => log('debug', msg, ctx),
    info: (msg: string, ctx?: unknown) => log('info', msg, ctx),
    warn: (msg: string, ctx?: unknown) => log('warn', msg, ctx),
    error: (msg: string, ctx?: unknown) => log('error', msg, ctx),
  };
}
