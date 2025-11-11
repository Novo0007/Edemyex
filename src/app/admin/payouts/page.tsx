import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AdminPayoutsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payout Management</h1>
        <p className="text-muted-foreground">
          Manage creator payout requests.
        </p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Pending Payouts</CardTitle>
          <CardDescription>Review and process payout requests from creators.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Payout management interface will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
