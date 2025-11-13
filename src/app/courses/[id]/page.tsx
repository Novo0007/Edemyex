'use server';
import { notFound } from 'next/navigation';
import CourseDetailsClient from './course-details-client';

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    notFound();
  }

  return <CourseDetailsClient courseId={id} />;
}
