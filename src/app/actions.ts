'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCourseById as getCourse, grantCourseAccess, newCourse, getAdminUser } from '@/lib/data';
import { suggestCourseOutline } from '@/ai/ai-course-outline-suggestions';
import { headers } from 'next/headers';
import { razorpay } from '@/lib/razorpay';
import { Course } from '@/lib/types';
import { generateCourseImage } from '@/ai/ai-course-image-generation';


export async function getCourseById(id: string) {
  return getCourse(id);
}

// This is a protected action, we need to get the user from the session
async function getUserIdFromSession(): Promise<string | null> {
    const authorization = headers().get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const adminUser = await getAdminUser(idToken);
            return adminUser.uid;
        } catch (error) {
            console.error("Error verifying token:", error);
            return null;
        }
    }
    return null;
}


export async function purchaseCourse(userId: string, courseId: string, creatorId: string, price: number) {
  // In a real app, you'd get the userId from the session, not as an argument
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
  creator: z.string().min(1, "Creator name is required"),
  creatorAvatar: z.string().url("Creator avatar is required"),
});

export async function createCourseAction(
  creatorId: string | undefined, 
  prevState: { errors: any; success: boolean; courseId: string | null },
  formData: FormData
) {
  if (!creatorId) {
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
    creator: formData.get('creator'),
    creatorAvatar: formData.get('creatorAvatar'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
      courseId: null,
    };
  }

  try {
    const imageResult = await generateCourseImage({ courseTitle: validatedFields.data.title });
    const imageUrl = imageResult.imageUrl;
    const imageHint = imageResult.imageHint;

    const courseData = {
        ...validatedFields.data,
        imageUrl: imageUrl,
        imageHint: imageHint,
    };

    const createdCourse = await newCourse(courseData, creatorId);
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
        const order = await razorpay.orders.create(options);
        return { success: true, order };
    } catch (error) {
        console.error("Razorpay order creation failed:", error);
        return { success: false, error: "Could not create payment order." };
    }
}
