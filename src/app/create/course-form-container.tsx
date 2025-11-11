'use client';

import { useState } from 'react';
import AiOutlineGenerator from '@/components/ai-outline-generator';
import CourseCreationForm from '@/components/course-creation-form';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function CourseFormContainer() {
  const [description, setDescription] = useState('');
  const [outline, setOutline] = useState('');
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const handleOutlineChange = (newOutline: string) => {
    setOutline(newOutline);
  };
  
    if (isUserLoading) {
        return <Skeleton className="h-96 w-full" />
    }

    if (!user) {
        router.push('/login');
        return null;
    }


  return (
    <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center gap-4 bg-muted/40 p-4">
            <Avatar className="h-14 w-14 border">
                <AvatarImage src={user.profileImageUrl} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="text-sm text-muted-foreground">You are creating as</p>
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{user.name}</h2>
                    {user.creatorStatus === 'approved' && (
                         <Badge variant="outline" className="flex items-center gap-1 border-green-600 text-green-600">
                           <CheckCircle className="h-3 w-3" />
                           Verified Creator
                        </Badge>
                    )}
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
            <CourseCreationForm
                outline={outline}
                onDescriptionChange={setDescription}
                onOutlineChange={setOutline}
            >
                <AiOutlineGenerator 
                    description={description} 
                    onOutlineChange={handleOutlineChange} 
                />
            </CourseCreationForm>
        </CardContent>
    </Card>

  );
}
