'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Server, Settings, Users, Shield, Fingerprint } from 'lucide-react';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Painel' },
  { href: '/profiles', icon: Users, label: 'Perfis' },
  { href: '/proxies', icon: Server, label: 'Proxies' },
  { href: '/fingerprint-test', icon: Fingerprint, label: 'Teste de Fingerprint' },
  { href: '/settings', icon: Settings, label: 'Configurações' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
            <Shield className="size-8 text-accent" />
            <h1 className="font-headline text-2xl font-semibold">PrivateSys</h1>
        </div>
      </SidebarHeader>

      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={{ children: item.label, side: 'right' }}
            >
              <Link href={item.href} prefetch={true}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      
      <SidebarFooter className="mt-auto p-4">
        <SidebarSeparator className="mb-4" />
         <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip={{ children: 'Configurações', side: 'right' }}>
              <Link href="/settings" prefetch={true}>
                <Settings />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </>
  );
}
