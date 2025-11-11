import Link from 'next/link';
import CourseCard from '@/components/course-card';
import { getPurchasedCourses } from '@/lib/data';
import { Button } from '@/components/ui/button';

export default async function MyCoursesPage() {
  const purchasedCourses = await getPurchasedCourses('user-1');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 font-headline text-4xl font-bold">My Courses</h1>
      {purchasedCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {purchasedCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course}
              linkHref={`/my-courses/${course.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-12 text-center">
          <h2 className="text-xl font-semibold">Your library is empty</h2>
          <p className="mt-2 text-muted-foreground">
            You haven't purchased any courses yet.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">Browse Courses</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
