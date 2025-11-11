'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateProfileAction } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
    </Button>
  );
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const initialState = { errors: {}, success: false, message: '' };
  const [state, dispatch] = useFormState(updateProfileAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Profile Updated',
        description: state.message,
      });
    } else if (state.message) {
      toast({
        title: 'Update Failed',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  if (isUserLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
       <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold">Your Profile</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          View and manage your account details.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={user.profileImageUrl} alt={user.name || ''} />
              <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
               <Badge className="mt-2 capitalize" variant={user.role === 'admin' ? 'default' : user.role === 'creator' ? 'secondary' : 'outline'}>
                  {user.role}
                </Badge>
            </div>
          </div>
        </CardHeader>
        <form action={dispatch}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={user.name || ''} required />
              {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileImageUrl">Profile Image URL</Label>
              <Input id="profileImageUrl" name="profileImageUrl" defaultValue={user.profileImageUrl || ''} />
               {state.errors?.profileImageUrl && <p className="text-sm text-destructive">{state.errors.profileImageUrl[0]}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
