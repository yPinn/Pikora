/**
 * Discord Webhook 通知工具
 * 用於將 webhook 錯誤/警告推送至 Discord 頻道
 *
 * 環境變數：DISCORD_WEBHOOK_URL
 */

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

type AlertLevel = 'error' | 'warn' | 'info';

const COLORS: Record<AlertLevel, number> = {
  error: 0xe74c3c, // 紅
  warn: 0xf39c12, // 橘
  info: 0x3498db, // 藍
};

const EMOJIS: Record<AlertLevel, string> = {
  error: '🔴',
  warn: '🟡',
  info: '🔵',
};

interface NotifyOptions {
  level: AlertLevel;
  title: string;
  description?: string;
  fields?: Record<string, string>;
}

/**
 * 送出 Discord Embed 通知
 * 若未設定 DISCORD_WEBHOOK_URL，靜默略過
 */
export async function discordNotify(options: NotifyOptions): Promise<void> {
  if (!DISCORD_WEBHOOK_URL) return;

  const { level, title, description, fields } = options;

  const embedFields = fields
    ? Object.entries(fields).map(([name, value]) => ({ name, value: `\`${value}\``, inline: true }))
    : [];

  const body = {
    embeds: [
      {
        title: `${EMOJIS[level]} ${title}`,
        description,
        color: COLORS[level],
        fields: embedFields,
        timestamp: new Date().toISOString(),
        footer: { text: 'Pikora Webhook' },
      },
    ],
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // 不讓通知失敗影響主流程
  }
}
