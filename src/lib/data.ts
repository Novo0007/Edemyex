import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
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

const coursesCollection = collection(firestore, 'courses');
const usersCollection = collection(firestore, 'users');

export async function getCourses(): Promise<Course[]> {
  try {
    const snapshot = await getDocs(coursesCollection);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Course));
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  try {
    const docRef = doc(firestore, 'courses', id);
    const docSnap = await getDoc(docRef);
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
    const docRef = doc(firestore, 'users', userId);
    const docSnap = await getDoc(docRef);
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
        const coursesQuery = query(coursesCollection, where('id', 'in', user.purchasedCourseIds));
        const snapshot = await getDocs(coursesQuery);
        return snapshot.docs.map(doc => ({...doc.data(), id: doc.id} as Course));
    } catch (error) {
        console.error("Error fetching purchased courses:", error);
        return [];
    }
}


export async function purchaseCourse(userId: string, courseId: string): Promise<boolean> {
    try {
        const userRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return false;

        const userData = userSnap.data() as User;
        
        // Prevent re-purchasing
        if (userData.purchasedCourseIds?.includes(courseId)) {
            return false;
        }

        const courseRef = doc(firestore, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);

        if (!courseSnap.exists()) return false;
        const courseData = courseSnap.data() as Course;

        // Create purchase record
        const purchaseRef = collection(firestore, `users/${userId}/purchases`);
        await addDoc(purchaseRef, {
            courseId: courseId,
            userId: userId,
            price: courseData.price,
            purchaseDate: serverTimestamp()
        });

        // Add course to user's purchased list
        await setDoc(userRef, { purchasedCourseIds: arrayUnion(courseId) }, { merge: true });

        return true;
    } catch (error) {
        console.error("Error purchasing course:", error);
        return false;
    }
}

export async function createCourse(courseData: Omit<Course, 'id' | 'creatorAvatar' | 'creatorId' | 'status' >, creatorId: string): Promise<Course> {
    const user = await getUserById(creatorId);
    if (!user) {
        throw new Error("Creator not found");
    }

    const newCourseData = {
        ...courseData,
        id: '',
        creatorId: creatorId,
        creator: user.name,
        creatorAvatar: user.profileImageUrl,
        status: 'pending', // default status
        videos: courseData.videos || [],
    };
    
    const docRef = await addDoc(coursesCollection, newCourseData);
    
    // update the document with its own id
    const finalCourseData = { ...newCourseData, id: docRef.id };
    await setDoc(docRef, finalCourseData);
    
    return finalCourseData;
}


export async function getRecommendedCourses(): Promise<Course[]> {
  // This is a mock implementation of AI recommendations.
  // In a real app, this would involve a call to an AI service.
  const all = await getCourses();
  // return first 3 for now
  return all.slice(0, 3);
}