import Link from 'next/link';
import CourseCard from '@/components/course-card';
import { getPurchasedCourses, getUserById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

async function getFavoriteCreators(userId: string) {
    const user = await getUserById(userId);
    if (!user) return [];
    
    // This is a mock implementation. In a real app, you'd fetch creator details.
    const allCreators = [
        { id: 'user-avatar-1', name: 'Jane Doe', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjI4MDgwNTN8MA&ixlib=rb-4.1.0&q=80&w=1080' },
        { id: 'user-avatar-2', name: 'John Smith', avatarUrl: 'https://images.unsplash.com/photo-1535643302794-19c3804b874b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8cGVyc29uJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzYyODA4MDUzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
        { id: 'user-avatar-3', name: 'Emily White', avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjI4MDgwNTN8MA&ixlib=rb-4.1.0&q=80&w=1080' },
        { id: 'user-avatar-4', name: 'Alex Green', avatarUrl: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjI4MDgwNTN8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    ];
    
    return allCreators.filter(c => user.favoriteCreatorIds.includes(c.id));
}


export default async function MyCoursesPage() {
  const purchasedCourses = await getPurchasedCourses('user-1');
  const favoriteCreators = await getFavoriteCreators('user-1');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 font-headline text-4xl font-bold">My Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
            <h2 className="mb-4 font-headline text-2xl font-bold">My Courses</h2>
            {purchasedCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

        <div className="space-y-6">
            <h2 className="font-headline text-2xl font-bold">Favorite Creators</h2>
            {favoriteCreators.length > 0 ? (
            <Card>
                <CardContent className="p-4">
                    <ul className="space-y-4">
                        {favoriteCreators.map(creator => (
                             <li key={creator.id} className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={creator.avatarUrl} alt={creator.name} />
                                    <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{creator.name}</span>
                                <Button variant="outline" size="sm" className="ml-auto">View</Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            ) : (
                 <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-12 text-center">
                    <h3 className="text-lg font-semibold">No favorite creators yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Browse courses and favorite the creators you love.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
