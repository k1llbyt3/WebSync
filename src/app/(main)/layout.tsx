
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Icons } from '@/components/icons';
import { SidebarToggle } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/logout-button';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen flex-col">
        <div className="absolute inset-0 animated-gradient -z-10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat -z-10 opacity-[0.07]" />

        <div className="flex flex-1">
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 p-2 transition-all duration-300 group-data-[state=collapsed]/sidebar:justify-center">
                <Link href="/" className="flex items-center gap-1 font-bold text-xl">
                  <Icons.logo className="h-10 w-auto" />
                </Link>
              </div>
              <UserNav />
            </SidebarHeader>
            <SidebarContent>
              <MainNav />
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
          </Sidebar>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

