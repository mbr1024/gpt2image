import type { Metadata, Viewport } from 'next';
import { Nav } from '@/components/Nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'GPT Image',
  icons: '/favicon.svg',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <div className="h-screen flex flex-col md:flex-row bg-gray-50">
          <Nav />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 md:hidden">
              <h1 className="text-base font-semibold text-gray-900">GPT Image</h1>
            </header>
            <main className="flex-1 overflow-y-auto">
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
