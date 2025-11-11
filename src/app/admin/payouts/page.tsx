'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Banknote, Landmark, CreditCard, Mail, Phone, User as UserIcon } from 'lucide-react';

function PayoutDetailsDialog({ user, onProcess }: { user: User; onProcess: () => void; }) {
    const hasUpi = user.payoutDetails?.upiId;
    const hasBank = user.payoutDetails?.bank?.accountNumber;

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Process Payout for {user.name}</DialogTitle>
                <DialogDescription>
                    Review the creator's payout information and available balance before processing.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
                <div className="space-y-3">
                    <h4 className="font-medium text-sm">Available Balance</h4>
                    <p className="text-3xl font-bold">₹0.00</p>
                    <p className="text-xs text-muted-foreground">Note: Balance calculation is a placeholder.</p>
                </div>
                 <div className="space-y-3">
                    <h4 className="font-medium text-sm">Contact Information</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" /> <span>{user.payoutDetails?.name || user.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" /> <span>{user.payoutDetails?.email || user.email}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" /> <span>{user.payoutDetails?.phone || 'Not provided'}</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <h4 className="font-medium text-sm">Payout Method</h4>
                     <div className="text-sm rounded-md border p-4 space-y-3">
                        {!hasUpi && !hasBank && <p className="text-muted-foreground">No payout method configured.</p>}
                        {hasUpi && (
                            <div className="flex items-start gap-3">
                                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">UPI</p>
                                    <p className="text-muted-foreground">{user.payoutDetails?.upiId}</p>
                                </div>
                            </div>
                        )}
                        {hasBank && (
                            <div className="flex items-start gap-3">
                                <Landmark className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Bank Account</p>
                                    <p className="text-muted-foreground">A/C: {user.payoutDetails?.bank?.accountNumber}</p>
                                    <p className="text-muted-foreground">IFSC: {user.payoutDetails?.bank?.ifsc}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <DialogFooter className="sm:justify-end gap-2">
                 <DialogClose asChild>
                    <Button type="button" variant="secondary">
                        Close
                    </Button>
                </DialogClose>
                <Button type="button" onClick={onProcess} disabled={!hasUpi && !hasBank}>
                    Mark as Paid
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}


export default function AdminPayoutsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const payoutRequestsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('payoutRequested', '==', true));
    }, [firestore]);

    const { data: usersWithRequests, isLoading } = useCollection<User>(payoutRequestsQuery);

    const handleProcessPayout = async () => {
        if (!firestore || !selectedUser) return;

        const userRef = doc(firestore, 'users', selectedUser.id);
        try {
            await updateDoc(userRef, { payoutRequested: false });
            toast({
                title: 'Payout Processed',
                description: `Payout for ${selectedUser.name} has been marked as complete.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Could not update payout status.',
                variant: 'destructive',
            });
        } finally {
            setSelectedUser(null);
        }
    };

    return (
        <Dialog open={!!selectedUser} onOpenChange={(isOpen) => !isOpen && setSelectedUser(null)}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Payout Management</h1>
                    <p className="text-muted-foreground">
                    Manage creator payout requests.
                    </p>
                </div>
                <Card>
                    <CardHeader>
                    <CardTitle>Pending Payouts</CardTitle>
                    <CardDescription>Review and process payout requests from creators.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <PayoutsTableSkeleton />
                        ) : (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Creator</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Available Balance</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usersWithRequests && usersWithRequests.length > 0 ? (
                                        usersWithRequests.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>₹0.00</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                                                        Process Payout
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No pending payout requests.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
            {selectedUser && <PayoutDetailsDialog user={selectedUser} onProcess={handleProcessPayout} />}
        </Dialog>
    );
}

function PayoutsTableSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                    <Skeleton className="h-6 flex-1" />
                    <Skeleton className="h-6 flex-1" />
                    <Skeleton className="h-6 flex-1" />
                    <Skeleton className="h-8 w-24" />
                </div>
            ))}
        </div>
    )
}
