'use client';

import Link from 'next/link';
import { ShieldCheck, Lock, Zap, Code, ArrowRight, CheckCircle2, Globe, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const { user } = useUser();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="outline" className="mb-6 py-1.5 px-4 bg-primary/5 text-primary border-primary/20 rounded-full animate-fade-in">
            <span className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" /> Stop Piracy Instantly
            </span>
          </Badge>
          <h1 className="font-headline text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
            Protect & Monetize Your <br />
            <span className="gradient-text">Chrome Extensions</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Weblock provides a robust remote locking mechanism and license management system. Secure your source code and control user access from anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Button size="lg" className="rounded-full px-8 h-12 text-base" asChild>
                <Link href="/dashboard">
                  Manage Extensions <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="rounded-full px-8 h-12 text-base" asChild>
                  <Link href="/register">Get Started Free</Link>
                </Button>
                <Button size="lg" variant="ghost" className="rounded-full px-8 h-12 text-base" asChild>
                  <Link href="#features">How it works</Link>
                </Button>
              </>
            )}
          </div>
          
          <div className="mt-16 flex items-center justify-center gap-8 text-muted-foreground/60 text-sm grayscale opacity-50">
            <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> Trusted globally</div>
            <div className="flex items-center gap-2"><Lock className="h-4 w-4" /> AES-256 Encryption</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> 99.9% Uptime</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl font-bold mb-4">Powerful Security Suite</h2>
          <p className="text-muted-foreground text-lg">Everything you need to safeguard your intellectual property.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Lock,
              title: "Remote Kill Switch",
              desc: "Instantly disable your extension for specific users or globally if unauthorized access is detected."
            },
            {
              icon: ShieldCheck,
              title: "License Guard",
              desc: "Prevent concurrent sessions and ensure only paying customers can access your premium features."
            },
            {
              icon: Zap,
              title: "Instant Integration",
              desc: "Zero-configuration setup. Add our 2KB SDK and be secured in minutes, not hours."
            }
          ].map((feature, idx) => (
            <Card key={idx} className="glass border-white/5 hover:border-primary/20 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-headline">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Integration Preview */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="font-headline text-4xl font-bold tracking-tight">One Line of Code. <br />Infinite Protection.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We've made it stupidly simple. Drop our verification script into your background worker and handle the rest from your Weblock dashboard.
            </p>
            <div className="space-y-4">
              {[
                "Automatic License Expiry Checks",
                "Machine-ID Fingerprinting",
                "Encrypted API Handshakes",
                "Custom 'Locked' UI Injection"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
            <Button size="lg" variant="outline" className="rounded-full" asChild>
              <Link href="/register">Start Integrating Now</Link>
            </Button>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-zinc-950 rounded-2xl p-8 shadow-2xl overflow-hidden text-zinc-300 font-mono text-sm border border-white/5">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <pre className="overflow-x-auto"><code>{`// background.js
import { Weblock } from '@weblock/sdk';

const auth = new Weblock('YOUR_EXT_ID');

chrome.runtime.onInstalled.addListener(async () => {
  const license = await auth.check();
  
  if (!license.valid) {
    // Kill extension functionality
    chrome.action.setPopup({ popup: 'locked.html' });
    console.log('Access Denied: ' + license.reason);
  }
});`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl glass rounded-[2rem] p-12 text-center border-white/5">
          <h2 className="font-headline text-4xl font-bold mb-6">Ready to secure your extension?</h2>
          <p className="text-xl text-muted-foreground mb-10">Join 500+ developers who trust Weblock for their extension security.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full px-12 h-14 text-lg" asChild>
              <Link href="/register">Create Your Account</Link>
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full px-12 h-14 text-lg" asChild>
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}