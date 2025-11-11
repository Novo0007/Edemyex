import CourseCreationForm from '@/components/course-creation-form';

export default function CreateCoursePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold">Share Your Passion</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Create a new course and start teaching the world.
        </p>
      </div>
      <CourseCreationForm />
    </div>
  );
}
