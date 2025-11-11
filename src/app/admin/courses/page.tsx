'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import type { Course } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminCoursesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'courses');
  }, [firestore]);
  
  const { data: courses, isLoading } = useCollection<Course>(coursesQuery);

  const handleStatusChange = async (courseId: string, status: 'published' | 'rejected') => {
    if (!firestore) return;
    const courseRef = doc(firestore, 'courses', courseId);
    try {
        await setDoc(courseRef, { status }, { merge: true });
        toast({
            title: `Course ${status}`,
            description: `The course has been successfully ${status}.`,
        });
    } catch (error) {
        toast({
            title: 'Error updating status',
            description: 'There was a problem updating the course status.',
            variant: 'destructive',
        });
    }
  }

  if(isLoading) {
    return <AdminCoursesSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Course Management</h1>
        <p className="text-muted-foreground">
          Approve, edit, or remove courses.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>A list of all courses submitted to the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Creator ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses?.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.creatorId}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>
                    <Badge 
                        variant={course.status === 'published' ? 'outline' : course.status === 'pending' ? 'secondary' : 'destructive'}
                        className={course.status === 'published' ? 'text-green-600 border-green-600' : ''}
                    >
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {course.status === 'pending' && <DropdownMenuItem onClick={() => handleStatusChange(course.id, 'published')}>Approve</DropdownMenuItem>}
                        {course.status === 'pending' && <DropdownMenuItem onClick={() => handleStatusChange(course.id, 'rejected')}>Reject</DropdownMenuItem>}
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


function AdminCoursesSkeleton() {
    return (
         <div className="space-y-6">
             <div>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-10 flex-1" />
                                <Skeleton className="h-10 flex-1" />
                                <Skeleton className="h-10 flex-1" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
         </div>
    )
}
