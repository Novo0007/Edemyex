'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { setDocument } from '@/firebase/non-blocking-updates';


export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'user' | 'creator'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!auth || !firestore) {
        setError("Authentication service is not available.");
        return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      
      const userDocRef = doc(firestore, 'users', user.uid);
      
      const isAdmin = email === 'mynameisjyotirmoy@gmail.com';
      const finalRole = isAdmin ? 'admin' : 'user';
      const creatorStatus = accountType === 'creator' ? 'pending' : 'none';

      await setDocument(userDocRef, {
        id: user.uid,
        name: name,
        email: user.email,
        role: finalRole,
        creatorStatus: isAdmin ? 'approved' : creatorStatus,
        purchasedCourseIds: [],
        favoriteCreatorIds: [],
        profileImageUrl: user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`,
      }, { merge: true });

      toast({
        title: 'Registration Successful',
        description: accountType === 'creator' 
            ? "Your creator application is pending review. We'll notify you upon approval."
            : 'Welcome to Edemy!',
      });
      router.push('/my-courses');

    } catch (err: any) {
      let errorMessage = 'An unexpected error occurred.';
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email address is already in use.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters long.';
            break;
          default:
            errorMessage = 'Failed to register. Please try again.';
        }
      }
      setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
          <CardDescription>Join Edemy to start learning or teaching</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
             <div className="space-y-2">
              <Label>I want to:</Label>
              <div className="flex items-center space-x-4 rounded-lg border p-2">
                <div
                  className={cn(
                    'flex-1 cursor-pointer rounded-md p-2 text-center',
                    accountType === 'user' && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => setAccountType('user')}
                >
                  Learn
                </div>
                <div
                  className={cn(
                    'flex-1 cursor-pointer rounded-md p-2 text-center',
                    accountType === 'creator' && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => setAccountType('creator')}
                >
                  Create
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || !auth || !firestore}>
              {isLoading ? <Loader2 className="animate-spin" /> : `Create ${accountType === 'creator' ? 'Creator' : 'Learner'} Account`}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Log In
              </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
