
'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Code,
  Music,
  Palette,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CourseCard from '@/components/course-card';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { Course } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { name: 'Programming', icon: <Code className="size-5" /> },
  { name: 'Design', icon: <Palette className="size-5" /> },
  { name: 'Music', icon: <Music className="size-5" /> },
  { name: 'Arts', icon: <BookOpen className="size-5" /> },
];

function HeroSection({ courses }: { courses: Course[] | null }) {
    return (
         <section className="bg-primary/10">
            <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-16 text-center md:grid-cols-2 md:gap-16 md:py-24 md:text-left">
            <div className="flex flex-col items-center gap-4 md:items-start">
                <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Unlock Your Potential
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
                Explore thousands of hands-on creative courses. All taught by real-world experts.
                </p>
                <div className="mt-4 flex gap-4">
                <Button size="lg" asChild>
                    <Link href="#courses">
                    Explore Courses
                    <ArrowRight className="ml-2 size-5" />
                    </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white" asChild>
                    <Link href="/create">Become a Creator</Link>
                </Button>
                </div>
            </div>
            <div className="relative hidden h-80 w-full md:block">
                <div className="absolute -right-4 -top-4 size-24 rounded-full bg-accent/50" />
                <div className="absolute -bottom-8 -left-8 size-40 rounded-lg bg-primary/20" />
                {courses && courses.length > 0 && 
                <Card className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-3 transform p-4 shadow-2xl">
                    <CourseCard course={courses[0]} className="w-72" />
                </Card>
                }
                {courses && courses.length > 2 && 
                <Card className="absolute left-[calc(50%-10rem)] top-[calc(50%+4rem)] -translate-x-1/2 -translate-y-1/2 -rotate-6 transform p-4 shadow-2xl">
                    <CourseCard course={courses[2]} className="w-64" />
                </Card>
                }
            </div>
            </div>
        </section>
    );
}

function HomeSkeleton() {
    return (
        <div className="flex flex-col gap-8 md:gap-12">
            <section className="bg-primary/10">
                <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-16 text-center md:grid-cols-2 md:gap-16 md:py-24 md:text-left">
                    <div className="flex flex-col items-center gap-4 md:items-start">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-2/3" />
                         <div className="mt-4 flex gap-4">
                            <Skeleton className="h-12 w-40" />
                            <Skeleton className="h-12 w-40" />
                        </div>
                    </div>
                     <div className="relative hidden h-80 w-full md:block">
                        <Skeleton className="h-full w-full" />
                    </div>
                </div>
            </section>
             <section className="container mx-auto px-4" id="courses">
                <div className="mb-8 flex flex-col items-center gap-6">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-12 w-full max-w-2xl rounded-full" />
                </div>
                 <div className="space-y-12">
                    {[...Array(2)].map((_, i) => (
                        <div key={i}>
                            <Skeleton className="h-8 w-1/4 mb-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, j) => (
                                    <div key={j} className="space-y-3">
                                        <Skeleton className="h-48 w-full" />
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                 </div>
             </section>
        </div>
    )
}

export default function HomePageClient() {
  const firestore = useFirestore();

  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'courses'), where('status', '==', 'published'));
  }, [firestore]);

  const recommendedCoursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'courses'), where('status', '==', 'published'), limit(3));
  }, [firestore]);

  const { data: courses, isLoading: isLoadingCourses } = useCollection<Course>(coursesQuery);
  const { data: recommendedCourses, isLoading: isLoadingRecommended } = useCollection<Course>(recommendedCoursesQuery);
  
  if (isLoadingCourses || isLoadingRecommended) {
      return <HomeSkeleton />;
  }

  const coursesByCategory = categories.reduce((acc, category) => {
    const filteredCourses = courses?.filter(course => course.category === category.name) || [];
    if (filteredCourses.length > 0) {
      acc[category.name] = filteredCourses;
    }
    return acc;
  }, {} as Record<string, Course[]>);

  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <HeroSection courses={courses} />

      <section className="container mx-auto px-4" id="courses">
        <div className="mb-8 flex flex-col items-center gap-6">
          <h2 className="font-headline text-3xl font-bold md:text-4xl">
            Find Your Next Passion
          </h2>
          <div className="w-full max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for courses..."
                className="w-full rounded-full bg-white py-6 pl-12 shadow-sm"
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button key={category.name} variant="outline" className="gap-2 rounded-full bg-white/50">
                  {category.icon}
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {Object.entries(coursesByCategory).map(([category, categoryCourses]) => (
            <div key={category}>
              <h3 className="mb-4 font-headline text-2xl font-bold">{category}</h3>
              <Carousel
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent>
                  {categoryCourses.map((course) => (
                    <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                       <CourseCard course={course} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex"/>
              </Carousel>
            </div>
          ))}
        </div>
      </section>

      {recommendedCourses && recommendedCourses.length > 0 && (
        <section className="bg-background">
          <div className="container mx-auto px-4 py-16">
            <Card className="border-0 bg-primary/20 shadow-none">
              <CardHeader>
                <CardTitle className="font-headline text-3xl font-bold tracking-tight">AI Recommendations</CardTitle>
                <CardDescription className="text-lg">
                  Courses picked just for you by our AI, based on your interests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Carousel
                  opts={{
                    align: "start",
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {recommendedCourses.map((course) => (
                      <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3">
                        <CourseCard course={course} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex" />
                  <CarouselNext className="hidden md:flex" />
                </Carousel>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
