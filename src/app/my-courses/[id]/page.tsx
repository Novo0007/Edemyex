
'use server';
import { notFound } from 'next/navigation';
import { getCourseById } from '@/lib/data';
import { getFirebaseAdmin } from '@/firebase/admin';
import { headers } from 'next/headers';
import CourseViewerClient from './course-viewer-client';
import type { User } from '@/lib/types';

async function getUser(): Promise<(User & { uid: string }) | null> {
    const authorization = headers().get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        const { auth, firestore } = getFirebaseAdmin();
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data() as User;
                // Important: Combine uid from token with spread data from doc
                return { uid: decodedToken.uid, ...userData, id: decodedToken.uid };
            }
        } catch (error) {
            console.error("Error verifying token or fetching user:", error);
            return null;
        }
    }
    return null;
}

export default async function MyCourseViewerPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    notFound();
  }

  const course = await getCourseById(id);
  const user = await getUser();

  if (!course) {
      notFound();
  }

  // Security check: allow access if user has purchased, is the creator, or is an admin
  const hasAccess = user && 
    (user.purchasedCourseIds?.includes(course.id) || 
     user.id === course.creatorId || 
     user.role === 'admin');

  if (!hasAccess) {
    notFound();
  }

  return (
    <CourseViewerClient course={course} />
  );
}
