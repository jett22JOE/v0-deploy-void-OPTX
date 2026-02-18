'use client';

import { Activity, Eye, BookOpen, MessageSquare, LayoutDashboard, Settings, ArrowLeft, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navigationItems = [
  { title: 'Dashboard', url: '/dojo', icon: LayoutDashboard },
  { title: 'Training', url: '/dojo/training', icon: Activity },
  { title: 'Connections', url: '/dojo/Connections', icon: Users },
  { title: 'Docs', url: '/dojo/docs', icon: BookOpen },
];

export function DOJOSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 h-screen flex flex-col border-r border-orange-500/20 bg-zinc-950/90 backdrop-blur shrink-0">
      <div className="p-4 border-b border-orange-500/20">
        <Link href="/dojo" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Eye className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-orange-400 font-mono tracking-wider">DOJO</span>
            <span className="text-[10px] text-orange-500/60 font-mono">Jett Optics</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] text-orange-400/50 font-mono uppercase tracking-wider px-2 mb-2">Training & Tools</p>
        {navigationItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.title}
              href={item.url}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono transition-colors ${
                isActive
                  ? 'bg-orange-500/20 text-orange-400 border-l-2 border-orange-500'
                  : 'text-orange-400/60 hover:text-orange-400 hover:bg-orange-500/10'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-orange-500/20 space-y-1">
        <Link
          href="/security"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono text-orange-400/60 hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Account</span>
        </Link>
        <Link
          href="/dojo"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono text-orange-400/60 hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hub</span>
        </Link>
      </div>
    </aside>
  );
}
