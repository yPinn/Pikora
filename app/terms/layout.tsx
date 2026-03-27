import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '服務條款',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
