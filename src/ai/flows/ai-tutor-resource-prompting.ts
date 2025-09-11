'use server';
/**
 * @fileOverview An AI tutor assistant flow that suggests learning resources based on a student's query.
 *
 * - aiTutorResourcePrompting - A function that accepts a student's query and returns a list of relevant learning resources.
 * - AITutorResourcePromptingInput - The input type for the aiTutorResourcePrompting function.
 * - AITutorResourcePromptingOutput - The return type for the aiTutorResourcePrompting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AITutorResourcePromptingInputSchema = z.object({
  query: z.string().describe('The student\'s query for learning resources.'),
  studentHistory: z
    .string()
    .optional()
    .describe('The student\'s learning history and preferences.'),
});
export type AITutorResourcePromptingInput = z.infer<
  typeof AITutorResourcePromptingInputSchema
>;

const AITutorResourcePromptingOutputSchema = z.object({
  resources: z
    .array(z.string())
    .describe('A list of relevant learning resources.'),
});
export type AITutorResourcePromptingOutput = z.infer<
  typeof AITutorResourcePromptingOutputSchema
>;

export async function aiTutorResourcePrompting(
  input: AITutorResourcePromptingInput
): Promise<AITutorResourcePromptingOutput> {
  return aiTutorResourcePromptingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTutorResourcePromptingPrompt',
  input: {schema: AITutorResourcePromptingInputSchema},
  output: {schema: AITutorResourcePromptingOutputSchema},
  prompt: `You are an AI tutor assistant. A student is asking for learning resources on a specific topic.
  Based on their query and learning history, suggest a list of relevant learning resources.
  Do not include resources that the student has already accessed or are not relevant to their learning needs.

  Student Query: {{{query}}}
  Student History: {{{studentHistory}}}

  Provide a list of learning resources that would be most helpful to the student.
  `,
});

const aiTutorResourcePromptingFlow = ai.defineFlow(
  {
    name: 'aiTutorResourcePromptingFlow',
    inputSchema: AITutorResourcePromptingInputSchema,
    outputSchema: AITutorResourcePromptingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
