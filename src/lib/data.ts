
import { getFirebaseAdmin } from '@/firebase/admin';

import type { Course, User } from './types';
import { PlaceHolderImages } from './placeholder-images';

// This is a server-side data fetching file.
const { firestore, auth } = getFirebaseAdmin();

const getImage = (id: string) => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  if (!image) {
    return {
      imageUrl: 'https://picsum.photos/seed/error/600/400',
      imageHint: 'abstract error',
    };
  }
  return { imageUrl: image.imageUrl, imageHint: image.imageHint };
};

const coursesCollection = firestore.collection('courses');
const usersCollection = firestore.collection('users');

export async function getCourses(): Promise<Course[]> {
  try {
    // Only fetch published courses for the public listing
    const snapshot = await coursesCollection.where('status', '==', 'published').get();
    const result: Course[] = [];
    for (const d of snapshot.docs) {
      result.push({ ...(d.data() as any), id: d.id } as Course);
    }
    return result;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  try {
    const docRef = coursesCollection.doc(id);
    const docSnap = await docRef.get();
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Course;
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching course by id:", error);
    return undefined;
  }
}

export async function getUserById(userId: string): Promise<User | undefined> {
  try {
    const docRef = usersCollection.doc(userId);
    const docSnap = await docRef.get();
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return undefined;
  }
}

export async function getAdminUser(uid: string): Promise<any> {
    try {
        const userRecord = await auth.getUser(uid);
        return userRecord;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}


export async function getPurchasedCourses(userId: string): Promise<Course[]> {
    const user = await getUserById(userId);
    if (!user || !user.purchasedCourseIds || user.purchasedCourseIds.length === 0) {
        return [];
    }

    try {
        const snapshot = await coursesCollection.where('id', 'in', user.purchasedCourseIds).get();
        const result: Course[] = [];
        for (const d of snapshot.docs) {
          result.push({ ...(d.data() as any), id: d.id } as Course);
        }
        return result;
    } catch (error) {
        console.error("Error fetching purchased courses:", error);
        return [];
    }
}


export async function grantCourseAccess(userId: string, courseId: string, creatorId: string, price: number): Promise<boolean> {
    try {
        const userRef = usersCollection.doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists()) return false;
        const userData = userSnap.data() as User;
        
        // Prevent re-processing
        if (userData.purchasedCourseIds?.includes(courseId)) {
            console.log(`User ${userId} already owns course ${courseId}.`);
            return true; // Idempotent, so return success
        }

        // Create purchase record in a top-level `purchases` collection for easier querying
        const purchaseRef = firestore.collection(`purchases`).doc();
        await purchaseRef.set({
            id: purchaseRef.id,
            courseId: courseId,
            userId: userId,
            creatorId: creatorId,
            price: price,
            purchaseDate: new Date().toISOString()
        });

        // Add course to user's purchased list for quick access checks
        const updatedPurchased = [ ...(userData.purchasedCourseIds ?? []), courseId ];
        await userRef.set({ purchasedCourseIds: updatedPurchased }, { merge: true });

        return true;
    } catch (error) {
        console.error("Error granting course access:", error);
        return false;
    }
}

export async function createCourse(courseData: Omit<Course, 'id' | 'creatorId' | 'status' >, creatorId: string): Promise<Course> {
    const docRef = coursesCollection.doc(); // Create ref with new ID

    const newCourseData: Course = {
        ...courseData,
        id: docRef.id,
        creatorId: creatorId,
        status: 'pending' as const, // default status
        videos: [{ title: courseData.title, url: courseData.videoUrl, duration: 0 }],
    };
    
    await docRef.set(newCourseData);
    
    return newCourseData;
}


export async function getRecommendedCourses(): Promise<Course[]> {
  // This is a mock implementation of AI recommendations.
  // In a real app, this would involve a call to an AI service.
  const all = await getCourses();
  // return first 3 for now
  return all.slice(0, 3);
}
