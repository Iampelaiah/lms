'use server';
/**
 * @fileOverview AI-powered learning resource recommendations for the student dashboard.
 *
 * - getLearningRecommendations - A function to retrieve learning recommendations.
 * - LearningRecommendationsInput - The input type for the getLearningRecommendations function.
 * - LearningRecommendationsOutput - The return type for the getLearningRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningRecommendationsInputSchema = z.object({
  studentId: z.string().describe('The unique identifier for the student.'),
  recentSubjects: z.array(z.string()).describe('List of subjects the student has recently engaged with.'),
  grades: z.record(z.string(), z.number()).describe('A map of subjects to the student\'s grade in that subject.'),
  learningGoals: z.string().describe('The student\'s current learning goals.'),
});
export type LearningRecommendationsInput = z.infer<typeof LearningRecommendationsInputSchema>;

const LearningRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      resourceName: z.string().describe('The name of the learning resource.'),
      resourceType: z.string().describe('The type of learning resource (e.g., video, article, practice quiz).'),
      subject: z.string().describe('The subject the resource covers.'),
      whyRecommended: z.string().describe('Why this resource is recommended for the student, based on their history and goals.'),
      link: z.string().describe('Link to the learning resource.'),
    })
  ).describe('A list of learning resource recommendations for the student.'),
});
export type LearningRecommendationsOutput = z.infer<typeof LearningRecommendationsOutputSchema>;

export async function getLearningRecommendations(input: LearningRecommendationsInput): Promise<LearningRecommendationsOutput> {
  return learningRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learningRecommendationsPrompt',
  input: {schema: LearningRecommendationsInputSchema},
  output: {schema: LearningRecommendationsOutputSchema},
  prompt: `You are an AI learning assistant that provides personalized learning resource recommendations for students.

  Consider the student's recent subjects, grades, and learning goals to identify the most relevant and helpful resources.
  Format your response as a JSON object matching the schema.

  Student ID: {{{studentId}}}
  Recent Subjects: {{#each recentSubjects}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Grades: {{#each grades}}{{{@key}}}: {{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Learning Goals: {{{learningGoals}}}

  Based on this information, what learning resources would you recommend to the student? Be sure to include the link to the resources.
`,
});

const learningRecommendationsFlow = ai.defineFlow(
  {
    name: 'learningRecommendationsFlow',
    inputSchema: LearningRecommendationsInputSchema,
    outputSchema: LearningRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
