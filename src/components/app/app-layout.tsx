'use client';

import { Header } from '@/components/app/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { FloatingActionButton } from './floating-action-button';
import { DemandsProvider } from '@/context/demands-context';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ProtectedRoute>
      <DemandsProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
          <FloatingActionButton />
        </SidebarProvider>
      </DemandsProvider>
    </ProtectedRoute>
  );
}