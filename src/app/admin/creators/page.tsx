import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AdminCreatorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Creator Management</h1>
        <p className="text-muted-foreground">
          Verify new creators and manage existing ones.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Creator Verification</CardTitle>
          <CardDescription>Review and approve pending creator applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Creator management interface will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
