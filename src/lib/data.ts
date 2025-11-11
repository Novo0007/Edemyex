
import { getFirebaseAdmin } from '@/firebase/admin';

import type { Course, User } from './types';
import { PlaceHolderImages } from './placeholder-images';

// This is a server-side data fetching file.
const { firestore } = getFirebaseAdmin();

const coursesCollection = firestore.collection('courses');
const usersCollection = firestore.collection('users');

const ALLOWED_IMAGE_HOSTS = [
  'images.unsplash.com',
  'picsum.photos',
  'storage.googleapis.com',
  // Vercel avatars are also used and can be considered safe
  'avatar.vercel.sh',
];

const validateAndGetImage = (course: any) => {
    // Default placeholder in case of any issues
    const placeholder = {
        imageUrl: 'https://picsum.photos/seed/error/600/400',
    };

    if (course.imageUrl) {
        try {
            // Data URIs are allowed
            if (course.imageUrl.startsWith('data:image')) {
                 return { imageUrl: course.imageUrl };
            }
            const url = new URL(course.imageUrl);
            if (ALLOWED_IMAGE_HOSTS.includes(url.hostname)) {
                return {
                    imageUrl: course.imageUrl,
                };
            }
        } catch (e) {
            // Invalid URL format, fall through to placeholder
        }
    }
    
    // If no valid imageUrl, try to find a placeholder by category
    const categoryName = (course.category || 'default').toLowerCase();
    const categoryImage = PlaceHolderImages.find(img => img.id.includes(categoryName));
    
    return categoryImage ? 
        { imageUrl: categoryImage.imageUrl } : 
        placeholder;
};

export async function getCourses(): Promise<Course[]> {
  try {
    const snapshot = await coursesCollection.where('status', '==', 'published').get();
    const result: Course[] = [];
    for (const d of snapshot.docs) {
      const courseData = d.data() as any;
      const { imageUrl } = validateAndGetImage(courseData);
      result.push({ 
          ...courseData, 
          id: d.id,
          imageUrl,
      } as Course);
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
    if (docSnap.exists) {
      const courseData = docSnap.data() as any;
      const { imageUrl } = validateAndGetImage(courseData);
      return { 
          ...courseData, 
          id: docSnap.id,
          imageUrl,
      } as Course;
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
    if (docSnap.exists) {
      return docSnap.data() as User;
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return undefined;
  }
}

export async function getPurchasedCourses(userId: string): Promise<Course[]> {
    const user = await getUserById(userId);
    if (!user || !user.purchasedCourseIds || user.purchasedCourseIds.length === 0) {
        return [];
    }

    try {
        // Firestore 'in' queries are limited to 30 values in the array
        const courseIds = user.purchasedCourseIds.slice(0, 30);
        const snapshot = await coursesCollection.where('id', 'in', courseIds).get();
        const result: Course[] = [];
        for (const d of snapshot.docs) {
          const courseData = d.data() as any;
          const { imageUrl } = validateAndGetImage(courseData);
          result.push({ 
              ...courseData, 
              id: d.id,
              imageUrl,
          } as Course);
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

        if (!userSnap.exists) return false;
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
            purchaseDate: new Date().toISOString(), // Store as ISO 8601 string
        });

        // Add course to user's purchased list for quick access checks
        const updatedPurchased = [ ...(userData.purchasedCourseIds ?? []), courseId ];
        await userRef.update({ purchasedCourseIds: updatedPurchased });

        return true;
    } catch (error) {
        console.error("Error granting course access:", error);
        return false;
    }
}

export async function newCourse(courseData: Omit<Course, 'id' | 'creatorId' | 'status' | 'creator' | 'creatorAvatar'>, creatorId: string): Promise<Course> {
    const docRef = coursesCollection.doc();

    const creator = await getUserById(creatorId);

    if (!creator) {
        throw new Error('Creator not found');
    }

    const newCourseData: Omit<Course, 'id'> = {
        creatorId: creatorId,
        creator: creator.name,
        creatorAvatar: creator.profileImageUrl,
        status: 'pending',
        ...courseData,
        videos: [{ title: courseData.title, url: courseData.videoUrl, duration: 0 }],
    };

    const courseWithId: Course = {
      ...newCourseData,
      id: docRef.id,
    }

    await docRef.set(courseWithId);
    return courseWithId;
}


export async function getRecommendedCourses(): Promise<Course[]> {
  // This is a mock implementation of AI recommendations.
  // In a real app, this would involve a call to an AI service.
  const all = await getCourses();
  // return first 3 for now
  return all.slice(0, 3);
}
