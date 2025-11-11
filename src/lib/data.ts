import { getFirebaseAdmin } from '@/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { Course, User, Purchase } from './types';
import { PlaceHolderImages } from './placeholder-images';

const { firestore } = getFirebaseAdmin();

const coursesCollection = firestore.collection('courses');
const usersCollection = firestore.collection('users');

const ALLOWED_IMAGE_HOSTS = [
  'images.unsplash.com',
  'picsum.photos',
  'storage.googleapis.com',
  'avatar.vercel.sh',
];

const validateAndGetImage = (course: any) => {
    const placeholder = {
        imageUrl: 'https://picsum.photos/seed/error/600/400',
    };

    if (course.imageUrl) {
        try {
            if (course.imageUrl.startsWith('data:image')) {
                 return { imageUrl: course.imageUrl };
            }
            const url = new URL(course.imageUrl);
            if (ALLOWED_IMAGE_HOSTS.includes(url.hostname)) {
                return {
                    imageUrl: course.imageUrl,
                };
            }
        } catch (e) {}
    }
    
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
      const creator = await getUserById(courseData.creatorId);

      result.push({ 
          ...courseData, 
          id: d.id,
          imageUrl,
          creator: creator?.name || 'Unknown Creator',
          creatorAvatar: creator?.profileImageUrl || '',
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
      const creator = await getUserById(courseData.creatorId);
      
      return { 
          ...courseData, 
          id: docSnap.id,
          imageUrl,
          creator: creator?.name || 'Unknown Creator',
          creatorAvatar: creator?.profileImageUrl || '',
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
      return { id: docSnap.id, ...docSnap.data() } as User;
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
        const courseIds = user.purchasedCourseIds.slice(0, 30);
        if(courseIds.length === 0) return [];
        
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
    const docRef = coursesCollection.doc();

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


export async function getRecommendedCourses(): Promise<Course[]> {
  const all = await getCourses();
  return all.slice(0, 3);
}
