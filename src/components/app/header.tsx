'use client';

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { useGlobalLoading } from '@/components/providers/global-loading-provider';

export function Header() {
  const { toggleSidebar, state } = useSidebar();
  const { user, signOut } = useAuth();
  const { setIsLoading } = useGlobalLoading();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur-md sm:px-6 lg:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-10 w-10 rounded-lg"
        >
            {state === 'expanded' ? <ChevronLeft /> : <ChevronRight />}
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-1 ring-border hover:ring-primary">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} alt="@user" />
              <AvatarFallback className="text-xs">{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.user_metadata?.full_name || 'Usuário'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" onClick={() => { if (pathname !== '/profile') setIsLoading(true); }}>Perfil</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/billing" onClick={() => { if (pathname !== '/billing') setIsLoading(true); }}>Faturamento</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" onClick={() => { if (pathname !== '/settings') setIsLoading(true); }}>Configurações</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
