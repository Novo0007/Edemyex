'use client';
import { useState, useEffect, useRef } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock, Clapperboard, Star, Heart, PlayCircle } from 'lucide-react';
import type { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

function VideoPreviewModal({ course, isOpen, onOpenChange }: { course: Course, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const [showBuyButton, setShowBuyButton] = useState(false);
    const videoRef = useRef<HTMLIFrameElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen) {
            setShowBuyButton(false);
             // Start a 60-second timer when the modal opens
            timerRef.current = setTimeout(() => {
                setShowBuyButton(true);
                // Invalidate the video src to stop it
                if (videoRef.current) {
                    videoRef.current.src = '';
                }
            }, 60000); // 60 seconds
        }

        return () => {
             // Cleanup timer on component unmount or if modal is closed
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isOpen]);

    const handleClose = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        onOpenChange(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl p-0">
                <div className="aspect-video">
                     {!showBuyButton ? (
                        <iframe
                            ref={videoRef}
                            src={course.videoUrl}
                            title="Course video preview"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full"
                        ></iframe>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center bg-background p-8 text-center">
                             <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Enjoying the preview?</DialogTitle>
                                <DialogDescription className="text-lg text-muted-foreground">
                                    Purchase the course to get full access to all lessons and materials.
                                </DialogDescription>
                            </DialogHeader>
                            <Button size="lg" className="mt-6" asChild>
                                <Link href={`/courses/${course.id}/checkout`}>Buy now for ₹{course.price.toFixed(2)}</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function CourseDetailsClient({ course }: { course: Course }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPreviewing, setIsPreviewing] = useState(false);

  const { user } = useUser();
  const firestore = useFirestore();

  const isFavorited = user?.favoriteCreatorIds?.includes(course?.creatorId || '');

  const handleFavoriteCreator = async () => {
    if (!course || !user || !firestore) return;
    
    const userRef = doc(firestore, 'users', user.uid);
    try {
        if(isFavorited) {
            await updateDoc(userRef, { favoriteCreatorIds: arrayRemove(course.creatorId) });
            toast({
                title: 'Creator Unfavorited',
                description: `You've removed ${course.creator} from your favorites.`,
            });
        } else {
            await updateDoc(userRef, { favoriteCreatorIds: arrayUnion(course.creatorId) });
            toast({
                title: 'Creator Favorited!',
                description: `You've added ${course.creator} to your favorites.`,
            });
        }
    } catch (error) {
        toast({ title: 'Something went wrong', variant: 'destructive' });
        console.error("Favorite error:", error);
    }
  }

  if (!course) {
    notFound();
  }

  const totalDurationMinutes = course.videos ? Math.floor(course.videos.reduce((acc, v) => acc + v.duration, 0) / 60) : 0;

  return (
    <>
    <VideoPreviewModal course={course} isOpen={isPreviewing} onOpenChange={setIsPreviewing} />
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="mb-2 font-headline text-4xl font-bold">{course.title}</h1>
          <p className="mb-4 text-lg text-muted-foreground">{course.description}</p>
          <div className="mb-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">4.7</span>
              <span>(1,234 ratings)</span>
            </div>
            <span>12,345 students</span>
          </div>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Avatar>
                <AvatarImage src={course.creatorAvatar} alt={course.creator} />
                <AvatarFallback>{course.creator?.charAt(0)}</AvatarFallback>
                </Avatar>
                <p>
                Created by <span className="font-semibold text-primary">{course.creator}</span>
                </p>
            </div>
             {user && (
                 <Button variant="outline" size="sm" onClick={handleFavoriteCreator}>
                    <Heart className={cn("mr-2 size-4", isFavorited && "fill-destructive text-destructive")} />
                    {isFavorited ? 'Favorited' : 'Favorite Creator'}
                </Button>
            )}
          </div>
          <Separator />
          <div className="mt-6">
            <h2 className="mb-4 font-headline text-2xl font-bold">Course content</h2>
            <div className="space-y-3">
              {course.videos?.map((video, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border bg-white p-3">
                  <div className="flex items-center gap-3">
                    <Clapperboard className="size-5 text-muted-foreground" />
                    <span className="font-medium">{video.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.floor(video.duration / 60)} min</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-24 rounded-lg border bg-card shadow-lg">
             <div className="relative h-56 w-full group">
                <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    className="rounded-t-lg object-cover"
                />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-20 w-20" onClick={() => setIsPreviewing(true)}>
                        <PlayCircle className="h-16 w-16 text-white" />
                    </Button>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <Button variant="secondary" size="sm" className="pointer-events-none">
                        Play Preview
                    </Button>
                </div>
            </div>
            <div className="p-6">
              <p className="mb-4 text-4xl font-bold text-primary">₹{course.price.toFixed(2)}</p>
               {user && user.purchasedCourseIds?.includes(course.id) ? (
                 <Button size="lg" className="w-full" asChild>
                    <Link href={`/my-courses/${course.id}`}>Go to Course</Link>
                </Button>
               ) : (
                <Button size="lg" className="w-full" asChild>
                    <Link href={`/courses/${course.id}/checkout`}>Buy now</Link>
                </Button>
               )}
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <h4 className="font-semibold text-foreground">This course includes:</h4>
                <p className="flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>{totalDurationMinutes} minutes of on-demand video</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clapperboard className="size-4" />
                  <span>{course.videos?.length || 0} lessons</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
