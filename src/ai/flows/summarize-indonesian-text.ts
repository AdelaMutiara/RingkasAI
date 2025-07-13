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
import { YoutubeTranscript } from 'youtube-transcript';

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

const copyeditTool = ai.defineTool(
  {
    name: 'copyedit',
    description: 'Edits and refines the provided text for clarity, conciseness, and style.',
    inputSchema: z.object({
      text: z.string().describe('The text to be edited.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // In a real scenario, this could involve more complex editing logic.
    // For this example, we'll just return the text as is,
    // relying on the model's intelligence to use the tool correctly.
    return input.text.trim();
  }
);

const fetchTextFromUrl = ai.defineTool(
  {
    name: 'fetchTextFromUrl',
    description: 'Fetches the text content from a given website URL.',
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

const fetchTranscriptFromYouTubeUrl = ai.defineTool(
  {
    name: 'fetchTranscriptFromYouTubeUrl',
    description: 'Fetches the transcript from a given YouTube video URL.',
    inputSchema: z.object({
      url: z.string().describe('The YouTube URL to fetch the transcript from.'),
    }),
    outputSchema: z.string(),
  },
  async ({ url }) => {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(url);
      return transcript.map((item) => item.text).join(' ');
    } catch (error) {
      console.error('Error fetching YouTube transcript:', error);
      return 'Failed to fetch transcript from YouTube URL. The video might not have transcripts available.';
    }
  }
);

const summarizeIndonesianTextFlow = ai.defineFlow(
  {
    name: 'summarizeIndonesianTextFlow',
    inputSchema: SummarizeIndonesianTextInputSchema,
    outputSchema: SummarizeIndonesianTextOutputSchema,
  },
  async (input) => {
    let textToProcess = input.text || '';

    if (input.url) {
      const isYouTubeUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(input.url);
      if (isYouTubeUrl) {
        textToProcess = await fetchTranscriptFromYouTubeUrl({ url: input.url });
      } else {
        textToProcess = await fetchTextFromUrl({url: input.url});
      }
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
        instruction = 'Ekstrak poin-poin penting dari teks sebagai daftar berpoin. Gunakan karakter bullet point (•) untuk setiap poin, bukan tanda hubung (-).';
        break;
      case 'questions':
        instruction = 'Buat daftar pertanyaan penting berdasarkan teks sebagai daftar bernomor.';
        break;
    }

    const prompt = `Anda adalah asisten AI yang berspesialisasi dalam memproses teks berbahasa Indonesia. Tugas Anda adalah memproses teks yang diberikan berdasarkan instruksi. Pastikan output yang Anda hasilkan juga dalam Bahasa Indonesia dan hanya berupa teks biasa (plain text) tanpa format Markdown (seperti ** atau #).

Teks Asli: ${textToProcess}

Instruksi Anda: ${instruction}
Output:`;

    const response = await ai.generate({
      prompt: prompt,
      tools: [fetchTextFromUrl, fetchTranscriptFromYouTubeUrl, copyeditTool],
      toolChoice: 'tool:copyedit'
    });
    
    const outputText = response.text;

    const wordCountOriginal = textToProcess.split(/\s+/).filter(Boolean).length;
    const wordCountSummary = outputText.split(/\s+/).filter(Boolean).length;

    return {
      output: outputText,
      wordCountOriginal,
      wordCountSummary,
      outputFormat: input.outputFormat
    };
  }
);
