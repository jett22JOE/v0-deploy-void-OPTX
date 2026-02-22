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

  const isDark = theme === 'dark';

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
    window.dispatchEvent(new CustomEvent('dojo-theme-change', { detail: next }));
  };

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarWidth = collapsed ? 'w-[52px]' : 'w-56';

  // Theme-aware color tokens
  const border = isDark ? 'border-orange-500/15' : 'border-orange-200';
  const sidebarBg = isDark ? 'bg-zinc-950/95' : 'bg-white/95';
  const textPrimary = isDark ? 'text-orange-400' : 'text-orange-700';
  const textMuted = isDark ? 'text-orange-400/50' : 'text-orange-700/70';
  const textSubtle = isDark ? 'text-orange-500/50' : 'text-orange-600/70';
  const hoverBg = isDark ? 'hover:bg-orange-500/8' : 'hover:bg-orange-50';
  const activeBgExpanded = isDark
    ? 'bg-orange-500/15 text-orange-400 border-l-2 border-orange-500 shadow-[inset_0_0_12px_rgba(181,82,0,0.08)]'
    : 'bg-orange-50 text-orange-700 border-l-2 border-orange-500 shadow-[inset_0_0_12px_rgba(181,82,0,0.05)]';
  const activeBgCollapsed = isDark
    ? 'bg-orange-500/15 text-orange-400'
    : 'bg-orange-50 text-orange-700';
  const activeBg = collapsed ? activeBgCollapsed : activeBgExpanded;

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg backdrop-blur-sm border ${
          isDark ? 'bg-zinc-900/90 border-orange-500/20' : 'bg-white/90 border-orange-200'
        }`}
        aria-label="Toggle sidebar"
      >
        <PanelLeft className={`w-4 h-4 ${textPrimary}`} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className={`md:hidden fixed inset-0 z-40 backdrop-blur-sm ${isDark ? 'bg-black/60' : 'bg-black/20'}`}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarWidth} h-screen flex flex-col border-r ${border} ${sidebarBg} backdrop-blur-xl shrink-0 transition-all duration-300 ease-in-out
          md:relative md:translate-x-0
          ${mobileOpen ? 'fixed left-0 top-0 z-50 w-56 translate-x-0' : 'fixed left-0 top-0 z-50 -translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className={`${collapsed ? 'p-2' : 'p-3'} ${collapsed ? '' : `border-b ${border}`} flex ${collapsed ? 'flex-col items-center gap-1' : 'items-center justify-between'}`}>
          <Link href="/dojo" className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'} group`}>
            <div className={`${collapsed ? 'w-7 h-7' : 'w-8 h-8'} rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isDark ? 'bg-orange-500/15 group-hover:bg-orange-500/25' : 'bg-orange-50 group-hover:bg-orange-100'
            }`}>
              <Image
                src="/images/astroknots-logo.png"
                alt="DOJO"
                width={collapsed ? 18 : 20}
                height={collapsed ? 18 : 20}
                className="rounded-full object-contain"
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className={`text-sm font-bold font-mono tracking-wider ${textPrimary}`}>DOJO</span>
                <span className={`text-[9px] font-mono ${textSubtle}`}>Jett Optics</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden md:flex p-1 rounded-md transition-colors ${isDark ? 'hover:bg-orange-500/10' : 'hover:bg-orange-50'}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className={`w-3.5 h-3.5 ${textMuted} hover:${textPrimary}`} />
            ) : (
              <PanelLeftClose className={`w-3.5 h-3.5 ${textMuted} hover:${textPrimary}`} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <p className={`text-[9px] font-mono uppercase tracking-widest px-3 mb-2 mt-1 ${isDark ? 'text-orange-400/40' : 'text-orange-500/50'}`}>
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
                className={`group flex items-center gap-2.5 ${collapsed ? 'px-0 justify-center' : 'px-3'} py-2 rounded-lg text-sm font-mono transition-all duration-200 ${isActive ? activeBg : `${textMuted} hover:${textPrimary} ${hoverBg}`}`}
              >
                <item.icon className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4'} shrink-0 transition-colors ${isActive ? textPrimary : `${textMuted} group-hover:${textPrimary}`}`} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-2 ${collapsed ? '' : `border-t ${border}`} space-y-0.5`}>
          <Link
            href="/docs"
            title={collapsed ? "OPTX Suite" : undefined}
            className={`group flex items-center gap-2.5 ${collapsed ? 'px-0 justify-center' : 'px-3'} py-2 rounded-lg text-sm font-mono transition-all duration-200 ${pathname === '/docs' ? activeBg : `${textMuted} hover:${textPrimary} ${hoverBg}`}`}
          >
            <Code2 className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4'} shrink-0`} />
            {!collapsed && <span>OPTX Suite</span>}
          </Link>
          <Link
            href="/security"
            title={collapsed ? "Account" : undefined}
            className={`group flex items-center gap-2.5 ${collapsed ? 'px-0 justify-center' : 'px-3'} py-2 rounded-lg text-sm font-mono transition-all duration-200 ${textMuted} hover:${textPrimary} ${hoverBg}`}
          >
            <Settings className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4'} shrink-0`} />
            {!collapsed && <span>Account</span>}
          </Link>
          <Link
            href="/dojo"
            title={collapsed ? "Back to Hub" : undefined}
            className={`group flex items-center gap-2.5 ${collapsed ? 'px-0 justify-center' : 'px-3'} py-2 rounded-lg text-sm font-mono transition-all duration-200 ${textMuted} hover:${textPrimary} ${hoverBg}`}
          >
            <ArrowLeft className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4'} shrink-0`} />
            {!collapsed && <span>Back to Hub</span>}
          </Link>

          {/* Theme toggle */}
          <div className={`flex items-center ${collapsed ? 'justify-center px-0' : 'justify-start px-3'} pt-2 pb-1`}>
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-orange-500/10' : 'hover:bg-orange-50'}`}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <Sun className={`${collapsed ? 'w-4 h-4' : 'w-3.5 h-3.5'} ${textMuted}`} />
              ) : (
                <Moon className={`${collapsed ? 'w-4 h-4' : 'w-3.5 h-3.5'} ${textMuted}`} />
              )}
              {!collapsed && (
                <span className={`text-[10px] font-mono ${isDark ? 'text-orange-400/40' : 'text-orange-500/50'}`}>
                  {isDark ? 'Light' : 'Dark'}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
