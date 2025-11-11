import { Logo } from '@/components/icons';

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-primary" />
          <p className="text-sm font-medium font-headline">CourseCraft Academy</p>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CourseCraft Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
