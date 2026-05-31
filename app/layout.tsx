import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientShell from '@/components/ClientShell';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var s=localStorage.getItem('theme');if(s==='dark'){document.documentElement.classList.add('dark');}else if(!s){if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');}}})();`
        }} />
      </head>
      <body className={`${inter.variable} font-sans bg-cream dark:bg-[#0d1117] text-slate-900 dark:text-[#e6edf3]`}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
