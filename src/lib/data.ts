
import { getFirebaseAdmin } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Course, User } from './types';

// This file uses the Firebase Admin SDK.
// It should only be used in server-side code (Server Actions, API Routes).
// Client-side data fetching should use the hooks from `@/firebase` (useDoc, useCollection).

export async function getUserById(userId: string): Promise<User | undefined> {
  try {
    const { firestore } = getFirebaseAdmin();
    const docRef = firestore.collection('users').doc(userId);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return undefined;
  }
}

export async function getCourseById(courseId: string): Promise<Course | null> {
    try {
        const { firestore } = getFirebaseAdmin();
        const courseRef = firestore.collection('courses').doc(courseId);
        const courseSnap = await courseRef.get();

        if (courseSnap.exists) {
            return { id: courseSnap.id, ...courseSnap.data() } as Course;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching course ${courseId}:`, error);
        return null;
    }
}


export async function grantCourseAccess(userId: string, courseId: string, creatorId: string, price: number): Promise<boolean> {
    try {
        const { firestore } = getFirebaseAdmin();
        const userRef = firestore.collection('users').doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) return false;
        const userData = userSnap.data() as User;
        
        if (userData.purchasedCourseIds?.includes(courseId)) {
            console.log(`User ${userId} already owns course ${courseId}.`);
            return true;
        }

        const purchaseRef = firestore.collection(`purchases`).doc();
        await purchaseRef.set({
            id: purchaseRef.id,
            courseId: courseId,
            userId: userId,
            creatorId: creatorId,
            price: price,
            purchaseDate: FieldValue.serverTimestamp(),
        });

        await userRef.update({ 
            purchasedCourseIds: FieldValue.arrayUnion(courseId) 
        });

        return true;
    } catch (error) {
        console.error("Error granting course access:", error);
        return false;
    }
}

export async function newCourse(courseData: Omit<Course, 'id' | 'creatorId' | 'status' | 'creator' | 'creatorAvatar'>, creatorId: string): Promise<Course> {
    const { firestore } = getFirebaseAdmin();
    const coursesCollection = firestore.collection('courses');
    const docRef = coursesCollection.doc();
    
    // Fetch creator details using the standard user fetching function
    const creator = await getUserById(creatorId);

    if (!creator) {
        throw new Error('Creator not found');
    }

    const newCourseData: Course = {
        id: docRef.id,
        creatorId: creatorId,
        creator: creator.name,
        creatorAvatar: creator.profileImageUrl,
        status: 'pending',
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        category: courseData.category,
        outline: courseData.outline,
        videoUrl: courseData.videoUrl,
        imageUrl: courseData.imageUrl,
        videos: [{ title: courseData.title, url: courseData.videoUrl, duration: 0 }],
    };

    await docRef.set(newCourseData);
    return newCourseData;
}
