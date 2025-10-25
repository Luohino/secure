import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Luohino Chat - Secure End-to-End Encrypted Communication',
  description: 'Private voice, video, and chat with end-to-end encryption. Calls persist in background.',
  manifest: '/manifest.webmanifest',
  themeColor: '#e6e7ee',
  viewport: 'width=device-width, initial-scale=1.0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
