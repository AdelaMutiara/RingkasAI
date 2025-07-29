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

const OutputFormatSchema = z.enum(['summary', 'keyPoints', 'questions', 'contentIdeas']);

const SummarizeIndonesianTextInputSchema = z.object({
  text: z.string().optional().describe('The Indonesian text to summarize.'),
  url: z.string().optional().describe('The URL of the Indonesian text to summarize.'),
  question: z.string().optional().describe('User\'s question about the source text.'),
  outputFormat: OutputFormatSchema.default('summary'),
});
export type SummarizeIndonesianTextInput = z.infer<typeof SummarizeIndonesianTextInputSchema>;

const SummarizeIndonesianTextOutputSchema = z.object({
  output: z.string().describe('The processed output based on the selected format.'),
  answer: z.string().optional().describe('The answer to the user\'s question.'),
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
    outputSchema: z.object({
      output: z.string(),
    }),
  },
  async (input) => {
    return { output: input.text.trim() };
  }
);

const fetchTextFromUrl = ai.defineTool(
  {
    name: 'fetchTextFromUrl',
    description: 'Fetches the text content from a given website URL. Do not use for YouTube URLs.',
    inputSchema: z.object({
      url: z.string().describe('The URL to fetch content from.'),
    }),
    outputSchema: z.object({ output: z.string() }),
  },
  async (input) => {
    try {
      const response = await fetch(input.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      const dom = new JSDOM(html);
      dom.window.document.querySelectorAll('script, style').forEach((el) => el.remove());
      const rawText = dom.window.document.body.textContent || '';
      if (!rawText.trim()){
        return { output: 'Gagal mengambil konten dari URL karena isinya kosong.' };
      }
      return { output: rawText };
    } catch (error) {
      console.error('Error fetching URL:', error);
      return { output: 'Gagal mengambil konten dari URL. Pastikan URL valid dan dapat diakses.' };
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
    
    let instruction = '';
    switch (input.outputFormat) {
      case 'summary':
        instruction = 'Buat ringkasan singkat dari teks, tidak lebih dari 30% dari panjang aslinya, sambil mempertahankan informasi utama.';
        break;
      case 'keyPoints':
        instruction = 'Ekstrak poin-poin penting dari teks sebagai daftar berpoin. PENTING: Gunakan HANYA karakter bullet point (•) untuk setiap poin. JANGAN gunakan tanda bintang (*) atau tanda hubung (-).';
        break;
      case 'questions':
        instruction = 'Buat daftar pertanyaan penting berdasarkan teks sebagai daftar bernomor.';
        break;
      case 'contentIdeas':
        instruction = 'Berdasarkan teks yang diberikan, hasilkan 5 ide konten yang menarik dalam format daftar bernomor. Setiap ide harus kreatif dan relevan dengan topik utama teks.';
        break;
    }

    if (input.question) {
        instruction += `\n\nSelain itu, jawab pertanyaan berikut: "${input.question}" HANYA berdasarkan informasi yang ada di dalam teks yang diberikan. Jika jawaban tidak dapat ditemukan di dalam teks, katakan "Informasi untuk menjawab pertanyaan tersebut tidak ditemukan dalam teks." Letakkan jawaban untuk pertanyaan ini di bidang 'jawaban' pada output JSON.`;
    }
    
    const textToProcess = input.text || '';
    const urlToProcess = input.url || '';
    
    const llmResponse = await ai.generate({
      prompt: `Anda adalah asisten AI yang ahli dalam memproses teks berbahasa Indonesia. Tugas Anda adalah memproses teks atau URL yang diberikan sesuai dengan instruksi yang spesifik.
PENTING: Seluruh output Anda HARUS dalam Bahasa Indonesia. Jangan pernah menggunakan Bahasa Inggris.

Jika URL yang diberikan, gunakan alat 'fetchTextFromUrl' untuk mengambil kontennya terlebih dahulu.
Setelah mendapatkan teks dari URL, atau jika teks sudah disediakan dari awal, Anda HARUS menerapkan instruksi pemrosesan di bawah ini pada teks tersebut.
Jika sebuah alat mengembalikan pesan error (misalnya "Gagal mengambil..."), sampaikan pesan error tersebut kepada pengguna DALAM BAHASA INDONESIA sebagai jawaban akhir Anda. Jangan mencoba memprosesnya lebih lanjut.
Jika teks dan URL diberikan, prioritaskan teks yang diberikan.

Teks Asli: ${textToProcess}
URL: ${urlToProcess}

Instruksi Anda: ${instruction}
`,
      tools: [fetchTextFromUrl, copyeditTool],
      toolChoice: 'auto',
      output: {
        schema: z.object({
          output: z.string().describe("Hasil utama berdasarkan format yang diminta (ringkasan, poin penting, dll)."),
          answer: z.string().nullable().optional().describe("Jawaban atas pertanyaan spesifik pengguna. Hanya ada jika pengguna bertanya."),
        })
      }
    });

    const outputData = llmResponse.output();
    if (!outputData) {
        throw new Error('Gagal menghasilkan output dari AI.');
    }

    const outputText = outputData.output || '';
    const answerText = outputData.answer;

    let originalTextForCount = textToProcess;
    if (llmResponse.history) {
        const toolOutputs = llmResponse.history
          .filter(m => m.role === 'tool' && m.content[0]?.toolResponse?.name === 'fetchTextFromUrl');
    
        if (toolOutputs.length > 0) {
          originalTextForCount = toolOutputs
            .map(t => {
                const part = t.content[0];
                if ('toolResponse' in part && typeof part.toolResponse.output === 'object' && part.toolResponse.output !== null && 'output' in part.toolResponse.output) {
                    return (part.toolResponse.output as { output: string }).output;
                }
                return '';
            })
            .join(' ');
        }
    }


    if (!originalTextForCount && urlToProcess && !outputText) {
       throw new Error('No text to process. Please provide text or a valid URL.');
    }

    const wordCountOriginal = originalTextForCount.split(/\s+/).filter(Boolean).length;
    const wordCountSummary = outputText.split(/\s+/).filter(Boolean).length;

    return {
      output: outputText,
      answer: answerText,
      wordCountOriginal,
      wordCountSummary,
      outputFormat: input.outputFormat
    };
  }
);
