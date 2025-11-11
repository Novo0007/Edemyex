
'use client';

import { TokenProvider } from '@/components/token-provider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import BottomNav from '@/components/layout/bottom-nav';
import { Toaster } from '@/components/ui/toaster';

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <>
            <TokenProvider />
            <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-24 pb-20 md:pb-0">{children}</main>
                <Footer />
                <BottomNav />
            </div>
            <Toaster />
        </>
    )
}
