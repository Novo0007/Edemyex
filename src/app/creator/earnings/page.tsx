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

const earningsData = [
  { name: 'Jan', earnings: 2400 },
  { name: 'Feb', earnings: 1398 },
  { name: 'Mar', earnings: 9800 },
  { name: 'Apr', earnings: 3908 },
  { name: 'May', earnings: 4800 },
  { name: 'Jun', earnings: 3800 },
  { name: 'Jul', earnings: 4300 },
];

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
            <p className="text-4xl font-bold">₹15,789.12</p>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Next Payout</CardTitle>
            <CardDescription>Scheduled for July 31, 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹8,123.45</p>
            <p className="text-sm text-muted-foreground">Available balance</p>
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings</CardTitle>
          <CardDescription>Your earnings for the current year.</CardDescription>
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