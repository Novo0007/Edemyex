'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCourseById as getCourse, getUserById as getUser, purchaseCourse as buyCourse, createCourse as newCourse } from '@/lib/data';

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

export async function generateCourseOutline(topic: string): Promise<string> {
  // In a real app, this would call a GenAI model.
  // We're returning a mock response for demonstration.
  if (!topic) {
    return "Please provide a topic to generate an outline.";
  }

  // This simulates an AI reasoning about pedagogy
  const usePedagogy = Math.random() > 0.5;
  let pedagogyNote = "";
  if (usePedagogy) {
    pedagogyNote = `\n\n**Pedagogical Note:** To enhance learning retention, consider incorporating a small, practical project after Module 2 and a peer-review session at the end of Module 3. This follows the constructivist learning theory where learners build knowledge through active participation.`;
  }

  return `Here is a suggested course outline for "${topic}":

**Module 1: Introduction & Core Concepts**
-   Lesson 1.1: What is ${topic} and Why is it Important?
-   Lesson 1.2: History and Evolution
-   Lesson 1.3: Fundamental Principles
-   Lesson 1.4: Key Terminology

**Module 2: Getting Started**
-   Lesson 2.1: Setting Up Your Environment/Tools
-   Lesson 2.2: Your First Project: "Hello, World!" equivalent
-   Lesson 2.3: Understanding the Basic Workflow

**Module 3: Intermediate Techniques**
-   Lesson 3.1: Exploring Advanced Feature A
-   Lesson 3.2: Deep Dive into Feature B
-   Lesson 3.3: Common Pitfalls and How to Avoid Them

**Module 4: Advanced Topics & Best Practices**
-   Lesson 4.1: Performance Optimization
-   Lesson 4.2: Integrating with Other Technologies
-   Lesson 4.3: Real-World Case Study
-   Lesson 4.4: Future Trends in ${topic}${pedagogyNote}
`;
}
