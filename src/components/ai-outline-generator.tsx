'use client';
import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { generateCourseOutline } from '@/app/actions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { useToast } from '@/hooks/use-toast';

interface AiOutlineGeneratorProps {
  description: string;
  onOutlineChange: (outline: string) => void;
}

export default function AiOutlineGenerator({ description, onOutlineChange }: AiOutlineGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic || !description) {
      toast({
        title: "Topic and Description required",
        description: "Please enter a topic and description for your course.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateCourseOutline(topic, description);
      onOutlineChange(result);
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
    setIsLoading(false);
  };
  

  return (
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
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The Basics of Digital Marketing"
            />
            <Button type="button" onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Outline'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    