
'use server';
/**
 * @fileOverview An AI agent to answer questions based on a given source text.
 *
 * - answerQuestion - A function that answers a question.
 * - AnswerQuestionInput - The input type for the answerQuestion function.
 * - AnswerQuestionOutput - The return type for the answerQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnswerQuestionInputSchema = z.object({
  sourceText: z.string().describe('The source text to find the answer in.'),
  question: z.string().describe('The user\'s question about the source text.'),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;


const AnswerQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question.'),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  return answerQuestionFlow(input);
}

const answerQuestionFlow = ai.defineFlow(
  {
    name: 'answerQuestionFlow',
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      prompt: `Anda adalah asisten AI yang bertugas menjawab pertanyaan HANYA berdasarkan teks yang diberikan.
Tugas Anda: Jawab pertanyaan berikut: "${input.question}"
Gunakan informasi HANYA dari teks sumber di bawah ini.
Jika jawaban tidak dapat ditemukan di dalam teks, katakan "Informasi untuk menjawab pertanyaan tersebut tidak ditemukan dalam teks."

Teks Sumber:
---
${input.sourceText}
---
`,
      output: {
        schema: AnswerQuestionOutputSchema,
      },
    });

    const output = llmResponse.output;
    if (!output) {
      throw new Error('Failed to get an answer.');
    }
    return output;
  }
);
