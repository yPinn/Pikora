import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBasePath(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return '';
  try {
    const { pathname } = new URL(appUrl);
    return pathname === '/' ? '' : pathname.replace(/\/$/, '');
  } catch {
    return '';
  }
}

export function apiPath(path: string): string {
  return `${getBasePath()}${path}`;
}
