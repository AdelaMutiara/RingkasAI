'use server';
/**
 * @fileOverview An AI agent to summarize Indonesian text from various sources.
 *
 * - summarizeIndonesianText - A function that summarizes Indonesian text.
 * - SummarizeIndonesianTextInput - The input type for the summarizeIndonesianText function.
 * - SummarizeIndonesianTextOutput - The return type for the summarizeIndonesianText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {JSDOM} from 'jsdom';

const OutputFormatSchema = z.enum(['summary', 'keyPoints', 'questions']);

const SummarizeIndonesianTextInputSchema = z.object({
  text: z.string().optional().describe('The Indonesian text to summarize.'),
  url: z.string().optional().describe('The URL of the Indonesian text to summarize.'),
  outputFormat: OutputFormatSchema.default('summary'),
});
export type SummarizeIndonesianTextInput = z.infer<typeof SummarizeIndonesianTextInputSchema>;

const SummarizeIndonesianTextOutputSchema = z.object({
  output: z.string().describe('The processed output based on the selected format.'),
  wordCountOriginal: z.number().describe('The word count of the original text.'),
  wordCountSummary: z.number().describe('The word count of the summarized text.'),
  outputFormat: OutputFormatSchema.default('summary'),
});
export type SummarizeIndonesianTextOutput = z.infer<typeof SummarizeIndonesianTextOutputSchema>;

export async function summarizeIndonesianText(input: SummarizeIndonesianTextInput): Promise<SummarizeIndonesianTextOutput> {
  return summarizeIndonesianTextFlow(input);
}

const fetchTextFromUrl = ai.defineTool(
  {
    name: 'fetchTextFromUrl',
    description: 'Fetches the text content from a given URL.',
    inputSchema: z.object({
      url: z.string().describe('The URL to fetch content from.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      const response = await fetch(input.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      const dom = new JSDOM(html);
      // Remove script and style elements
      dom.window.document.querySelectorAll('script, style').forEach((el) => el.remove());
      return dom.window.document.body.textContent || '';
    } catch (error) {
      console.error('Error fetching URL:', error);
      return 'Failed to fetch content from URL.';
    }
  }
);


const summarizeIndonesianTextPrompt = ai.definePrompt({
  name: 'summarizeIndonesianTextPrompt',
  tools: [fetchTextFromUrl],
  input: {schema: z.object({
    text: z.string(),
    instruction: z.string(),
  })},
  output: {schema: z.object({
    output: z.string()
  })},
  prompt: `Anda adalah asisten AI yang berspesialisasi dalam memproses teks berbahasa Indonesia. Tugas Anda adalah memproses teks yang diberikan berdasarkan instruksi. Pastikan output yang Anda hasilkan juga dalam Bahasa Indonesia dan hanya berupa teks biasa (plain text) tanpa format Markdown (seperti ** atau #).

Teks Asli: {{{text}}}

Instruksi Anda: {{{instruction}}}
Output:`,
});

const summarizeIndonesianTextFlow = ai.defineFlow(
  {
    name: 'summarizeIndonesianTextFlow',
    inputSchema: SummarizeIndonesianTextInputSchema,
    outputSchema: SummarizeIndonesianTextOutputSchema,
  },
  async (input) => {
    let textToProcess = input.text || '';

    if (input.url) {
      textToProcess = await fetchTextFromUrl({url: input.url});
    }

    if (!textToProcess) {
      throw new Error('No text to process. Please provide text or a valid URL.');
    }

    let instruction = '';
    switch (input.outputFormat) {
      case 'summary':
        instruction = 'Buat ringkasan singkat dari teks, tidak lebih dari 30% dari panjang aslinya, sambil mempertahankan informasi utama.';
        break;
      case 'keyPoints':
        instruction = 'Ekstrak poin-poin penting dari teks sebagai daftar berpoin menggunakan tanda hubung (-).';
        break;
      case 'questions':
        instruction = 'Buat daftar pertanyaan penting berdasarkan teks sebagai daftar bernomor.';
        break;
    }


    const {output} = await summarizeIndonesianTextPrompt({
      text: textToProcess,
      instruction: instruction,
    });

    const wordCountOriginal = textToProcess.split(/\s+/).filter(Boolean).length;
    const wordCountSummary = output!.output.split(/\s+/).filter(Boolean).length;

    return {
      output: output!.output,
      wordCountOriginal,
      wordCountSummary,
      outputFormat: input.outputFormat
    };
  }
);
