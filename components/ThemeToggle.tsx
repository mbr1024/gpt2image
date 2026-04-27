'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    setTheme((localStorage.getItem('theme') as Theme) || 'system');
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.removeItem('theme');
      if (matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const cycle = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'));
  };

  const icon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '⚙️';

  return (
    <button
      onClick={cycle}
      title={`主题: ${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}`}
      className="flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-colors text-[var(--text-secondary)] hover:bg-[var(--hover)]"
    >
      {icon}
    </button>
  );
}
