"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Icons } from './icons';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSidebar } from './ui/sidebar';
import { cn } from '@/lib/utils';

export function UserNav() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const { open } = useSidebar();

    const router = useRouter();

    const handleLogout = async () => {
        router.push("/loading"); // Show loading screen
        await signOut(auth);
        // After signout, auth state listener will likely redirect to login, but visual feedback is immediate
    };

    const getInitials = (name?: string | null, email?: string | null) => {
        if (name) {
            const names = name.split(' ');
            return names.map(n => n[0]).join('').toUpperCase();
        }
        if (email) {
            return email[0].toUpperCase();
        }
        return 'U';
    }

    if (isUserLoading) {
        return (
            <div className={cn("flex items-center gap-2 p-2", !open && "justify-center")}>
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className={cn("h-8 w-24 rounded-lg", !open && "hidden")} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-2 w-full">
                <Button asChild className={cn(open && "w-full")}>
                    <Link href="/login">
                        <Icons.logIn className={cn(open && "mr-2")} />
                        <span className={cn(!open && "hidden")}>Login</span>
                    </Link>
                </Button>
            </div>
        )
    }

    // Collapsed View
    if (!open) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex justify-center p-2 cursor-pointer">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email || ''} />
                            <AvatarFallback>{getInitials(user.displayName, user.email)}</AvatarFallback>
                        </Avatar>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href="/settings">
                                <Icons.settings className="mr-2" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <Icons.logout className="mr-2" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    // Expanded View
    return (
        <div className='w-full p-2 flex items-center gap-3'>
            <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email || ''} />
                <AvatarFallback>{getInitials(user.displayName, user.email)}</AvatarFallback>
            </Avatar>
            <div className='flex-1 overflow-hidden'>
                <p className="text-sm font-medium leading-none truncate">{user.displayName || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                    {user.email}
                </p>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Icons.more className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href="/settings">
                                <Icons.settings className="mr-2" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <Icons.logout className="mr-2" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
