'use client';
import Link from 'next/link';
import CourseCard from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import type { Course, User } from '@/lib/types';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

function FavoriteCreators() {
    const { user } = useUser();
    const firestore = useFirestore();

    const favoriteCreatorsQuery = useMemoFirebase(() => {
        if (!firestore || !user || !user.favoriteCreatorIds || user.favoriteCreatorIds.length === 0) return null;
        return query(collection(firestore, 'users'), where('id', 'in', user.favoriteCreatorIds));
    }, [firestore, user?.favoriteCreatorIds]);

    const { data: favoriteCreators, isLoading } = useCollection<User>(favoriteCreatorsQuery);

    if (isLoading) {
        return <FavoriteCreatorsSkeleton />;
    }

    if (!favoriteCreators || favoriteCreators.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-12 text-center">
                <h3 className="text-lg font-semibold">No favorite creators yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Browse courses and favorite the creators you love.
                </p>
            </div>
        );
    }
    
    return (
        <Card>
            <CardContent className="p-4">
                <ul className="space-y-4">
                    {favoriteCreators.map(creator => (
                         <li key={creator.id} className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={creator.profileImageUrl} alt={creator.name} />
                                <AvatarFallback>{creator.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{creator.name}</span>
                            {/* In a real app, this would link to a creator's public profile page */}
                            <Button variant="outline" size="sm" className="ml-auto" disabled>View</Button>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

function MyCourses() {
    const { user } = useUser();
    const firestore = useFirestore();

    const purchasedCoursesQuery = useMemoFirebase(() => {
        if (!firestore || !user || !user.purchasedCourseIds || user.purchasedCourseIds.length === 0) return null;
        return query(collection(firestore, 'courses'), where('id', 'in', user.purchasedCourseIds));
    }, [firestore, user?.purchasedCourseIds]);

    const { data: purchasedCourses, isLoading } = useCollection<Course>(purchasedCoursesQuery);

    if (isLoading) {
        return <MyCoursesSkeleton />;
    }

    if (!purchasedCourses || purchasedCourses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-12 text-center">
                <h2 className="text-xl font-semibold">Your library is empty</h2>
                <p className="mt-2 text-muted-foreground">
                    You haven't purchased any courses yet.
                </p>
                <Button asChild className="mt-4">
                    <Link href="/">Browse Courses</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {purchasedCourses.map((course) => (
                <CourseCard
                    key={course.id}
                    course={course}
                    linkHref={`/my-courses/${course.id}`}
                />
            ))}
        </div>
    );
}

export default function MyCoursesPage() {
  const { user, isUserLoading } = useUser();

  if(isUserLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-8 font-headline text-4xl font-bold">My Dashboard</h1>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2">
                    <h2 className="mb-4 font-headline text-2xl font-bold">My Courses</h2>
                    <MyCoursesSkeleton />
                </div>
                <div className="space-y-6">
                    <h2 className="font-headline text-2xl font-bold">Favorite Creators</h2>
                    <FavoriteCreatorsSkeleton />
                </div>
            </div>
        </div>
    )
  }

  if (!user) {
    // Or a redirect
    return (
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
             <h1 className="mb-4 font-headline text-3xl font-bold">Please Log In</h1>
             <p className="mb-8 text-lg text-muted-foreground">You need to be logged in to see your dashboard.</p>
             <Button asChild>
                <Link href="/login">Go to Login</Link>
             </Button>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 font-headline text-4xl font-bold">My Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
            <h2 className="mb-4 font-headline text-2xl font-bold">My Courses</h2>
            <MyCourses />
        </div>

        <div className="space-y-6">
            <h2 className="font-headline text-2xl font-bold">Favorite Creators</h2>
            <FavoriteCreators />
        </div>
      </div>
    </div>
  );
}


function MyCoursesSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
    )
}

function FavoriteCreatorsSkeleton() {
    return (
        <Card>
            <CardContent className="p-4">
                <ul className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <li key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-5 flex-1" />
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}
