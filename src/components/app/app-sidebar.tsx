'use client';

import { Logo } from '@/components/app/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useGlobalLoading } from '@/components/providers/global-loading-provider';
import { Activity, BookMarked, Calendar1, Columns3, FileText, History, LayoutDashboard, ListTodo, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    tooltip: 'Dashboard - Visão Geral'
  },
  {
    title: 'Backlog',
    href: '/backlog',
    icon: ListTodo,
    tooltip: 'Caixa de Entrada de Backlog'
  },
  {
    title: 'Kanban',
    href: '/kanban',
    icon: Columns3,
    tooltip: 'Kanban'
  },
  {
    title: 'Em Andamento',
    href: '/in-progress',
    icon: Activity,
    tooltip: 'Em Andamento'
  },
  {
    title: 'Demandas',
    href: '/demands',
    icon: Users,
    tooltip: 'Demandas'
  },
  {
    title: 'Referências',
    href: '/reference',
    icon: BookMarked,
    tooltip: 'Referências'
  },
  {
    title: 'Follow-up',
    href: '/follow-up',
    icon: History,
    tooltip: 'Follow-up'
  },
  {
    title: 'Documentação',
    href: '/documentation',
    icon: FileText,
    tooltip: 'Documentação'
  },
  {
    title: 'Calendário',
    href: '/calendar',
    icon: Calendar1,
    tooltip: 'Calendário'
  }
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setIsLoading } = useGlobalLoading();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.tooltip} isActive={isActive}>
                    <Link 
                      href={item.href}
                      onClick={() => {
                        if (!isActive) {
                          setIsLoading(true);
                        }
                      }}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}