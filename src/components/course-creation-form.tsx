'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { createCourseAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AiOutlineGenerator from './ai-outline-generator';
import { useUser } from '@/firebase';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Creating Course...' : 'Create Course'}
    </Button>
  );
}

export default function CourseCreationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const [isPending, startTransition] = useTransition();

  const initialState = { errors: {}, success: false, courseId: null };
  // `dispatch` is not directly used, but it's the action passed to the form
  const [state, dispatch] = useFormState(createCourseAction.bind(null, user?.uid || ''), initialState);

  const [description, setDescription] = useState('');
  const [outline, setOutline] = useState('');

  const handleOutlineChange = (newOutline: string) => {
    setOutline(newOutline);
  };
  
  // Wrapper for the server action to use with startTransition
  const handleFormAction = (formData: FormData) => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to create a course.", variant: "destructive" });
        return;
    }
    startTransition(() => {
        createCourseAction(user.uid, formData).then(result => {
             if (result.success && result.courseId) {
                toast({
                    title: 'Success!',
                    description: 'Your course has been submitted for review.',
                });
                router.push(`/creator/courses`);
            } else if (result.errors) {
                const errorMessages = Object.values(result.errors).flat().join(', ');
                toast({
                    title: 'Error',
                    description: errorMessages || 'Something went wrong.',
                    variant: 'destructive',
                });
            }
        });
    });
  };


  if (isUserLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }
   if (user.role !== 'creator') {
     return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Creator Access Required</CardTitle>
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
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Not a Creator</AlertTitle>
                        <AlertDescription>
                            You must register as a creator to create courses. If you believe this is a mistake, please contact support.
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
     )
   }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Course Details</CardTitle>
        <CardDescription>Fill in the details for your new course.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleFormAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" name="title" placeholder="e.g., Introduction to Web Development" required />
            {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Programming">Programming</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.category && <p className="text-sm text-destructive">{state.errors.category[0]}</p>}
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Describe your course in detail..." 
              rows={5} 
              required 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>

           <div className="space-y-2">
            <Label htmlFor="imageUrl">Thumbnail URL</Label>
            <Input id="imageUrl" name="imageUrl" placeholder="https://your-image.com/thumbnail.png" required />
            {state.errors?.imageUrl && <p className="text-sm text-destructive">{state.errors.imageUrl[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Main Video URL (e.g., YouTube embed)</Label>
            <Input id="videoUrl" name="videoUrl" placeholder="https://www.youtube.com/embed/your-video-id" required />
            {state.errors?.videoUrl && <p className="text-sm text-destructive">{state.errors.videoUrl[0]}</p>}
          </div>

          <AiOutlineGenerator description={description} onOutlineChange={handleOutlineChange} />

          <div className="space-y-2">
            <Label htmlFor="outline">Course Outline</Label>
            <Textarea 
              id="outline" 
              name="outline" 
              placeholder="Your generated or manually written course outline..." 
              rows={10} 
              required 
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              className="bg-background font-mono text-sm"
            />
             {state.errors?.outline && <p className="text-sm text-destructive">{state.errors.outline[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (INR)</Label>
            <Input id="price" name="price" type="number" step="0.01" placeholder="e.g., 3999.00" required />
            {state.errors?.price && <p className="text-sm text-destructive">{state.errors.price[0]}</p>}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Submitting for Review...' : 'Submit for Review'}
          </Button>
          {state.errors?._form && <div className="text-sm font-medium text-destructive">{state.errors._form[0]}</div>}
        </form>
      </CardContent>
    </Card>
  );
}
