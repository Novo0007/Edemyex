'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import PayoutDetailsForm from '@/components/payout-details-form';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Landmark, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const mockPayouts: any[] = [];

export default function CreatorPayoutsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);

    if (isUserLoading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <div>Please log in.</div>
    }

    const hasUpi = user.payoutDetails?.upiId;
    const hasBank = user.payoutDetails?.bank?.accountNumber && user.payoutDetails?.bank?.ifsc;
    const payoutMethodConfigured = hasUpi || hasBank;

    const handleRequestPayout = async () => {
        if (!user || !firestore) return;
        
        setIsRequesting(true);
        const userRef = doc(firestore, 'users', user.uid);

        try {
            await updateDoc(userRef, { payoutRequested: true });
            toast({
                title: 'Payout Requested',
                description: 'Your request has been submitted and will be reviewed by an admin.',
            });
        } catch (error) {
            toast({
                title: 'Request Failed',
                description: 'Could not submit your payout request.',
                variant: 'destructive',
            });
        } finally {
            setIsRequesting(false);
        }
    }


    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Payouts</h1>
                        <p className="text-muted-foreground">
                            Manage your payout settings and view your payout history.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Payout History</CardTitle>
                            <CardDescription>A record of all your past payouts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockPayouts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24">No payout history found.</TableCell>
                                        </TableRow>
                                    ) : mockPayouts.map((payout) => (
                                        <TableRow key={payout.id}>
                                            <TableCell>{payout.date}</TableCell>
                                            <TableCell>{payout.amount}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={payout.status === 'Completed' ? 'outline' : 'secondary'}
                                                    className={payout.status === 'Completed' ? 'text-green-600 border-green-600' : ''}
                                                >
                                                    {payout.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payout Method</CardTitle>
                                <CardDescription>Your configured payment details.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {payoutMethodConfigured ? (
                                    <div className="space-y-3">
                                        {hasUpi && (
                                            <div className="flex items-start gap-3">
                                                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="font-medium">UPI</p>
                                                    <p className="text-sm text-muted-foreground">{user?.payoutDetails?.upiId}</p>
                                                </div>
                                            </div>
                                        )}
                                        {hasBank && (
                                            <div className="flex items-start gap-3">
                                                <Landmark className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="font-medium">Bank Account</p>
                                                    <p className="text-sm text-muted-foreground">Ending in ••••{user?.payoutDetails?.bank?.accountNumber?.slice(-4)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground text-sm py-4">
                                        <p>You have not configured your payout method.</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        {payoutMethodConfigured ? 'Update Payout Method' : 'Setup Payouts'}
                                    </Button>
                                </DialogTrigger>
                            </CardFooter>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Request Payout</CardTitle>
                                <CardDescription>Withdraw your available balance.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <p className="text-sm text-muted-foreground">Available for Payout</p>
                                <p className="text-3xl font-bold">₹0.00</p>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full" 
                                    disabled={!payoutMethodConfigured || isRequesting || user.payoutRequested}
                                    onClick={handleRequestPayout}
                                >
                                     {isRequesting ? <Loader2 className="animate-spin" /> : (user.payoutRequested ? 'Request Pending' : 'Request Payout')}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
             <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Payout Details</DialogTitle>
                    <DialogDescription>
                        Manage your payment information. This information is kept secure and will only be used for processing your earnings.
                    </DialogDescription>
                </DialogHeader>
                <PayoutDetailsForm user={user} onSave={() => setIsModalOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
