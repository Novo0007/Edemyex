'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, BookOpen, Users, AlertTriangle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';
import type { Course, Purchase } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function CreatorDashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    // 1. Get all courses for the current creator
    const creatorCoursesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'courses'), where('creatorId', '==', user.uid));
    }, [firestore, user]);
    const { data: creatorCourses, isLoading: isLoadingCourses } = useCollection<Course>(creatorCoursesQuery);

    // 2. Get all purchases for this creator's courses
    const purchasesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        // This is a collection group query to get all purchases across all users
        return query(collectionGroup(firestore, 'purchases'), where('creatorId', '==', user.uid));
    }, [firestore, user]);

    const { data: purchases, isLoading: isLoadingPurchases } = useCollection<Purchase>(purchasesQuery);

    const isLoading = isLoadingCourses || isLoadingPurchases;

    if (isLoading) {
        return <CreatorDashboardSkeleton />;
    }

    if (!creatorCourses || !purchases) {
        return (
             <div className="flex h-full items-center justify-center">
                <Card className="m-4">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <AlertTriangle className="size-8 text-destructive" />
                        <div>
                            <CardTitle>Error</CardTitle>
                            <CardDescription>Could not load creator dashboard data.</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    // 3. Calculate dashboard metrics
    const totalRevenue = purchases.reduce((acc, purchase) => acc + purchase.price, 0);
    const totalStudents = new Set(purchases.map(p => p.userId)).size;
    const activeCourses = creatorCourses.filter(c => c.status === 'published').length;

    // 4. Process data for sales chart
    const salesData = purchases.reduce((acc, purchase) => {
        const month = format(new Date(purchase.purchaseDate), 'MMM');
        const existing = acc.find(d => d.name === month);
        if (existing) {
            existing.sales += purchase.price;
        } else {
            acc.push({ name: month, sales: purchase.price });
        }
        return acc;
    }, [] as { name: string; sales: number }[]);

    // Ensure we have data for the last 6 months, even if sales were 0
    const last6Months = [...Array(6)].map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return format(d, 'MMM');
    }).reverse();

    const finalSalesData = last6Months.map(monthName => {
        const found = salesData.find(d => d.name === monthName);
        return found || { name: monthName, sales: 0 };
    });

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Creator Dashboard</h1>
        <p className="text-muted-foreground">
          Here's an overview of your creator activity.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              All-time earnings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Unique customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCourses}</div>
            <p className="text-xs text-muted-foreground">
              Published courses
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Your sales performance over the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent>
           {purchases.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={finalSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            borderColor: 'hsl(var(--border))',
                        }}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" name="Sales (INR)" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    <p>No sales data to display yet.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}


function CreatorDashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-32" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-32" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-32" />
                    </CardContent>
                </Card>
             </div>
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
             </Card>
        </div>
    )
}