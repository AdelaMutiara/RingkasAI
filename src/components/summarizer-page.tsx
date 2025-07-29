"use client";

import { useState, useTransition, useCallback } from "react";
import { summarizeIndonesianText, SummarizeIndonesianTextOutput } from "@/ai/flows/summarize-indonesian-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Check, Upload, Link as LinkIcon, FileText, Sparkles, HelpCircle, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as pdfjs from "pdfjs-dist";

// Required for pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type InputSource = "text" | "pdf" | "url";
type OutputFormat = "summary" | "keyPoints" | "questions" | "contentIdeas" | "qa";

export function SummarizerPage() {
  const [inputText, setInputText] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<SummarizeIndonesianTextOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [inputSource, setInputSource] = useState<InputSource>("text");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("summary");

  const handlePdfUpload = async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setInputText("");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
      try {
        const pdf = await pdfjs.getDocument(typedArray).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => "str" in item ? item.str : "").join(" ");
          fullText += pageText + "\n";
        }
        setInputText(fullText);
         toast({
            title: "PDF Loaded",
            description: `Extracted ${fullText.trim().split(/\s+/).filter(Boolean).length} words from ${file.name}`,
          });
      } catch (error) {
        console.error("Failed to parse PDF:", error);
        toast({
          title: "PDF Error",
          description: "Could not read text from the PDF file.",
          variant: "destructive",
        });
        setFileName("");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let hasInput = false;
    let payload: { outputFormat: OutputFormat, text?: string, url?: string, question?: string } = { outputFormat };

    if (inputSource === "text" && inputText.trim()) {
      Object.assign(payload, { text: inputText });
      hasInput = true;
    } else if (inputSource === "pdf" && inputText.trim()) {
      Object.assign(payload, { text: inputText });
      hasInput = true;
    } else if (inputSource === "url" && url.trim()) {
      Object.assign(payload, { url: url });
      hasInput = true;
    }

    if (!hasInput) {
      toast({
        title: "Input Required",
        description: "Please provide text, a PDF, or a URL to process.",
        variant: "destructive",
      });
      return;
    }

    if (outputFormat === 'qa' && !question.trim()) {
        toast({
            title: "Pertanyaan Diperlukan",
            description: "Silakan masukkan pertanyaan untuk fitur Tanya Jawab.",
            variant: "destructive",
        });
        return;
    }

    if (outputFormat === 'qa') {
        payload.question = question;
    }


    setResult(null);
    startTransition(async () => {
      try {
        const summaryResult = await summarizeIndonesianText(payload);
        setResult(summaryResult);
      } catch (error) {
        console.error("Processing error:", error);
        toast({
          title: "Error",
          description: `Failed to process the input. ${error instanceof Error ? error.message : ''}`,
          variant: "destructive",
        });
        setResult(null);
      }
    });
  };

  const handleCopy = useCallback(() => {
    if (result?.output) {
      navigator.clipboard.writeText(result.output).then(() => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Output copied to clipboard.",
        });
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  }, [result, toast]);

  const reductionPercentage = result && result.wordCountOriginal > 0 
    ? Math.round(100 - (result.wordCountSummary / result.wordCountOriginal * 100))
    : 0;

  const getOutputTitle = () => {
    if (!result) return "Hasil";
    switch(result.outputFormat) {
      case "keyPoints": return "Poin Penting";
      case "questions": return "Pertanyaan yang Dihasilkan";
      case "summary": return "Ringkasan";
      case "contentIdeas": return "Ide Konten";
      case "qa": return "Jawaban";
      default:
        return "Hasil";
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 md:py-12">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
          Asisten Pintar Untuk Ringkasan Teks Apapun
        </h1>
        <p className="text-muted-foreground mt-2">
          Dapatkan Intisari, Poin Penting, atau Pertanyaan Kunci dari Teks Berbahasa Indonesia dalam Sekejap.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={inputSource} onValueChange={(v) => setInputSource(v as InputSource)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4"/>Teks</TabsTrigger>
                <TabsTrigger value="pdf"><Upload className="mr-2 h-4 w-4"/>PDF</TabsTrigger>
                <TabsTrigger value="url"><LinkIcon className="mr-2 h-4 w-4"/>URL</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-4">
                <Textarea
                  placeholder="Tempel teks panjang berbahasa Indonesia di sini..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] text-base p-4 rounded-lg shadow-inner bg-secondary/50"
                  rows={10}
                />
                 <p className="text-sm text-muted-foreground text-right pr-2 mt-2">
                  Jumlah kata: {inputText.trim().split(/\s+/).filter(Boolean).length}
                </p>
              </TabsContent>
              <TabsContent value="pdf" className="mt-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center bg-secondary/50">
                   <Input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={(e) => handlePdfUpload(e.target.files![0])} />
                   <Label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
                     <Upload className="h-8 w-8 text-muted-foreground" />
                     <span className="text-primary font-medium">Klik untuk mengunggah PDF</span>
                     <p className="text-muted-foreground text-sm">Teks akan diekstraksi secara otomatis.</p>
                   </Label>
                   {fileName && <p className="mt-4 text-sm font-medium text-foreground">File: {fileName}</p>}
                </div>
              </TabsContent>
              <TabsContent value="url" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="url-input">URL Situs Web</Label>
                    <Input id="url-input" type="url" placeholder="https://example.com/article" value={url} onChange={(e) => setUrl(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Konten teks dari artikel akan diambil dari halaman.</p>
                  </div>
              </TabsContent>
            </Tabs>
            
            <div>
              <Label className="text-base font-semibold">Format Output</Label>
               <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Button type="button" variant={outputFormat === 'summary' ? 'default' : 'outline'} onClick={() => setOutputFormat('summary')}>
                        Ringkasan
                    </Button>
                    <Button type="button" variant={outputFormat === 'keyPoints' ? 'default' : 'outline'} onClick={() => setOutputFormat('keyPoints')}>
                        Poin Penting
                    </Button>
                    <Button type="button" variant={outputFormat === 'questions' ? 'default' : 'outline'} onClick={() => setOutputFormat('questions')}>
                        Pertanyaan
                    </Button>
                    <Button type="button" variant={outputFormat === 'contentIdeas' ? 'default' : 'outline'} onClick={() => setOutputFormat('contentIdeas')}>
                        <Lightbulb className="mr-2 h-4 w-4"/>Ide Konten
                    </Button>
                    <Button type="button" variant={outputFormat === 'qa' ? 'default' : 'outline'} onClick={() => setOutputFormat('qa')}>
                        <HelpCircle className="mr-2 h-4 w-4"/>Tanya Jawab
                    </Button>
                </div>
            </div>

            {outputFormat === 'qa' && (
                <div className="space-y-2 animate-in fade-in duration-300">
                    <Label htmlFor="qa-input" className="text-base font-semibold">Ajukan Pertanyaan Anda</Label>
                    <Input id="qa-input" placeholder="Ketik pertanyaan Anda tentang teks di sini..." value={question} onChange={(e) => setQuestion(e.target.value)} />
                </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending} size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isPending && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-1/4" />
            </CardTitle>
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="mt-8 animate-in fade-in duration-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline">{getOutputTitle()}</CardTitle>
                 {result.outputFormat === "summary" && (
                    <div className="text-sm text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Asli: <span className="font-medium text-foreground">{result.wordCountOriginal} kata</span></span>
                        <span>Output: <span className="font-medium text-foreground">{result.wordCountSummary} kata</span></span>
                        <span>Reduksi: <span className="font-medium text-foreground">{reductionPercentage}%</span></span>
                    </div>
                 )}
              </div>
              <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy summary">
                {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-accent-foreground/80" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
             <div className="text-base leading-relaxed whitespace-pre-wrap">{result.output}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
