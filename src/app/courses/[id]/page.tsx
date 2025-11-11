'use server';
import { notFound } from 'next/navigation';
import { getCourseById } from '@/lib/data';
import CourseDetailsClient from './course-details-client';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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
          <Skeleton className="h-px w-full" />
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

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    notFound();
  }

  const course = await getCourseById(id);

  if (!course) {
    notFound();
  }

  return <CourseDetailsClient course={course} />;
}
