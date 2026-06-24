
'use client';
import Link from 'next/link';
import { Shield, LayoutGrid, LogOut, Menu, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase/provider';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { Skeleton } from '../ui/skeleton';

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'Successfully logged out.' });
      router.push('/login');
    } catch (error) {
      toast({ title: 'Logout Failed', variant: 'destructive' });
    }
  };

  return (
    <header className="fixed top-0 z-40 w-full p-4">
      <div className="container mx-auto flex h-16 items-center rounded-full border bg-background/95 px-6 shadow-lg backdrop-blur">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline">GuardExt</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/#features" className="hover:text-primary">Features</Link>
          {user && <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>}
        </nav>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          
          {isUserLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback>{user.displayName?.charAt(0) || 'D'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'Developer'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard"><LayoutGrid className="mr-2 h-4 w-4"/>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile"><UserIcon className="mr-2 h-4 w-4"/>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
