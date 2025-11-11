
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import Script from 'next/script';
import AppShell from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: 'Edemy',
  description: 'Discover, learn, and create with Edemy. Your marketplace for online video courses.',
};

const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-headline',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-body antialiased', fontBody.variable, fontHeadline.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FirebaseClientProvider>
            <AppShell>
              {children}
            </AppShell>
          </FirebaseClientProvider>
        </ThemeProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
