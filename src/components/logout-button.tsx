'use client';

import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from './ui/button';
import { Icons } from './icons';
import { useSidebar } from './ui/sidebar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function LogoutButton() {
  const auth = useAuth();
  const { open } = useSidebar();

  const handleLogout = () => {
    signOut(auth);
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
