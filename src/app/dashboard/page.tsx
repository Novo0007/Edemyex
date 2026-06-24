
'use client';

import { useState } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, Key, ShieldAlert, Loader2, Power, PowerOff } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Extension } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DeveloperDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newExtName, setNewExtName] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const extensionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'extensions'), where('developerId', '==', user.uid));
  }, [firestore, user]);

  const { data: extensions, isLoading } = useCollection<Extension>(extensionsQuery);

  const handleAddExtension = async () => {
    if (!firestore || !user || !newExtName) return;
    setIsAdding(true);
    try {
      await addDoc(collection(firestore, 'extensions'), {
        name: newExtName,
        developerId: user.uid,
        status: 'active',
        description: '',
        secretKey: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        createdAt: serverTimestamp(),
      });
      setNewExtName('');
      toast({ title: 'Extension added', description: 'You can now start issuing licenses.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to add extension.', variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  const toggleExtensionStatus = async (extId: string, currentStatus: string) => {
    if (!firestore) return;
    setTogglingId(extId);
    const newStatus = currentStatus === 'active' ? 'locked' : 'active';
    try {
      await updateDoc(doc(firestore, 'extensions', extId), { status: newStatus });
      toast({ 
        title: newStatus === 'locked' ? 'Extension Locked' : 'Extension Activated', 
        description: `Status successfully updated to ${newStatus}.`,
        variant: newStatus === 'locked' ? 'destructive' : 'default'
      });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    } finally {
      setTogglingId(null);
    }
  };

  if (isUserLoading || isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!user) {
    return <div className="p-20 text-center">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Developer Dashboard</h1>
          <p className="text-muted-foreground">Manage your protected extensions and remote kill switches.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="mr-2 h-4 w-4" /> Add Extension
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Extension</DialogTitle>
              <DialogDescription>Register your Chrome extension to start protecting it.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Extension Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. AdBlock Pro" 
                  value={newExtName} 
                  onChange={(e) => setNewExtName(e.target.value)} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddExtension} disabled={isAdding} className="w-full">
                {isAdding ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Create Extension'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Extensions</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{extensions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <ShieldAlert className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Secure</div>
          </CardContent>
        </Card>
        <Card className="glass border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Locked Extensions</CardTitle>
            <PowerOff className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {extensions?.filter(e => e.status === 'locked').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>My Extensions</CardTitle>
          <CardDescription>View status and manage your remote kill switches.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Extension Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Remote Kill Switch</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extensions?.map((ext) => (
                <TableRow key={ext.id}>
                  <TableCell className="font-medium">{ext.name}</TableCell>
                  <TableCell>
                    <Badge variant={ext.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                      {ext.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{ext.createdAt?.toDate().toLocaleDateString() || 'Just now'}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={togglingId === ext.id}
                      onClick={() => toggleExtensionStatus(ext.id, ext.status)}
                      className={cn(
                        "rounded-full transition-all",
                        ext.status === 'active' 
                          ? "text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/50" 
                          : "text-green-500 hover:bg-green-500 hover:text-white border-green-500/50"
                      )}
                    >
                      {togglingId === ext.id ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : ext.status === 'active' ? (
                        <><PowerOff className="mr-2 h-4 w-4" /> LOCK NOW</>
                      ) : (
                        <><Power className="mr-2 h-4 w-4" /> UNLOCK</>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/extensions/${ext.id}`}>Manage Licenses</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!extensions || extensions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No extensions registered yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
