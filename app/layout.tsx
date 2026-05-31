import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientShell from '@/components/ClientShell';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Pritha Mishra • AI Engineer',
  description: 'Portfolio of AI Engineer Pritha Mishra — GenAI systems, RAG pipelines, and production AI infrastructure.',
  openGraph: {
    title: 'Pritha Mishra • AI Engineer',
    description: 'Portfolio of AI Engineer Pritha Mishra — GenAI systems, RAG pipelines, and production AI infrastructure.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-cream text-slate-900`}>
        <ClientShell>{children}</ClientShell>
        <Analytics />
      </body>
    </html>
  );
}
