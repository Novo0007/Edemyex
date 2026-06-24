'use client';
import Link from 'next/link';
import { Shield, LayoutGrid, LogOut, User as UserIcon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
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
    <header className="fixed top-0 z-40 w-full p-4 pointer-events-none">
      <div className="container mx-auto flex h-16 items-center rounded-full border border-white/5 bg-background/60 px-6 shadow-2xl backdrop-blur-xl pointer-events-auto">
        <Link href="/" className="mr-6 flex items-center space-x-2 group">
          <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold font-headline text-xl tracking-tight">Weblock</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          {user && <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>}
        </nav>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          
          {isUserLoading ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary/20">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">{user.displayName?.charAt(0) || 'D'}</AvatarFallback>
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
                  <Link href="/dashboard" className="cursor-pointer"><LayoutGrid className="mr-2 h-4 w-4 text-muted-foreground"/>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer"><UserIcon className="mr-2 h-4 w-4 text-muted-foreground"/>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Log In
              </Link>
              <Button className="rounded-full px-6" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}