'use client';

import { useState, useEffect } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { useUser } from '@/firebase';
import type { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { createRazorpayOrder } from '@/app/actions';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutForm({ course }: { course: Course }) {
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    
    const router = useRouter();
    
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();


    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!course || !user) {
            toast({ title: 'Please log in to purchase a course.', variant: 'destructive' });
            router.push('/login');
            return;
        }

        setIsProcessing(true);

        const orderResponse = await createRazorpayOrder(course, user.uid);

        if (!orderResponse.success || !orderResponse.order) {
            toast({
                title: 'Purchase Failed',
                description: orderResponse.error || 'Could not initiate payment.',
                variant: 'destructive',
            });
            setIsProcessing(false);
            return;
        }

        const { order } = orderResponse;

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: "Edemy",
            description: `Purchase: ${course.title}`,
            image: "/logo.png",
            order_id: order.id,
            handler: function (response: any) {
                toast({
                    title: 'Payment Successful!',
                    description: 'We are processing your purchase. You will have access shortly.',
                });
                router.push('/my-courses');
            },
            prefill: {
                name: name,
                email: email,
                contact: phone
            },
            notes: {
                courseId: course.id,
                userId: user.uid,
                creatorId: course.creatorId,
            },
            theme: {
                color: "#3399cc"
            }
        };
        
        if (!window.Razorpay) {
            toast({
                title: 'Payment Gateway Error',
                description: 'Razorpay script not loaded. Please refresh and try again.',
                variant: 'destructive',
            });
            setIsProcessing(false);
            return;
        }
        
        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', function (response: any) {
            toast({
                title: 'Payment Failed',
                description: response.error.description || 'Something went wrong.',
                variant: 'destructive',
            });
            setIsProcessing(false);
        });

        rzp.open();
    };

    if (isUserLoading) {
        return <CheckoutFormSkeleton />;
    }

    if (!course) {
        notFound();
    }
    
    if (user && user.purchasedCourseIds?.includes(course.id)) {
        router.replace(`/my-courses/${course.id}`);
        return null;
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <h1 className="mb-8 font-headline text-4xl font-bold text-center">Complete Your Purchase</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="relative h-24 w-24 flex-shrink-0">
                                    <Image src={course.imageUrl} alt={course.title} fill className="rounded-md object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{course.title}</h3>
                                    <p className="text-sm text-muted-foreground">By {course.creator}</p>
                                    <p className="mt-2 text-lg font-bold text-primary">₹{course.price.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Information</CardTitle>
                             <CardDescription>Enter your details to complete the purchase.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handlePayment}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="animate-spin" /> : `Pay ₹${course.price.toFixed(2)}`}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function CheckoutFormSkeleton() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <Skeleton className="h-10 w-3/4 mx-auto mb-8" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-24 w-24" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-full" />
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-6 w-1/4 mt-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
                 <div>
                     <Card>
                         <CardHeader>
                             <Skeleton className="h-6 w-1/2" />
                             <Skeleton className="h-4 w-3/4" />
                         </CardHeader>
                         <CardContent className="space-y-6">
                            <div className="space-y-2">
                                 <Skeleton className="h-4 w-1/4" />
                                 <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="space-y-2">
                                 <Skeleton className="h-4 w-1/4" />
                                 <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="space-y-2">
                                 <Skeleton className="h-4 w-1/4" />
                                 <Skeleton className="h-10 w-full" />
                            </div>
                         </CardContent>
                         <CardFooter>
                             <Skeleton className="h-11 w-full" />
                         </CardFooter>
                     </Card>
                 </div>
            </div>
        </div>
    )
}
