'use server';

/**
 * @fileOverview Provides AI-powered course recommendations based on user history.
 *
 * - getCourseRecommendations - A function that takes user purchase history and browsing behavior as input
 *   and returns a list of recommended courses.
 * - CourseRecommendationInput - The input type for the getCourseRecommendations function.
 * - CourseRecommendationOutput - The return type for the getCourseRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CourseRecommendationInputSchema = z.object({
  purchaseHistory: z
    .string()
    .describe('The user purchase history, as a comma separated string of course names.'),
  browsingHistory: z
    .string()
    .describe('The user browsing history, as a comma separated string of course names.'),
});

export type CourseRecommendationInput = z.infer<
  typeof CourseRecommendationInputSchema
>;

const CourseRecommendationOutputSchema = z.object({
  recommendedCourses: z
    .string()
    .describe('A comma separated list of recommended courses based on user history.'),
});

export type CourseRecommendationOutput = z.infer<
  typeof CourseRecommendationOutputSchema
>;

export async function getCourseRecommendations(
  input: CourseRecommendationInput
): Promise<CourseRecommendationOutput> {
  return courseRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'courseRecommendationPrompt',
  input: {schema: CourseRecommendationInputSchema},
  output: {schema: CourseRecommendationOutputSchema},
  prompt: `You are an AI course recommendation engine. You will be provided with a user's purchase history and browsing history. You will return a comma separated list of recommended courses based on this information.

  Purchase History: {{{purchaseHistory}}}
  Browsing History: {{{browsingHistory}}}
  Recommended Courses:`,
});

const courseRecommendationFlow = ai.defineFlow(
  {
    name: 'courseRecommendationFlow',
    inputSchema: CourseRecommendationInputSchema,
    outputSchema: CourseRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
