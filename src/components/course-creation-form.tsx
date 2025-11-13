'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createCourseAction, generateCourseOutline } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting for Review...</> : 'Submit for Review'}
    </Button>
  );
}

export default function CourseCreationForm() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [description, setDescription] = useState('');
  const [outline, setOutline] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const initialState = { errors: {}, success: false, courseId: null };
  const [state, dispatch] = useActionState(createCourseAction, initialState);
  
  useEffect(() => {
    if (state.success && state.courseId) {
      toast({
        title: 'Success!',
        description: 'Your course has been submitted for review.',
      });
      router.push(`/creator/courses`);
    }
    const formError = state.errors?._form?.[0];
    if (formError) {
      toast({
        title: 'Error Creating Course',
        description: formError,
        variant: 'destructive',
      });
    }
  }, [state, router, toast]);

  const handleGenerateOutline = async () => {
    if (!aiTopic || !description) {
      toast({
        title: "Topic and Description required",
        description: "Please enter a topic and description for your course to use the AI assistant.",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateCourseOutline(aiTopic, description);
      setOutline(result);
      toast({
          title: "Outline Generated!",
          description: "The AI has created a new course outline for you."
      });
    } catch(e) {
        toast({
            title: "Generation Failed",
            description: "There was an issue generating the course outline.",
            variant: "destructive"
        });
    }
    setIsGenerating(false);
  };

  return (
      <form action={dispatch} className="space-y-6">
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
          <Label htmlFor="videoUrl">Main Video URL (e.g., YouTube embed)</Label>
          <Input id="videoUrl" name="videoUrl" placeholder="https://www.youtube.com/embed/your-video-id" required />
          {state.errors?.videoUrl && <p className="text-sm text-destructive">{state.errors.videoUrl[0]}</p>}
        </div>

         <div className="space-y-2">
          <Label htmlFor="imageUrl">Thumbnail Image URL</Label>
          <Input id="imageUrl" name="imageUrl" placeholder="https://images.unsplash.com/..." required />
          {state.errors?.imageUrl && <p className="text-sm text-destructive">{state.errors.imageUrl[0]}</p>}
        </div>

        <Card className="bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-xl">
                <Wand2 className="text-primary" />
                AI Course Outline Assistant
                </CardTitle>
                <CardDescription>
                Provide a topic and description, and let our AI generate a structured course outline for you. You can then edit it below.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="ai-topic">Course Topic</Label>
                <div className="flex gap-2">
                    <Input
                    id="ai-topic"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g., The Basics of Digital Marketing"
                    />
                    <Button type="button" onClick={handleGenerateOutline} disabled={isGenerating}>
                      {isGenerating ? <Loader2 className="animate-spin" /> : 'Generate'}
                    </Button>
                </div>
                </div>
            </CardContent>
        </Card>


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
        
        <SubmitButton />

      </form>
  );
}
