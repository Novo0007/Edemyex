
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  BookOpen,
  DollarSign,
  PanelLeft,
  Settings,
  LayoutGrid,
  Wallet,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, notFound } from 'next/navigation';

import { Logo } from '@/components/icons';
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
import { useAuth, useUser } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { SheetTitle } from '@/components/ui/sheet';

const creatorNavItems = [
  { href: '/creator/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/creator/courses', label: 'Courses', icon: BookOpen },
  { href: '/creator/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/creator/payouts', label: 'Payouts', icon: Wallet },
];

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();

  if (isUserLoading) {
    return <div className="flex h-screen items-center justify-center"><p>Loading...</p></div>
  }
  
  // Only allow approved creators to access this layout. Admins are routed to their own dash.
  if (!user || user.role !== 'creator') {
    if (user && user.creatorStatus === 'pending') {
        return <CreatorPendingPage />;
    }
    if (user && user.creatorStatus === 'rejected') {
        return <CreatorRejectedPage />;
    }
    notFound(); 
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-14 items-center gap-2 px-2">
            <Logo className="size-6 text-primary" />
            <span className="text-lg font-semibold">Creator Hub</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SheetTitle className="sr-only">Creator Navigation</SheetTitle>
          <SidebarMenu>
            {creatorNavItems.map(item => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex h-14 items-center gap-2 p-2">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="size-4" />
              <span>Settings</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger>
            <PanelLeft />
          </SidebarTrigger>
          <UserMenu />
        </header>
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function UserMenu() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging you out.',
        variant: 'destructive',
      });
    }
  };


  if (isUserLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }
  
  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
            <AvatarFallback>
              {user?.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'C'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
           <Link href="/">Home</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
           <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CreatorPendingPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center p-4">
            <Alert className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Application Pending</AlertTitle>
                <AlertDescription>
                    Your creator application is currently under review. You'll be able to access the creator dashboard once your application is approved.
                    <Button asChild variant="link" className="p-0 h-auto ml-1">
                        <Link href="/my-courses">Go to My Courses</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
    )
}

function CreatorRejectedPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Application Rejected</AlertTitle>
                <AlertDescription>
                    Unfortunately, your creator application was not approved at this time. Please contact support for more information.
                     <Button asChild variant="link" className="p-0 h-auto ml-1">
                        <Link href="/my-courses">Go to My Courses</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
    )
}
