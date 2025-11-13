
'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { grantCourseAccess, newCourse } from '@/lib/data';
import { getCreatorFromToken, getUserFromToken } from '@/app/api/creator/dashboard/route';
import { suggestCourseOutline } from '@/ai/ai-course-outline-suggestions';
import { headers } from 'next/headers';
import { getRazorpayInstance } from '@/lib/razorpay';
import type { Course } from '@/lib/types';
import { getFirebaseAdmin } from '@/firebase/admin';

export async function purchaseCourse(userId: string, courseId: string, creatorId: string, price: number) {
  const result = await grantCourseAccess(userId, courseId, creatorId, price);
  if (result) {
    revalidatePath('/my-courses');
    revalidatePath(`/courses/${courseId}`);
  }
  return result;
}

const CourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  outline: z.string().min(20, "Outline must be at least 20 characters"),
  videoUrl: z.string().url("Must be a valid video URL"),
  imageUrl: z.string().url("Must be a valid image URL"),
});

export async function createCourseAction(
  prevState: { errors: any; success: boolean; courseId: string | null },
  formData: FormData
) {
    const creator = await getCreatorFromToken(headers());
    if (!creator) {
      return {
        errors: { _form: ['You must be logged in as a creator to create a course.'] },
        success: false,
        courseId: null,
      };
    }

  const validatedFields = CourseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    category: formData.get('category'),
    outline: formData.get('outline'),
    videoUrl: formData.get('videoUrl'),
    imageUrl: formData.get('imageUrl'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
      courseId: null,
    };
  }

  try {
    const courseData = validatedFields.data;
    
    const createdCourse = await newCourse(courseData, creator.id);

    revalidatePath('/creator/courses');
    revalidatePath('/');
    return { success: true, courseId: createdCourse.id, errors: {} };
  } catch (error) {
    let message = 'Something went wrong during course creation.';
    if (error instanceof Error) {
        message = `Course creation failed: ${error.message}`;
    }
    return { errors: { _form: [message] }, success: false, courseId: null };
  }
}

export async function generateCourseOutline(courseTitle: string, courseDescription: string): Promise<string> {
    if (!courseTitle || !courseDescription) {
    return "Please provide a topic and description to generate an outline.";
  }
  try {
    const result = await suggestCourseOutline({ courseTitle, courseDescription });
    return result.courseOutline;
  } catch(e) {
    console.error(e);
    return "There was an error generating the course outline."
  }
}

export async function createRazorpayOrder(course: Course, userId: string) {
    const amountInPaise = Math.round(course.price * 100);

    const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_course_${course.id}_${userId}`,
        notes: {
            courseId: course.id,
            userId: userId,
            creatorId: course.creatorId,
            courseTitle: course.title,
        }
    };

    try {
        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create(options);
        return { success: true, order };
    } catch (error) {
        console.error("Razorpay order creation failed:", error);
        return { success: false, error: "Could not create payment order." };
    }
}

const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  profileImageUrl: z.string().url("Must be a valid URL.").or(z.literal('')),
});


export async function updateProfileAction(
  prevState: { errors: any; success: boolean; message: string },
  formData: FormData
) {
  const user = await getUserFromToken(headers());
  if (!user) {
    return {
      errors: {},
      success: false,
      message: 'You must be logged in to update your profile.',
    };
  }

  const validatedFields = ProfileSchema.safeParse({
    name: formData.get('name'),
    profileImageUrl: formData.get('profileImageUrl'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
      message: 'Invalid data provided.',
    };
  }

  const { name, profileImageUrl } = validatedFields.data;
  const { auth, firestore } = getFirebaseAdmin();

  try {
    // Update Firebase Auth profile
    await auth.updateUser(user.id, {
      displayName: name,
      photoURL: profileImageUrl,
    });

    // Update Firestore document
    const userRef = firestore.collection('users').doc(user.id);
    await userRef.update({
      name: name,
      profileImageUrl: profileImageUrl,
    });
    
    revalidatePath('/profile');
    revalidatePath('/my-courses');
    return {
      errors: {},
      success: true,
      message: 'Your profile has been updated successfully.',
    };
  } catch (error) {
     console.error("Error updating profile:", error);
     return {
      errors: {},
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
