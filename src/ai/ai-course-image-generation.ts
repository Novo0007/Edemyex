'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a course image using AI.
 *
 * The flow takes a course title as input and returns a URL to a generated image
 * and a hint for what the image contains.
 *
 * @exports {generateCourseImage} - The main function to trigger the course image generation flow.
 * @exports {GenerateCourseImageInput} - The input type for the generateCourseImage function.
 * @exports {GenerateCourseImageOutput} - The output type for the generateCourseImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';


// Define the input schema
const GenerateCourseImageInputSchema = z.object({
    courseTitle: z.string().describe('The title of the course.'),
});
export type GenerateCourseImageInput = z.infer<typeof GenerateCourseImageInputSchema>;

// Define the output schema for the image generation prompt
const ImageGenPromptOutputSchema = z.object({
    prompt: z.string().describe('A good text-to-image prompt for a course thumbnail image based on the course title. The prompt should be in English, and should be a single sentence of no more than 20 words.'),
    hint: z.string().describe('Two keywords, separated by a space, that describe the generated image. For example: "abstract code" or "watercolor landscape".'),
});

// Define the output schema for the main flow
export const GenerateCourseImageOutputSchema = z.object({
    imageUrl: z.string().url().describe('The URL of the generated image.'),
    imageHint: z.string().describe('A two-word hint describing the image.'),
});
export type GenerateCourseImageOutput = z.infer<typeof GenerateCourseImageOutputSchema>;


// Define the main function that will be exported
export async function generateCourseImage(input: GenerateCourseImageInput): Promise<GenerateCourseImageOutput> {
    return generateCourseImageFlow(input);
}


const imageGenPromptGenerator = ai.definePrompt({
    name: 'imageGenPromptGenerator',
    input: { schema: GenerateCourseImageInputSchema },
    output: { schema: ImageGenPromptOutputSchema },
    prompt: `You are an assistant that creates good text-to-image prompts.
    
    You will be given a course title and you will need to generate a prompt that can be used to generate a thumbnail image for the course.
    
    You will also provide a two-word hint that describes the image.

    Course Title: {{{courseTitle}}}
    `,
    model: ai.model('gemini-pro'),
});


// Define the flow
const generateCourseImageFlow = ai.defineFlow(
    {
        name: 'generateCourseImageFlow',
        inputSchema: GenerateCourseImageInputSchema,
        outputSchema: GenerateCourseImageOutputSchema,
    },
    async (input) => {
        const { output } = await imageGenPromptGenerator(input);

        if (!output) {
            throw new Error('Could not generate image generation prompt.');
        }

        const { media } = await ai.generate({
            prompt: output.prompt,
            model: 'googleai/imagen-4.0-fast-generate-001',
        });
        
        const imageUrl = media.url;
        if (!imageUrl) {
            throw new Error('Image generation failed to return a URL.');
        }

        return {
            imageUrl,
            imageHint: output.hint,
        };
    }
);
