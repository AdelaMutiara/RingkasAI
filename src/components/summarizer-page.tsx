
"use client";

import { useState, useTransition, useCallback } from "react";
import { summarizeIndonesianText, SummarizeIndonesianTextOutput } from "@/ai/flows/summarize-indonesian-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Copy, Check, Upload, Link as LinkIcon, FileText, Sparkles, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as pdfjs from "pdfjs-dist";

// Required for pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type InputSource = "text" | "pdf" | "url";
type OutputFormat = "summary" | "keyPoints" | "questions" | "contentIdeas";
type OutputLanguage = "indonesian" | "english" | "arabic";


interface StoredSource {
    text?: string;
    url?: string;
}

export function SummarizerPage() {
  const [inputText, setInputText] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<SummarizeIndonesianTextOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isQAPending, startQATransition] = useTransition();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isAnswerCopied, setIsAnswerCopied] = useState(false);
  const [inputSource, setInputSource] = useState<InputSource>("text");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("summary");
  const [outputLanguage, setOutputLanguage] = useState<OutputLanguage>("indonesian");
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [storedSource, setStoredSource] = useState<StoredSource | null>(null);

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
    let payload: { outputFormat: OutputFormat, outputLanguage: OutputLanguage, text?: string, url?: string, question?: string } = { outputFormat, outputLanguage };
    let sourceToStore: StoredSource = {};

    if (inputSource === "text" && inputText.trim()) {
      payload.text = inputText;
      sourceToStore.text = inputText;
      hasInput = true;
    } else if (inputSource === "pdf" && inputText.trim()) {
      payload.text = inputText;
      sourceToStore.text = inputText;
      hasInput = true;
    } else if (inputSource === "url" && url.trim()) {
      payload.url = url;
      sourceToStore.url = url;
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
    
    setResult(null);
    setQaAnswer(null);
    setQuestion("");
    setStoredSource(sourceToStore);

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

  const handleQA = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim() || !storedSource) {
      toast({
        title: "Pertanyaan diperlukan",
        description: "Silakan masukkan pertanyaan Anda.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
        ...storedSource,
        question,
        outputFormat: 'summary', // A default value, not really used for QA
        outputLanguage: outputLanguage,
    };
    
    setQaAnswer(null);
    startQATransition(async () => {
      try {
        const qaResult = await summarizeIndonesianText(payload);
        setQaAnswer(qaResult.answer || "Tidak ada jawaban yang ditemukan.");
      } catch (error) {
         console.error("QA error:", error);
        toast({
          title: "Error",
          description: `Gagal mendapatkan jawaban. ${error instanceof Error ? error.message : ''}`,
          variant: "destructive",
        });
        setQaAnswer(null);
      }
    });

  }

  const handleCopy = useCallback((textToCopy: string, type: 'output' | 'answer') => {
    navigator.clipboard.writeText(textToCopy).then(() => {
        if (type === 'output') {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } else {
            setIsAnswerCopied(true);
            setTimeout(() => setIsAnswerCopied(false), 2000);
        }
        toast({
            title: "Tersalin!",
            description: "Teks berhasil disalin ke clipboard.",
        });
    });
  }, [toast]);

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
          Dapatkan Ringkasan, Poin Penting, atau Pertanyaan Kunci dari Teks Berbahasa Indonesia dalam Sekejap.
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
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-base font-semibold">Format Output</Label>
                 <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Button type="button" variant={outputFormat === 'summary' ? 'default' : 'outline'} onClick={() => setOutputFormat('summary')}>
                          📄 Ringkasan
                      </Button>
                      <Button type="button" variant={outputFormat === 'keyPoints' ? 'default' : 'outline'} onClick={() => setOutputFormat('keyPoints')}>
                          🎯 Poin Penting
                      </Button>
                      <Button type="button" variant={outputFormat === 'questions' ? 'default' : 'outline'} onClick={() => setOutputFormat('questions')}>
                          ❓ Pertanyaan
                      </Button>
                      <Button type="button" variant={outputFormat === 'contentIdeas' ? 'default' : 'outline'} onClick={() => setOutputFormat('contentIdeas')}>
                          💡 Ide Konten
                      </Button>
                  </div>
              </div>
               <div>
                <Label className="text-base font-semibold">Bahasa Output</Label>
                 <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Button type="button" variant={outputLanguage === 'indonesian' ? 'default' : 'outline'} onClick={() => setOutputLanguage('indonesian')}>
                          🇮🇩 Indonesian
                      </Button>
                      <Button type="button" variant={outputLanguage === 'english' ? 'default' : 'outline'} onClick={() => setOutputLanguage('english')}>
                          🇬🇧 English
                      </Button>
                      <Button type="button" variant={outputLanguage === 'arabic' ? 'default' : 'outline'} onClick={() => setOutputLanguage('arabic')}>
                          🇸🇦 Arabic
                      </Button>
                  </div>
              </div>
            </div>

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
        <div className="space-y-8 mt-8">
            <Card className="animate-in fade-in duration-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-headline">{getOutputTitle()}</CardTitle>
                     {result.outputFormat === "summary" && result.wordCountOriginal > 0 && (
                        <div className="text-sm text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1">
                            <span>Asli: <span className="font-medium text-foreground">{result.wordCountOriginal} kata</span></span>
                            <span>Output: <span className="font-medium text-foreground">{result.wordCountSummary} kata</span></span>
                            <span>Reduksi: <span className="font-medium text-foreground">{reductionPercentage}%</span></span>
                        </div>
                     )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(result.output, 'output')} aria-label="Copy output">
                    {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-accent-foreground/80" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                 <div className="text-base leading-relaxed whitespace-pre-wrap">{result.output}</div>
              </CardContent>
            </Card>

            <Card className="animate-in fade-in duration-500">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><HelpCircle className="h-6 w-6 text-primary"/> Tanya Jawab</CardTitle>
                    <CardDescription>Punya pertanyaan tentang teks di atas? Tanyakan di sini.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleQA} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="qa-input">Pertanyaan Anda</Label>
                            <Input 
                                id="qa-input" 
                                placeholder="Ketik pertanyaan Anda di sini..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                disabled={isQAPending}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isQAPending}>
                                {isQAPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        Mencari Jawaban...
                                    </>
                                ) : (
                                    "Tanya"
                                )}
                            </Button>
                        </div>
                    </form>
                    
                    {isQAPending && (
                        <div className="mt-4 space-y-2">
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-5/6" />
                        </div>
                    )}

                    {qaAnswer && (
                        <div className="mt-6 border-t pt-4">
                             <div className="flex justify-between items-start">
                                <h4 className="font-semibold">Jawaban:</h4>
                                <Button variant="ghost" size="icon" onClick={() => handleCopy(qaAnswer, 'answer')} aria-label="Copy answer">
                                    {isAnswerCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-accent-foreground/80" />}
                                </Button>
                             </div>
                             <p className="text-base leading-relaxed whitespace-pre-wrap mt-2">{qaAnswer}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
