"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { summarizeIndonesianText, SummarizeIndonesianTextOutput } from "@/ai/flows/summarize-indonesian-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function SummarizerPage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<SummarizeIndonesianTextOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [inputWordCount, setInputWordCount] = useState(0);

  const countWords = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  useEffect(() => {
    setInputWordCount(countWords(inputText));
  }, [inputText]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputText.trim()) {
      toast({
        title: "Input Text Required",
        description: "Please enter some text to summarize.",
        variant: "destructive",
      });
      return;
    }
    setResult(null); 
    startTransition(async () => {
      try {
        const summaryResult = await summarizeIndonesianText({ text: inputText });
        setResult(summaryResult);
      } catch (error) {
        console.error("Summarization error:", error);
        toast({
          title: "Error",
          description: "Failed to summarize the text. Please try again.",
          variant: "destructive",
        });
        setResult(null);
      }
    });
  };

  const handleCopy = useCallback(() => {
    if (result?.summary) {
      navigator.clipboard.writeText(result.summary).then(() => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Summary copied to clipboard.",
        });
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  }, [result, toast]);

  const reductionPercentage = result && result.wordCountOriginal > 0 
    ? Math.round(100 - (result.wordCountSummary / result.wordCountOriginal * 100))
    : 0;

  return (
    <div className="container max-w-4xl mx-auto p-4 md:py-12">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
          AI-Powered Indonesian Text Summarizer
        </h1>
        <p className="text-muted-foreground mt-2">
          Paste your Indonesian text below to get a concise summary in seconds.
        </p>
      </div>
        
      <Card className="mt-8 p-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-2 relative">
            <Textarea
              placeholder="Paste your long Indonesian text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] text-base p-4 rounded-lg shadow-inner bg-secondary/50"
              rows={10}
            />
            <p className="text-sm text-muted-foreground text-right pr-2">
              Word count: {inputWordCount}
            </p>
          </div>
          <div className="text-center">
            <Button type="submit" disabled={isPending || !inputText.trim()} size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Summarizing...
                </>
              ) : (
                "Summarize Text"
              )}
            </Button>
          </div>
        </form>
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
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-headline">Summary</CardTitle>
                <div className="text-sm text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Original: <span className="font-medium text-foreground">{result.wordCountOriginal} words</span></span>
                  <span>Summary: <span className="font-medium text-foreground">{result.wordCountSummary} words</span></span>
                  <span>Reduction: <span className="font-medium text-foreground">{reductionPercentage}%</span></span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy summary">
                {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-accent-foreground/80" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{result.summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
