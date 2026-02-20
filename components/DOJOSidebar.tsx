'use client';

import { useState, useEffect } from 'react';
import { Activity, Eye, BookOpen, LayoutDashboard, Settings, ArrowLeft, Users, BarChart3, Code2, PanelLeftClose, PanelLeft, Sun, Moon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const navigationItems = [
  { title: 'Dashboard', url: '/dojo', icon: LayoutDashboard },
  { title: 'Training', url: '/dojo/training', icon: Activity },
  { title: 'Analytics', url: '/dojo/analytics', icon: BarChart3 },
  { title: 'Connections', url: '/dojo/Connections', icon: Users },
  { title: 'Augments', url: '/dojo/augments', icon: BookOpen },
];

export function DOJOSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Persist sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('dojo-sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
    const savedTheme = localStorage.getItem('dojo-theme') as 'dark' | 'light' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('dojo-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('dojo-theme', next);
    // Dispatch custom event for pages that listen
    window.dispatchEvent(new CustomEvent('dojo-theme-change', { detail: next }));
  };

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarWidth = collapsed ? 'w-16' : 'w-56';

  return (
    <>
      {/* Mobile toggle button — fixed top-left */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900/90 border border-orange-500/20 backdrop-blur-sm"
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="w-4 h-4 text-orange-400" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarWidth} h-screen flex flex-col border-r border-orange-500/15 bg-zinc-950/95 backdrop-blur-xl shrink-0 transition-all duration-300 ease-in-out
          md:relative md:translate-x-0
          ${mobileOpen ? 'fixed left-0 top-0 z-50 w-56 translate-x-0' : 'fixed left-0 top-0 z-50 -translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-3 border-b border-orange-500/15 flex items-center justify-between">
          <Link href="/dojo" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0 group-hover:bg-orange-500/25 transition-colors">
              <Image
                src="/images/astroknots-logo.png"
                alt="DOJO"
                width={20}
                height={20}
                className="rounded-full object-contain"
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-orange-400 font-mono tracking-wider">DOJO</span>
                <span className="text-[9px] text-orange-500/50 font-mono">Jett Optics</span>
              </div>
            )}
          </Link>
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-md hover:bg-orange-500/10 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="w-3.5 h-3.5 text-orange-400/60 hover:text-orange-400" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5 text-orange-400/60 hover:text-orange-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <p className="text-[9px] text-orange-400/40 font-mono uppercase tracking-widest px-3 mb-2 mt-1">
              Training & Tools
            </p>
          )}
          {navigationItems.map((item) => {
            const isActive = pathname === item.url;
            return (
              <Link
                key={item.title}
                href={item.url}
                title={collapsed ? item.title : undefined}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-mono transition-all duration-200 ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-400 border-l-2 border-orange-500 shadow-[inset_0_0_12px_rgba(181,82,0,0.08)]'
                    : 'text-orange-400/50 hover:text-orange-400 hover:bg-orange-500/8'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-orange-400' : 'text-orange-400/50 group-hover:text-orange-400'}`} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-orange-500/15 space-y-0.5">
          <Link
            href="/docs"
            title={collapsed ? "OPTX Suite" : undefined}
            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-mono transition-all duration-200 ${
              collapsed ? 'justify-center' : ''
            } ${
              pathname === '/docs'
                ? 'bg-orange-500/15 text-orange-400 border-l-2 border-orange-500'
                : 'text-orange-400/50 hover:text-orange-400 hover:bg-orange-500/8'
            }`}
          >
            <Code2 className="w-4 h-4 shrink-0" />
            {!collapsed && <span>OPTX Suite</span>}
          </Link>
          <Link
            href="/security"
            title={collapsed ? "Account" : undefined}
            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-mono text-orange-400/50 hover:text-orange-400 hover:bg-orange-500/8 transition-all duration-200 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Account</span>}
          </Link>
          <Link
            href="/dojo"
            title={collapsed ? "Back to Hub" : undefined}
            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-mono text-orange-400/50 hover:text-orange-400 hover:bg-orange-500/8 transition-all duration-200 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Back to Hub</span>}
          </Link>

          {/* Theme toggle */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} px-3 pt-2 pb-1`}>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-orange-500/10 transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-orange-400/50 hover:text-orange-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-orange-400/50 hover:text-orange-400" />
              )}
              {!collapsed && (
                <span className="text-[10px] font-mono text-orange-400/40">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
