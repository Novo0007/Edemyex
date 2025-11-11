
'use client';
import { useState } from 'react';
import { notFound } from 'next/navigation';
import { CheckCircle, Clock, Clapperboard } from 'lucide-react';
import type { Course } from '@/lib/types';
import { cn, getYouTubeEmbedUrl } from '@/lib/utils';
import { useUser } from '@/firebase';

export default function CourseViewerClient({ course }: { course: Course }) {
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(course?.videos?.[0]?.url || null);
  const { user, isUserLoading } = useUser();

  if (!course) {
    notFound();
  }
  
  if (!isUserLoading && user && !user.purchasedCourseIds?.includes(course.id) && user.role !== 'admin') {
      notFound();
  }

  const totalDurationMinutes = course.videos ? Math.floor(course.videos.reduce((acc, v) => acc + v.duration, 0) / 60) : 0;
  
  const embedUrl = activeVideoUrl ? getYouTubeEmbedUrl(activeVideoUrl) : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row">
      <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <div className="aspect-video bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Course video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            ></iframe>
          ) : <div className="h-full w-full flex items-center justify-center text-white">Select a video to play</div>}
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
                <span className="flex items-center gap-1.5"><Clapperboard className="size-4" />{course.videos?.length || 0} lessons</span>
                <span className="flex items-center gap-1.5"><Clock className="size-4" />{totalDurationMinutes} min</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-1 p-2">
              {course.videos?.map((video, index) => (
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
