
'use server';
/**
 * @fileOverview An AI agent to analyze the sentiment of a given text.
 *
 * - analyzeSentiment - A function that analyzes the sentiment.
 * - AnalyzeSentimentInput - The input type for the analyzeSentiment function.
 * - AnalyzeSentimentOutput - The return type for the analyzeSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSentimentInputSchema = z.object({
  text: z.string().describe('The text to analyze.'),
});
export type AnalyzeSentimentInput = z.infer<typeof AnalyzeSentimentInputSchema>;

const SentimentSchema = z.enum(['Positive', 'Negative', 'Neutral']);

const AnalyzeSentimentOutputSchema = z.object({
  sentiment: SentimentSchema.describe('The overall sentiment of the text.'),
  explanation: z.string().describe('A brief explanation for the sentiment analysis.'),
});
export type AnalyzeSentimentOutput = z.infer<typeof AnalyzeSentimentOutputSchema>;

export async function analyzeSentiment(input: AnalyzeSentimentInput): Promise<AnalyzeSentimentOutput> {
  return analyzeSentimentFlow(input);
}

const analyzeSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentFlow',
    inputSchema: AnalyzeSentimentInputSchema,
    outputSchema: AnalyzeSentimentOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
        prompt: `You are an expert sentiment analyst. Analyze the sentiment of the following Indonesian text. 
        Determine if the sentiment is Positive, Negative, or Neutral. 
        Provide a brief, one-sentence explanation for your analysis in Indonesian.

        Text: "${input.text}"`,
        output: {
            schema: AnalyzeSentimentOutputSchema,
        }
    });

    const output = llmResponse.output;
    if (!output) {
      throw new Error('Failed to analyze sentiment.');
    }
    return output;
  }
);
