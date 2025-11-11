'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp, getDocs, where } from 'firebase/firestore';
import type { Purchase, User, Course } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

type EnrichedPurchase = Purchase & {
    userName?: string;
    userEmail?: string;
    courseTitle?: string;
};

function useEnrichedPurchases(purchases: Purchase[] | null) {
    const firestore = useFirestore();
    const [enrichedData, setEnrichedData] = useState<EnrichedPurchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!purchases || !firestore) {
            setIsLoading(false);
            return;
        }

        const enrich = async () => {
            if (purchases.length === 0) {
                setEnrichedData([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const userIds = [...new Set(purchases.map(p => p.userId))];
            const courseIds = [...new Set(purchases.map(p => p.courseId))];

            const users: Record<string, User> = {};
            const courses: Record<string, Course> = {};

            const userPromises = [];
            for (let i = 0; i < userIds.length; i += 30) {
                const chunk = userIds.slice(i, i + 30);
                userPromises.push(getDocs(query(collection(firestore, 'users'), where('id', 'in', chunk))));
            }

            const coursePromises = [];
            for (let i = 0; i < courseIds.length; i += 30) {
                const chunk = courseIds.slice(i, i + 30);
                coursePromises.push(getDocs(query(collection(firestore, 'courses'), where('id', 'in', chunk))));
            }
            
            try {
                const userSnapshots = await Promise.all(userPromises);
                userSnapshots.forEach(snapshot => {
                    snapshot.forEach(doc => users[doc.id] = doc.data() as User);
                });

                const courseSnapshots = await Promise.all(coursePromises);
                courseSnapshots.forEach(snapshot => {
                    snapshot.forEach(doc => courses[doc.id] = doc.data() as Course);
                });
                
                const data = purchases.map(p => ({
                    ...p,
                    userName: users[p.userId]?.name || 'N/A',
                    userEmail: users[p.userId]?.email || 'N/A',
                    courseTitle: courses[p.courseId]?.title || 'N/A',
                }));

                setEnrichedData(data);
            } catch (error) {
                console.error("Error enriching purchase data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        enrich();

    }, [purchases, firestore]);

    return { data: enrichedData, isLoading };
}


export default function AdminOrdersPage() {
    const firestore = useFirestore();
    
    const purchasesQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'purchases'), orderBy('purchaseDate', 'desc'));
    }, [firestore]);
    
    const { data: purchases, isLoading: isLoadingPurchases } = useCollection<Purchase>(purchasesQuery);
    const { data: enrichedPurchases, isLoading: isLoadingEnriched } = useEnrichedPurchases(purchases);

    const isLoading = isLoadingPurchases || isLoadingEnriched;

    if (isLoading) {
        return <AdminOrdersSkeleton />
    }

    return (
        <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Order History</h1>
            <p className="text-muted-foreground">
            A log of all purchases made on the platform.
            </p>
        </div>
        <Card>
            <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>A list of all successful transactions.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {enrichedPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                    <TableCell>
                        {purchase.purchaseDate ? format((purchase.purchaseDate as Timestamp).toDate(), 'PPpp') : 'N/A'}
                    </TableCell>
                    <TableCell>
                        <div className="font-medium">{purchase.userName}</div>
                        <div className="text-sm text-muted-foreground">{purchase.userEmail}</div>
                    </TableCell>
                    <TableCell>{purchase.courseTitle}</TableCell>
                    <TableCell className="text-right font-medium">₹{purchase.price.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
                {(!enrichedPurchases || enrichedPurchases.length === 0) && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                            No orders found.
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

function AdminOrdersSkeleton() {
    return (
         <div className="space-y-6">
             <div>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-10 flex-1" />
                                <Skeleton className="h-10 flex-1" />
                                <Skeleton className="h-10 flex-1" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
         </div>
    )
}
