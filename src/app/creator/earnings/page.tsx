'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const earningsData: any[] = []; // No mock data

export default function CreatorEarningsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground">
          Track your revenue and sales performance over time.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Net Revenue</CardTitle>
            <CardDescription>After platform fees and taxes.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹0.00</p>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Next Payout</CardTitle>
            <CardDescription>Scheduled for end of month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹0.00</p>
            <p className="text-sm text-muted-foreground">Available balance</p>
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings</CardTitle>
          <CardDescription>Your earnings for the current year. (Feature in development)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsData}>
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
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
