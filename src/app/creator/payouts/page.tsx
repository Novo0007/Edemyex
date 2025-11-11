import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const mockPayouts: any[] = [];

export default function CreatorPayoutsPage() {
  return (
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
        <Card>
          <CardHeader>
            <CardTitle>Request Payout</CardTitle>
            <CardDescription>Withdraw your available balance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Available for Payout</p>
                <p className="text-3xl font-bold">₹0.00</p>
            </div>
             <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payout Method</p>
                <p className="font-medium">Bank Account not configured</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>Request Payout</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
