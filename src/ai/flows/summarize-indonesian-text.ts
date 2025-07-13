'use server';
/**
 * @fileOverview An AI agent to summarize Indonesian text.
 *
 * - summarizeIndonesianText - A function that summarizes Indonesian text.
 * - SummarizeIndonesianTextInput - The input type for the summarizeIndonesianText function.
 * - SummarizeIndonesianTextOutput - The return type for the summarizeIndonesianText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIndonesianTextInputSchema = z.object({
  text: z.string().describe('The Indonesian text to summarize.'),
});
export type SummarizeIndonesianTextInput = z.infer<typeof SummarizeIndonesianTextInputSchema>;

const SummarizeIndonesianTextOutputSchema = z.object({
  summary: z.string().describe('The summarized Indonesian text.'),
  wordCountOriginal: z.number().describe('The word count of the original text.'),
  wordCountSummary: z.number().describe('The word count of the summarized text.'),
});
export type SummarizeIndonesianTextOutput = z.infer<typeof SummarizeIndonesianTextOutputSchema>;

export async function summarizeIndonesianText(input: SummarizeIndonesianTextInput): Promise<SummarizeIndonesianTextOutput> {
  return summarizeIndonesianTextFlow(input);
}

const copyedit = ai.defineTool({
  name: 'copyedit',
  description: 'Applies a professional editing style to the provided text.',
  inputSchema: z.object({
    text: z.string().describe('The text to be copyedited.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
  // Placeholder implementation - replace with actual copyediting logic
  return `Copyedited: ${input.text}`;
});

const summarizeIndonesianTextPrompt = ai.definePrompt({
  name: 'summarizeIndonesianTextPrompt',
  tools: [copyedit],
  input: {schema: SummarizeIndonesianTextInputSchema},
  output: {schema: SummarizeIndonesianTextOutputSchema},
  prompt: `You are an AI summarizer specializing in condensing Indonesian text to no more than 30% of its original length, while maintaining key information. Always apply an appropriate editing style to the results using the copyedit tool.

Original Text: {{{text}}}

Summary:`,
});

const summarizeIndonesianTextFlow = ai.defineFlow(
  {
    name: 'summarizeIndonesianTextFlow',
    inputSchema: SummarizeIndonesianTextInputSchema,
    outputSchema: SummarizeIndonesianTextOutputSchema,
  },
  async input => {
    const {output} = await summarizeIndonesianTextPrompt(input);

    // Calculate word counts
    const wordCountOriginal = input.text.split(/\s+/).length;
    const wordCountSummary = output!.summary.split(/\s+/).length;

    return {
      summary: output!.summary,
      wordCountOriginal: wordCountOriginal,
      wordCountSummary: wordCountSummary,
    };
  }
);
