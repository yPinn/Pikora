import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '資料刪除狀態 | Pikora',
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ code?: string }>;
}

export default async function DeletionStatusPage({ searchParams }: Props) {
  const { code } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">資料刪除請求已收到</h1>
        <p className="text-muted-foreground">
          我們已收到您透過 Facebook
          提出的資料刪除請求，並已刪除您在本服務中的所有相關資料，包含抽獎記錄及帳號資訊。
        </p>
        {code && (
          <p className="text-muted-foreground text-sm">
            確認代碼：<code className="font-mono">{code}</code>
          </p>
        )}
        <p className="text-muted-foreground text-sm">
          如有疑問，請透過隱私政策頁面上的聯絡方式與我們聯繫。
        </p>
      </div>
    </main>
  );
}
