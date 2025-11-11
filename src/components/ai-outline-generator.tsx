'use client';
import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { generateCourseOutline } from '@/app/actions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AiOutlineGenerator() {
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your course.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    const result = await generateCourseOutline(topic);
    setOutline(result);
    setIsLoading(false);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(outline);
    toast({
        title: "Copied to clipboard!",
        description: "You can now paste the outline in the description field."
    });
  }

  return (
    <Card className="bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
          <Wand2 className="text-primary" />
          AI Course Outline Generator
        </CardTitle>
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
        {outline && (
          <div className="space-y-2">
            <Label>Generated Outline</Label>
            <Textarea readOnly value={outline} rows={10} className="bg-background font-mono text-sm" />
            <Button type="button" variant="secondary" onClick={handleCopy}>Copy Outline</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
