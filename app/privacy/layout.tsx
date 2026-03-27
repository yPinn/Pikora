import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隱私政策',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
