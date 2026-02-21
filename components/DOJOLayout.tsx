'use client';

import { useState, useEffect } from 'react';
import { DOJOSidebar } from './DOJOSidebar';

export function DOJOLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('dojo-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as 'dark' | 'light';
      setTheme(detail);
    };
    window.addEventListener('dojo-theme-change', handler);
    return () => window.removeEventListener('dojo-theme-change', handler);
  }, []);

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-black' : 'bg-stone-50'
    }`}>
      <DOJOSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
