'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

const tabs = [
  { id: '/create', label: '创建', icon: '✦' },
  { id: '/history', label: '历史', icon: '☰' },
  { id: '/help', label: '帮助', icon: '?' },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login') return null;

  const isActive = (tabId: string) => {
    if (tabId === '/history') return pathname.startsWith('/history');
    return pathname === tabId;
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* PC: 左侧 Sidebar */}
      <nav className="hidden md:flex flex-col w-48 border-r border-[var(--border)] bg-[var(--bg-secondary)] p-3 gap-1">
        <h1 className="text-base font-semibold px-3 py-3 mb-2">GPT Image</h1>
        {tabs.map(tab => (
          <Link
            key={tab.id}
            href={tab.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(tab.id)
                ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                : 'text-[var(--text-secondary)] hover:bg-[var(--hover)]'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}

        <div className="mt-auto flex items-center gap-1 px-1">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--hover)] transition-colors"
            title="退出登录"
          >
            ⏻
          </button>
        </div>
      </nav>

      {/* 移动端: 底部 TabBar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        {tabs.map(tab => (
          <Link
            key={tab.id}
            href={tab.id}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
              isActive(tab.id) ? 'text-blue-600 dark:text-blue-400' : 'text-[var(--text-tertiary)]'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
