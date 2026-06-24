
'use client';

import { useState } from 'react';
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Key, Copy, Check, PowerOff, ShieldCheck, Power } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Extension, License } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ExtensionDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newLicenseEmail, setNewLicenseEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const extRef = useMemoFirebase(() => (firestore ? doc(firestore, 'extensions', params.id) : null), [firestore, params.id]);
  const { data: extension, isLoading: extLoading } = useDoc<Extension>(extRef);

  const licensesQuery = useMemoFirebase(() => {
    if (!firestore || !params.id) return null;
    return query(collection(firestore, 'extensions', params.id, 'licenses'));
  }, [firestore, params.id]);

  const { data: licenses, isLoading: licensesLoading } = useCollection<License>(licensesQuery);

  const handleCreateLicense = async () => {
    if (!firestore || !params.id || !newLicenseEmail) return;
    setIsCreating(true);
    try {
      const key = 'EXT-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      await addDoc(collection(firestore, 'extensions', params.id, 'licenses'), {
        extensionId: params.id,
        userEmail: newLicenseEmail,
        key: key,
        status: 'active',
        createdAt: serverTimestamp(),
      });
      setNewLicenseEmail('');
      toast({ title: 'License Created', description: `New key issued to ${newLicenseEmail}` });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to create license.', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleGlobalStatus = async () => {
    if (!firestore || !extension) return;
    setIsTogglingStatus(true);
    const newStatus = extension.status === 'active' ? 'locked' : 'active';
    try {
      await updateDoc(doc(firestore, 'extensions', extension.id), { status: newStatus });
      toast({ 
        title: newStatus === 'locked' ? 'Emergency Lock Engaged' : 'Protection Resumed',
        description: `Your extension is now ${newStatus}.`,
        variant: newStatus === 'locked' ? 'destructive' : 'default'
      });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to toggle status.', variant: 'destructive' });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Copied', description: 'Key copied to clipboard' });
  };

  if (extLoading || licensesLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!extension) return <div className="p-20 text-center">Extension not found.</div>;

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant={extension.status === 'active' ? 'default' : 'destructive'} className="h-8 px-4 text-sm font-bold">
            STATUS: {extension.status.toUpperCase()}
          </Badge>
          <Button 
            variant={extension.status === 'active' ? 'destructive' : 'default'} 
            onClick={toggleGlobalStatus}
            disabled={isTogglingStatus}
            className="rounded-full shadow-lg"
          >
            {isTogglingStatus ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : extension.status === 'active' ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
            {extension.status === 'active' ? 'REMOTE KILL SWITCH' : 'REVERSE LOCK'}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Integration Config
              </CardTitle>
              <CardDescription>Use these credentials in your extension source code.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground font-semibold">Extension ID</Label>
                <div className="flex items-center gap-2 p-3 bg-zinc-950 rounded-md font-mono text-sm border border-white/5">
                  {extension.id}
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => copyToClipboard(extension.id, 'ext-id')}>
                    {copiedId === 'ext-id' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground font-semibold">Secret Key (Keep private)</Label>
                <div className="flex items-center gap-2 p-3 bg-zinc-950 rounded-md font-mono text-sm border border-white/5">
                  ••••••••••••••••••••••••
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => copyToClipboard(extension.secretKey, 'secret-key')}>
                    {copiedId === 'secret-key' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Issue New License</CardTitle>
              <CardDescription>Generate a license key for a new customer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Customer Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="customer@example.com" 
                  value={newLicenseEmail} 
                  onChange={(e) => setNewLicenseEmail(e.target.value)} 
                  className="bg-zinc-950 border-white/5"
                />
              </div>
              <Button className="w-full rounded-full" onClick={handleCreateLicense} disabled={isCreating}>
                {isCreating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Generate License Key'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Issued Licenses</CardTitle>
            <CardDescription>Manage keys and access history for this extension.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>License Key</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses?.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="max-w-[150px] truncate">{license.userEmail}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        {license.key.substring(0, 12)}...
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(license.key, license.id)}>
                          {copiedId === license.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={license.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                        {license.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!licenses || licenses.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground text-sm">
                      No licenses issued yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
