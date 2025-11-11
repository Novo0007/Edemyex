'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';


export default function AdminCreatorsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const pendingCreatorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('creatorStatus', '==', 'pending'));
    }, [firestore]);
    const { data: pendingCreators, isLoading: isLoadingPending } = useCollection<User>(pendingCreatorsQuery);

    const approvedCreatorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('creatorStatus', '==', 'approved'));
    }, [firestore]);
    const { data: approvedCreators, isLoading: isLoadingApproved } = useCollection<User>(approvedCreatorsQuery);

    const handleVerification = async (userId: string, newStatus: 'approved' | 'rejected') => {
        if (!firestore) return;
        const userRef = doc(firestore, 'users', userId);
        try {
            const updates: { creatorStatus: string; role?: 'creator' | 'user' } = { creatorStatus: newStatus };
            if (newStatus === 'approved') {
                updates.role = 'creator';
            } else {
                updates.role = 'user';
            }
            await updateDoc(userRef, updates);
            toast({
                title: `Creator ${newStatus}`,
                description: `The creator has been successfully ${newStatus}.`,
            });
        } catch (error) {
            toast({
                title: 'Error updating status',
                description: 'There was a problem updating the creator status.',
                variant: 'destructive',
            });
        }
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Creator Management</h1>
                <p className="text-muted-foreground">
                Verify new creators and manage existing ones.
                </p>
            </div>
            <Tabs defaultValue="pending">
                 <TabsList>
                    <TabsTrigger value="pending">Pending Applications</TabsTrigger>
                    <TabsTrigger value="approved">Approved Creators</TabsTrigger>
                </TabsList>
                 <TabsContent value="pending">
                     <Card>
                        <CardHeader>
                        <CardTitle>Creator Verification</CardTitle>
                        <CardDescription>Review and approve pending creator applications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <CreatorTable
                                users={pendingCreators}
                                isLoading={isLoadingPending && !pendingCreators}
                                onApprove={(id) => handleVerification(id, 'approved')}
                                onReject={(id) => handleVerification(id, 'rejected')}
                                isPending
                           />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="approved">
                    <Card>
                        <CardHeader>
                        <CardTitle>Approved Creators</CardTitle>
                        <CardDescription>List of all verified creators on the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CreatorTable
                                users={approvedCreators}
                                isLoading={isLoadingApproved && !approvedCreators}
                           />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

interface CreatorTableProps {
    users: User[] | null;
    isLoading: boolean;
    onApprove?: (userId: string) => void;
    onReject?: (userId: string) => void;
    isPending?: boolean;
}

function CreatorTable({ users, isLoading, onApprove, onReject, isPending = false }: CreatorTableProps) {
    if (isLoading) {
        return <CreatorTableSkeleton />;
    }
    
    if (!users || users.length === 0) {
        return <p className="text-center text-muted-foreground py-8">No creators found in this category.</p>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    {isPending && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <Badge variant={
                                user.creatorStatus === 'approved' ? 'default' 
                                : user.creatorStatus === 'pending' ? 'secondary' 
                                : 'destructive'
                            }>
                                {user.creatorStatus}
                            </Badge>
                        </TableCell>
                        {isPending && (
                            <TableCell className="text-right space-x-2">
                                <Button size="sm" onClick={() => onApprove?.(user.id)}>Approve</Button>
                                <Button size="sm" variant="destructive" onClick={() => onReject?.(user.id)}>Reject</Button>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function CreatorTableSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                </div>
            ))}
        </div>
    )
}
