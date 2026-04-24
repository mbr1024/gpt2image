'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { id: '/create', label: '创建', icon: '✦' },
  { id: '/history', label: '历史', icon: '☰' },
];

export function Nav() {
  const pathname = usePathname();

  const isActive = (tabId: string) => {
    if (tabId === '/history') return pathname.startsWith('/history');
    return pathname === tabId;
  };

  return (
    <>
      {/* PC: 左侧 Sidebar */}
      <nav className="hidden md:flex flex-col w-48 border-r border-gray-200 bg-white p-3 gap-1">
        <h1 className="text-base font-semibold text-gray-900 px-3 py-3 mb-2">GPT Image</h1>
        {tabs.map(tab => (
          <Link
            key={tab.id}
            href={tab.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(tab.id)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </nav>

      {/* 移动端: 底部 TabBar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-gray-200 bg-white">
        {tabs.map(tab => (
          <Link
            key={tab.id}
            href={tab.id}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
              isActive(tab.id) ? 'text-blue-600' : 'text-gray-400'
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
