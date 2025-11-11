'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCourseById as getCourse, getUserById as getUser, purchaseCourse as buyCourse, createCourse as newCourse } from '@/lib/data';
import { suggestCourseOutline } from '@/ai/ai-course-outline-suggestions';


// In a real app, these would interact with a database.
// For now, they use the mock data functions from lib/data.ts

export async function getCourseById(id: string) {
  return getCourse(id);
}

export async function getUserById(id: string) {
  return getUser(id);
}

export async function purchaseCourse(userId: string, courseId: string) {
  const result = await buyCourse(userId, courseId);
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
  imageUrl: z.string().url("Must be a valid image URL"),
  imageHint: z.string(),
});

export async function createCourseAction(formData: FormData) {
  const validatedFields = CourseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    category: formData.get('category'),
    imageUrl: 'https://picsum.photos/seed/new/600/400',
    imageHint: 'abstract new',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Videos are not part of the form for simplicity, adding dummy data
  const courseData = {
    ...validatedFields.data,
    creator: 'Alex Johnson', // Mock creator
    videos: [
      { title: 'Lesson 1', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 300 },
    ],
  };

  try {
    const createdCourse = await newCourse(courseData);
    revalidatePath('/');
    return { success: true, courseId: createdCourse.id };
  } catch (error) {
    return { errors: { _form: ['Something went wrong.'] } };
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

    