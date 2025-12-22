'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Library, PlusCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/#courses', label: 'Browse', icon: BookOpen, match: (pathname: string) => pathname === '/' || pathname.startsWith('/courses') },
  { href: '/my-courses', label: 'My Courses', icon: Library, match: (pathname: string) => pathname.startsWith('/my-courses') },
  { href: '/create', label: 'Create', icon: PlusCircle, match: (pathname:string) => pathname.startsWith('/create') },
  { href: '/contact', label: 'Contact', icon: User, match: (pathname:string) => pathname.startsWith('/contact') },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 z-50 w-full md:hidden">
      <div className="mx-auto mb-4 w-fit rounded-full border bg-background/95 p-2 shadow-lg backdrop-blur-sm">
        <nav className="flex items-center gap-2">
          {navLinks.map(({ href, label, icon: Icon, match }) => {
            const isActive = match(pathname);
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-full px-4 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent/50'
                )}
              >
                <Icon className="size-5" />
                <span className="sr-only">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
