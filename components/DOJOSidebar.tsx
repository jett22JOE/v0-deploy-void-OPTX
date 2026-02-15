'use client';

import { Activity, Video, Target, Home, MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BrainCircuitIcon } from '@/components/BrainCircuitIcon';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const navigationItems = [
  {
    title: 'DOJO',
    url: '/dojo',
    icon: Activity,
  },
  {
    title: 'Gaze Auth',
    url: '/gaze-auth',
    icon: Target,
  },
  {
    title: 'MOJO',
    url: '/mojo',
    icon: Video,
  },
];

export function DOJOSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-orange-500/20 p-4">
        <Link href="/hub" className="flex items-center gap-2">
          <BrainCircuitIcon size={32} className="text-orange-500" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-orange-400">JETT HUB</span>
            <span className="text-[10px] text-orange-500/70">Gaze Optics</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-400/70 text-xs">
            Training & Auth
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`${
                        isActive
                          ? 'bg-orange-500/20 text-orange-400 border-l-2 border-orange-500'
                          : 'text-orange-400/70 hover:text-orange-400 hover:bg-orange-500/10'
                      }`}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-orange-500/20 p-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
          asChild
        >
          <Link href="/hub">
            <Home className="w-4 h-4 mr-2" />
            Return to Hub
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
