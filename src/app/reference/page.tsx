'use client';

import { Header } from '@/components/app/header';
import { Logo } from '@/components/app/logo';
import { ReferenceList } from '@/components/app/reference-list';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Activity, BookMarked, Columns3, FileText, History, LayoutDashboard, Users } from 'lucide-react';
import Link from 'next/link';

export default function ReferencePage() {
  return (
    <ProtectedRoute>
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
                  <SidebarMenuButton asChild tooltip="Kanban">
                    <Link href="/kanban">
                      <Columns3 />
                      <span>Kanban</span>
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
                  <SidebarMenuButton asChild tooltip="Referências" isActive>
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
                  <SidebarMenuButton asChild tooltip="Documentação">
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
            <ReferenceList />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
