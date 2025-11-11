import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Course } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CourseCardProps {
  course: Course;
  className?: string;
  linkHref?: string;
}

export default function CourseCard({ course, className, linkHref }: CourseCardProps) {
  const href = linkHref || `/courses/${course.id}`;
  return (
    <Link href={href} className="group block">
      <Card className={cn("h-full overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1", className)}>
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover"
              data-ai-hint={course.imageHint}
            />
             <Badge className="absolute right-2 top-2 bg-accent text-accent-foreground">{course.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 font-headline text-lg font-semibold">{course.title}</h3>
          
          <div className="mb-4 flex items-center text-sm text-muted-foreground">
             <Avatar className="mr-2 h-6 w-6">
              <AvatarImage src={course.creatorAvatar} alt={course.creator} />
              <AvatarFallback>{course.creator.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{course.creator}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">4.7</span>
              <span className="text-xs text-muted-foreground">(1,234)</span>
            </div>
            <p className="text-lg font-semibold text-primary">₹{course.price.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
