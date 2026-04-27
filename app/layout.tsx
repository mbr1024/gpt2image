import type { Metadata, Viewport } from 'next';
import { Nav } from '@/components/Nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'GPT Image',
  icons: '/favicon.svg',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[var(--bg)] text-[var(--text)]">
        <div className="h-screen flex flex-col md:flex-row">
          <Nav />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="flex-shrink-0 bg-[var(--bg-secondary)] border-b border-[var(--border)] px-4 py-3 md:hidden">
              <h1 className="text-base font-semibold">GPT Image</h1>
            </header>
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
              <div className="max-w-lg md:max-w-4xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
