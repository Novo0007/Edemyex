
'use client';
import Link from 'next/link';
import { BookOpen, Library, Menu, PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/icons';
import { getUserById } from '@/lib/data';
import { ThemeToggle } from '@/components/theme-toggle';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/types';
import { useScroll } from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/#courses', label: 'Browse' },
  { href: '/my-courses', label: 'My Courses' },
  { href: '/create', label: 'Create Course' },
];

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const { isScrolled, isScrollingUp } = useScroll();

  useEffect(() => {
    async function fetchUser() {
      const userData = await getUserById('user-1');
      if (userData) {
        setUser(userData);
      }
    }
    fetchUser();
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 z-40 w-full p-4 transition-transform duration-300',
        isScrolled && !isScrollingUp ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="container mx-auto flex h-16 items-center rounded-full border bg-background/95 px-6 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              Edemy
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Logo className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline">Edemy</span>
            </Link>
            <div className="my-4 h-px w-full bg-border" />
            <div className="flex flex-col space-y-3">
              {navLinks.map(({ href, label }) => (
                <Link key={label} href={href} className="text-foreground">
                  {label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full flex-1 sm:w-auto sm:flex-none">
            <Button variant="outline" className="hidden lg:inline-flex w-full justify-start text-sm font-normal text-muted-foreground">
              <Search className="mr-2 h-4 w-4" />
              Search courses...
            </Button>
          </div>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Creator & Learner
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/my-courses"><Library className="mr-2 h-4 w-4"/>My Courses</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/create"><PlusCircle className="mr-2 h-4 w-4"/>Create a Course</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
