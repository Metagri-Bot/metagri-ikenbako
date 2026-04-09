import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Metagri フィードバックボックス',
  description: 'Metagri のMVP向けフィードバック収集フォーム'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
