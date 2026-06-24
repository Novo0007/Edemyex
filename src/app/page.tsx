
'use client';

import Link from 'next/link';
import { ShieldCheck, Lock, Zap, Code, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';

export default function LandingPage() {
  const { user } = useUser();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4 py-1 px-4 bg-primary/20 text-primary border-0 rounded-full">
            Secure Your Extension Business
          </Badge>
          <h1 className="font-headline text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            The Ultimate Lock for <span className="text-primary">Chrome Extensions</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Stop piracy and manage licenses remotely. Protect your source code and control user access with GuardExt's robust locking mechanism.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/register">Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline text-3xl font-bold mb-4">Why Choose GuardExt?</h2>
          <p className="text-muted-foreground">Built by extension developers, for extension developers.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-none shadow-md">
            <CardHeader>
              <Lock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Remote Locking</CardTitle>
            </CardHeader>
            <CardContent>
              Kill any extension instance remotely if a subscription expires or suspicious activity is detected.
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardHeader>
              <ShieldCheck className="h-10 w-10 text-primary mb-2" />
              <CardTitle>License Validation</CardTitle>
            </CardHeader>
            <CardContent>
              Powerful API to validate license keys and prevent multiple concurrent sessions on different machines.
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Instant Integration</CardTitle>
            </CardHeader>
            <CardContent>
              Add our lightweight SDK to your extension and be secured in under 5 minutes. No complex backend needed.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Code Snippet Preview */}
      <section className="bg-muted/50 py-20 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-headline text-3xl font-bold mb-6">Simple Integration</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Just include our verification logic in your background script. We handle the heavy lifting of authentication and state management.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Code className="h-5 w-5 text-primary" />
                <span>REST API for quick validation</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span>Encrypted handshake protocols</span>
              </li>
            </ul>
          </div>
          <div className="bg-zinc-950 rounded-xl p-6 shadow-2xl overflow-hidden text-zinc-300 font-mono text-sm border border-zinc-800">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <pre><code>{`// background.js
import { checkLicense } from 'guardext-sdk';

const license = await checkLicense({
  extensionId: 'YOUR_ID',
  key: userLicenseKey
});

if (!license.valid) {
  // Lock the extension UI
  chrome.action.setPopup({ popup: 'locked.html' });
}`}</code></pre>
          </div>
        </div>
      </section>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
