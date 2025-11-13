'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AiOutlineGenerator from '@/components/ai-outline-generator';
import CourseCreationForm from '@/components/course-creation-form';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CourseFormContainer() {
  const [description, setDescription] = useState('');
  const [outline, setOutline] = useState('');
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null; // Redirect is handled by useEffect
  }
  
  if (user.role === 'creator' || user.role === 'admin') {
    return (
      <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center gap-4 bg-muted/40 p-4">
              <Avatar className="h-14 w-14 border">
                  <AvatarImage src={user.profileImageUrl} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                  <p className="text-sm text-muted-foreground">You are creating as</p>
                  <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{user.name}</h2>
                      {(user.creatorStatus === 'approved' || user.role === 'admin') && (
                           <Badge variant="outline" className="flex items-center gap-1 border-green-600 text-green-600">
                             <CheckCircle className="h-3 w-3" />
                             Verified Creator
                          </Badge>
                      )}
                  </div>
              </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
              <CourseCreationForm
                  outline={outline}
                  onDescriptionChange={setDescription}
                  onOutlineChange={setOutline}
              >
                  <AiOutlineGenerator 
                      description={description} 
                      onOutlineChange={handleOutlineChange} 
                  />
              </CourseCreationForm>
          </CardContent>
      </Card>
    );
  }
  
  // If not a creator or admin, show the appropriate message
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Creator Access Required</CardTitle>
        <CardDescription>You must be an approved creator to build courses.</CardDescription>
      </CardHeader>
      <CardContent>
        {user.creatorStatus === 'pending' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Application Pending</AlertTitle>
            <AlertDescription>
              Your creator application is currently under review. You'll be able to create courses once your application is approved.
            </AlertDescription>
          </Alert>
        )}
        {user.creatorStatus === 'none' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not a Creator</AlertTitle>
            <AlertDescription>
              Please register as a creator to start building courses. If you have already applied, your application might be under review.
            </AlertDescription>
          </Alert>
        )}
        {user.creatorStatus === 'rejected' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Application Rejected</AlertTitle>
            <AlertDescription>
              Unfortunately, your creator application was not approved at this time. Please contact support for more information.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={() => router.back()}>Go Back</Button>
      </CardFooter>
    </Card>
  );
}
