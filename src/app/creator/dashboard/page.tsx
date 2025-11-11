'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, BookOpen, Users } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import SalesChart from '@/components/sales-chart';
import { Skeleton } from '@/components/ui/skeleton';

type SalesBucket = { monthLabel: string; sales: number };
type DashboardResponse = {
  totalRevenue: number;
  totalStudents: number;
  activeCourses: number;
  salesByMonth: SalesBucket[];
};

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                             <Skeleton className="h-4 w-1/2" />
                             <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-3 w-1/2 mt-2" />
                        </CardContent>
                    </Card>
                ))}
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

export default function CreatorDashboardPage() {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const auth = getAuth();
        const current = auth.currentUser;
        if (!current) {
          setLoading(false);
          return;
        }
        const token = await current.getIdToken();
        const res = await fetch('/api/creator/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Failed to load dashboard (${res.status})`);
        }
        const payload: DashboardResponse = await res.json();
        if (mounted) setData(payload);
      } catch (e: any) {
        toast({
          title: 'Failed to load dashboard',
          description: e?.message || 'Unexpected error',
          variant: 'destructive',
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const salesChartData = (data?.salesByMonth || []).map(item => ({
    name: item.monthLabel,
    sales: item.sales,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Creator Dashboard</h1>
        <p className="text-muted-foreground">Here's an overview of your creator activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalStudents ?? 0}</div>
            <p className="text-xs text-muted-foreground">Unique purchasers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeCourses ?? 0}</div>
            <p className="text-xs text-muted-foreground">Published courses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Your sales performance over the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent>
          <SalesChart data={salesChartData} />
        </CardContent>
      </Card>
    </div>
  );
}
