'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Purchase, User, Course } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

type EnrichedPurchase = Purchase & {
    userName?: string;
    userEmail?: string;
    courseTitle?: string;
};

// Custom hook to enrich purchase data with user and course details
function useEnrichedPurchases(purchases: Purchase[] | null) {
    const firestore = useFirestore();
    const [enrichedData, setEnrichedData] = useState<EnrichedPurchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!purchases || !firestore) {
            setIsLoading(false);
            return;
        };

        const enrich = async () => {
            setIsLoading(true);
            const userIds = [...new Set(purchases.map(p => p.userId))];
            const courseIds = [...new Set(purchases.map(p => p.courseId))];

            const users: Record<string, User> = {};
            const courses: Record<string, Course> = {};

            // In a real app with many users/courses, this should be paginated or handled server-side
            // For this example, we fetch them in batches.
            if (userIds.length > 0) {
                 const userDocs = await firestore.collection('users').where('id', 'in', userIds.slice(0, 10)).get();
                 userDocs.forEach(doc => users[doc.id] = doc.data() as User);
            }
             if (courseIds.length > 0) {
                 const courseDocs = await firestore.collection('courses').where('id', 'in', courseIds.slice(0, 10)).get();
                 courseDocs.forEach(doc => courses[doc.id] = doc.data() as Course);
            }

            const data = purchases.map(p => ({
                ...p,
                userName: users[p.userId]?.name || 'N/A',
                userEmail: users[p.userId]?.email || 'N/A',
                courseTitle: courses[p.courseId]?.title || 'N/A',
            }));

            setEnrichedData(data);
            setIsLoading(false);
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
