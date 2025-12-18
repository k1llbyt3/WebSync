'use client';

import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from './ui/button';
import { Icons } from './icons';
import { useSidebar } from './ui/sidebar';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function LogoutButton() {
  const auth = useAuth();
  const router = useRouter();
  const { open } = useSidebar();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      window.location.href = '/'; // Hard navigation to ensure state clear
    }
  };

  if (!open) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <Icons.logout />
            <span className="sr-only">Log out</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">Log out</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="w-full justify-start"
    >
      <Icons.logout className="mr-2" />
      Log out
    </Button>
  );
}
