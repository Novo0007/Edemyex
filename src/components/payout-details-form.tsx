
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore } from '@/firebase';
import { CombinedUser } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const payoutDetailsSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'A valid phone number is required'),
    payoutType: z.enum(['upi', 'bank']),
    upiId: z.string().optional(),
    accountNumber: z.string().optional(),
    ifsc: z.string().optional(),
}).refine(data => {
    if (data.payoutType === 'upi') return !!data.upiId;
    return true;
}, {
    message: 'UPI ID is required',
    path: ['upiId'],
}).refine(data => {
    if (data.payoutType === 'bank') return !!data.accountNumber;
    return true;
}, {
    message: 'Account number is required',
    path: ['accountNumber'],
}).refine(data => {
    if (data.payoutType === 'bank') return !!data.ifsc;
    return true;
}, {
    message: 'IFSC code is required',
    path: ['ifsc'],
});

type PayoutFormValues = z.infer<typeof payoutDetailsSchema>;

interface PayoutDetailsFormProps {
    user: CombinedUser | null;
    onSave: () => void;
}

export default function PayoutDetailsForm({ user, onSave }: PayoutDetailsFormProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const payoutType = user?.payoutDetails?.upiId ? 'upi' : (user?.payoutDetails?.bank?.accountNumber ? 'bank' : 'upi');

    const form = useForm<PayoutFormValues>({
        resolver: zodResolver(payoutDetailsSchema),
        defaultValues: {
            name: user?.payoutDetails?.name || user?.name || '',
            email: user?.payoutDetails?.email || user?.email || '',
            phone: user?.payoutDetails?.phone || '',
            payoutType: payoutType,
            upiId: user?.payoutDetails?.upiId || '',
            accountNumber: user?.payoutDetails?.bank?.accountNumber || '',
            ifsc: user?.payoutDetails?.bank?.ifsc || '',
        },
    });

    const onSubmit = async (data: PayoutFormValues) => {
        if (!user || !firestore) {
            toast({ title: 'You must be logged in.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);

        const payoutDetails: any = {
            name: data.name,
            email: data.email,
            phone: data.phone,
        };

        if (data.payoutType === 'upi') {
            payoutDetails.upiId = data.upiId;
            payoutDetails.bank = null; // Clear bank details if switching to UPI
        } else {
            payoutDetails.bank = {
                accountNumber: data.accountNumber,
                ifsc: data.ifsc,
            };
            payoutDetails.upiId = null; // Clear UPI ID if switching to bank
        }

        try {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, { payoutDetails });
            toast({
                title: 'Payout Details Saved',
                description: 'Your payment information has been updated successfully.',
            });
            onSave();
        } catch (error) {
            console.error('Failed to save payout details:', error);
            toast({
                title: 'Save Failed',
                description: 'Could not save your payout details. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const selectedPayoutType = form.watch('payoutType');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={selectedPayoutType} onValueChange={(value) => form.setValue('payoutType', value as 'upi' | 'bank')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upi">UPI</TabsTrigger>
                        <TabsTrigger value="bank">Bank Account</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upi" className="space-y-4 pt-4">
                         <FormField
                            control={form.control}
                            name="upiId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>UPI ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="yourname@okhdfcbank" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>
                     <TabsContent value="bank" className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your bank account number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="ifsc"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>IFSC Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your bank's IFSC code" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>
                </Tabs>
                
                <hr/>

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name (as per bank records)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="you@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your phone number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Save Payout Details'}
                </Button>
            </form>
        </Form>
    );
}
