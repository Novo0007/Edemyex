'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting course outlines and topic breakdowns using AI.
 *
 * The flow takes a course title and description as input and returns a suggested course outline with topic breakdowns,
 * incorporating modern pedagogy techniques.
 *
 * @exports {suggestCourseOutline} - The main function to trigger the course outline suggestion flow.
 * @exports {SuggestCourseOutlineInput} - The input type for the suggestCourseOutline function.
 * @exports {SuggestCourseOutlineOutput} - The output type for the suggestCourseOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const SuggestCourseOutlineInputSchema = z.object({
  courseTitle: z.string().describe('The title of the course.'),
  courseDescription: z.string().describe('A brief description of the course.'),
});
export type SuggestCourseOutlineInput = z.infer<typeof SuggestCourseOutlineInputSchema>;

// Define the output schema
const SuggestCourseOutlineOutputSchema = z.object({
  courseOutline: z.string().describe('A detailed course outline with topic breakdowns and suggestions for modern pedagogy.'),
});
export type SuggestCourseOutlineOutput = z.infer<typeof SuggestCourseOutlineOutputSchema>;

// Define the main function that will be exported
export async function suggestCourseOutline(input: SuggestCourseOutlineInput): Promise<SuggestCourseOutlineOutput> {
  return suggestCourseOutlineFlow(input);
}

// Define the prompt
const suggestCourseOutlinePrompt = ai.definePrompt({
  name: 'suggestCourseOutlinePrompt',
  input: {schema: SuggestCourseOutlineInputSchema},
  output: {schema: SuggestCourseOutlineOutputSchema},
  prompt: `You are an AI assistant designed to help course creators generate course outlines and topic breakdowns.

  Given the course title and description, create a detailed course outline with topic breakdowns.
  Incorporate modern pedagogy techniques such as:
  - Active learning strategies
  - Collaborative projects
  - Problem-based learning
  - Use of multimedia resources

  Course Title: {{{courseTitle}}}
  Course Description: {{{courseDescription}}}

  Course Outline:
  `,
});

// Define the flow
const suggestCourseOutlineFlow = ai.defineFlow(
  {
    name: 'suggestCourseOutlineFlow',
    inputSchema: SuggestCourseOutlineInputSchema,
    outputSchema: SuggestCourseOutlineOutputSchema,
  },
  async input => {
    const {output} = await suggestCourseOutlinePrompt(input);
    return output!;
  }
);
