'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createCourseAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AiOutlineGenerator from './ai-outline-generator';

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
  const initialState = { errors: {}, success: false, courseId: null };
  const [state, dispatch] = useFormState(createCourseAction, initialState);

  useEffect(() => {
    if (state.success && state.courseId) {
      toast({
        title: 'Success!',
        description: 'Your course has been created.',
      });
      router.push(`/my-courses/${state.courseId}`);
    } else if (state.errors?._form) {
      toast({
        title: 'Error',
        description: state.errors._form.join(', '),
        variant: 'destructive',
      });
    }
  }, [state, router, toast]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Course Details</CardTitle>
        <CardDescription>Fill in the details for your new course.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" name="title" placeholder="e.g., Introduction to Web Development" required />
            {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title}</p>}
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
            {state.errors?.category && <p className="text-sm text-destructive">{state.errors.category}</p>}
          </div>
          
          <AiOutlineGenerator />

          <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <Textarea id="description" name="description" placeholder="Describe your course in detail..." rows={8} required />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input id="price" name="price" type="number" step="0.01" placeholder="e.g., 49.99" required />
            {state.errors?.price && <p className="text-sm text-destructive">{state.errors.price}</p>}
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
