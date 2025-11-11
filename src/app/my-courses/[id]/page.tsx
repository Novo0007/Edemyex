'use client';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { CheckCircle, Clock, Clapperboard, Lock } from 'lucide-react';
import type { Course, User } from '@/lib/types';
import { getCourseById, getUserById } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyCourseViewerPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const { id } = params;

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      const courseData = await getCourseById(id as string);
      const userData = await getUserById('user-1');

      if (courseData) {
        setCourse(courseData);
        if (courseData.videos.length > 0) {
          setActiveVideoUrl(courseData.videos[0].url);
        }
      }
      if (userData) {
        setUser(userData);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [id]);

  if (isLoading) {
    return <CourseViewerSkeleton />;
  }

  if (!course || !user || !user.purchasedCourses.includes(course.id)) {
    notFound();
  }

  const totalDurationMinutes = Math.floor(course.videos.reduce((acc, v) => acc + v.duration, 0) / 60);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row">
      <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <div className="aspect-video bg-black">
          {activeVideoUrl && (
            <iframe
              src={activeVideoUrl}
              title="Course video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            ></iframe>
          )}
        </div>
        <div className="p-6">
          <h1 className="mb-2 font-headline text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
        </div>
      </main>
      <aside className="w-full border-l bg-card md:w-80 lg:w-96">
        <div className="flex h-full flex-col">
          <div className="p-4">
            <h2 className="font-headline text-xl font-semibold">Course Content</h2>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clapperboard className="size-4" />{course.videos.length} lessons</span>
                <span className="flex items-center gap-1.5"><Clock className="size-4" />{totalDurationMinutes} min</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-1 p-2">
              {course.videos.map((video, index) => (
                <li key={index}>
                  <button
                    onClick={() => setActiveVideoUrl(video.url)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-md p-3 text-left transition-colors hover:bg-accent/50',
                      activeVideoUrl === video.url && 'bg-accent'
                    )}
                  >
                    <CheckCircle className="mt-1 size-5 shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{video.title}</p>
                      <p className="text-sm text-muted-foreground">{Math.floor(video.duration / 60)} min</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

function CourseViewerSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row">
      <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <Skeleton className="aspect-video w-full" />
        <div className="p-6">
          <Skeleton className="mb-2 h-8 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="mt-2 h-5 w-5/6" />
        </div>
      </main>
      <aside className="w-full border-l bg-card md:w-80 lg:w-96">
        <div className="p-4">
          <Skeleton className="h-7 w-1/2" />
        </div>
        <div className="space-y-3 p-2">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      </aside>
    </div>
  );
}
