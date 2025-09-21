'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/app/header';
import { Logo } from '@/components/app/logo';
import { LayoutDashboard, Columns3, BookMarked, History, Users, Activity, FileText } from 'lucide-react';
import Link from 'next/link';
import { DocumentationList } from '@/components/app/documentation-list';

export default function DocumentationPage() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Backlog">
                  <Link href="/">
                    <LayoutDashboard />
                    <span>Backlog</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Kamban-Geral">
                  <Link href="/kanban">
                    <Columns3 />
                    <span>Kamban-Geral</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Em Andamento">
                  <Link href="/in-progress">
                    <Activity />
                    <span>Em Andamento</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Demandas">
                  <Link href="/demands">
                    <Users />
                    <span>Demandas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Referências">
                  <Link href="/reference">
                    <BookMarked />
                    <span>Referências</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Follow-up">
                  <Link href="/follow-up">
                    <History />
                    <span>Follow-up</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Documentação" isActive>
                  <Link href="/documentation">
                    <FileText />
                    <span>Documentação</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <DocumentationList />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
