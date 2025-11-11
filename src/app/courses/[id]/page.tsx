'use client';
import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock, Clapperboard, Star } from 'lucide-react';
import type { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { purchaseCourse, getCourseById } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;

  useEffect(() => {
    if (!id) return;
    async function fetchCourse() {
      const courseData = await getCourseById(id);
      if (courseData) {
        setCourse(courseData);
      }
      setIsLoading(false);
    }
    fetchCourse();
  }, [id]);

  const handlePurchase = async () => {
    if (!course) return;
    const success = await purchaseCourse('user-1', course.id);
    if (success) {
      toast({
        title: 'Purchase Successful!',
        description: `You now have access to "${course.title}".`,
      });
      router.push('/my-courses');
    } else {
      toast({
        title: 'Purchase Failed',
        description: 'You may already own this course.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    notFound();
  }

  const totalDurationMinutes = Math.floor(course.videos.reduce((acc, v) => acc + v.duration, 0) / 60);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="mb-2 font-headline text-4xl font-bold">{course.title}</h1>
          <p className="mb-4 text-lg text-muted-foreground">{course.description}</p>
          <div className="mb-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">4.7</span>
              <span>(1,234 ratings)</span>
            </div>
            <span>12,345 students</span>
          </div>
          <div className="mb-6 flex items-center gap-2">
            <Avatar>
              <AvatarImage src={course.creatorAvatar} alt={course.creator} />
              <AvatarFallback>{course.creator.charAt(0)}</AvatarFallback>
            </Avatar>
            <p>
              Created by <span className="font-semibold text-primary">{course.creator}</span>
            </p>
          </div>
          <Separator />
          <div className="mt-6">
            <h2 className="mb-4 font-headline text-2xl font-bold">Course content</h2>
            <div className="space-y-3">
              {course.videos.map((video, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border bg-white p-3">
                  <div className="flex items-center gap-3">
                    <Clapperboard className="size-5 text-muted-foreground" />
                    <span className="font-medium">{video.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.floor(video.duration / 60)} min</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-24 rounded-lg border bg-card shadow-lg">
            <div className="relative h-56 w-full">
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                className="rounded-t-lg object-cover"
                data-ai-hint={course.imageHint}
              />
            </div>
            <div className="p-6">
              <p className="mb-4 text-4xl font-bold text-primary">₹{course.price.toFixed(2)}</p>
              <Button size="lg" className="w-full" onClick={handlePurchase}>
                Buy now
              </Button>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <h4 className="font-semibold text-foreground">This course includes:</h4>
                <p className="flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>{totalDurationMinutes} minutes of on-demand video</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clapperboard className="size-4" />
                  <span>{course.videos.length} lessons</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Skeleton className="mb-2 h-10 w-3/4" />
          <Skeleton className="mb-4 h-6 w-full" />
          <Skeleton className="mb-4 h-6 w-5/6" />
          <div className="mb-6 flex items-center gap-2">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Separator />
          <div className="mt-6">
            <Skeleton className="mb-4 h-8 w-1/2" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="sticky top-24 rounded-lg border bg-card shadow-lg">
            <Skeleton className="h-56 w-full rounded-t-lg" />
            <div className="p-6">
              <Skeleton className="mb-4 h-12 w-1/2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
