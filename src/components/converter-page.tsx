"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  Loader2,
  ArrowLeft,
  Eye,
  RefreshCw,
  Sparkles,
  Undo2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConverterPageProps {
  onNavigate: () => void;
}

export default function ConverterPage({ onNavigate }: ConverterPageProps) {
  const [text, setText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEnhance = useCallback(async () => {
    if (!text.trim()) {
      toast({
        title: "No text entered",
        description: "Please enter some text before enhancing.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);

    try {
      const response = await fetch("/api/enhance-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.success && data.enhancedText) {
        setOriginalText(text);
        setText(data.enhancedText);
        setIsEnhanced(true);
        toast({
          title: "Text Enhanced!",
          description:
            "AI has improved your text. Review the changes and generate your PDF.",
        });
      } else {
        throw new Error(data.error || "Failed to enhance text");
      }
    } catch (error) {
      toast({
        title: "Enhancement Failed",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  }, [text, toast]);

  const handleUndoEnhance = useCallback(() => {
    if (originalText) {
      setText(originalText);
      setOriginalText("");
      setIsEnhanced(false);
      toast({
        title: "Reverted",
        description: "Your original text has been restored.",
      });
    }
  }, [originalText, toast]);

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      toast({
        title: "No text entered",
        description: "Please enter some text before generating a PDF.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPdfUrl(null);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          pageSize,
          orientation,
        }),
      });

      const data = await response.json();

      if (data.success && data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
        toast({
          title: "PDF Generated!",
          description: "Your PDF is ready. Preview it below or download it.",
        });
      } else {
        throw new Error(data.error || "Failed to generate PDF");
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [text, pageSize, orientation, toast]);

  const handleDownload = useCallback(() => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "document.pdf";
    link.click();
  }, [pdfUrl]);

  const handleReset = useCallback(() => {
    setPdfUrl(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigate}
              className="text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold text-gray-900">Converter</span>
            </div>
          </div>
          {pdfUrl && (
            <Button onClick={handleDownload} size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Enter Your Text
              </h2>
              <p className="text-gray-500 text-sm">
                Paste or type the content you want to convert to PDF.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="text-input" className="text-sm font-medium">
                  Content
                </Label>
                {isEnhanced && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    AI Enhanced
                  </span>
                )}
              </div>
              <Textarea
                id="text-input"
                placeholder="Paste or type your text here..."
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (isEnhanced) {
                    setIsEnhanced(false);
                    setOriginalText("");
                  }
                }}
                className="min-h-[280px] resize-y text-sm leading-relaxed"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {text.length} characters
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEnhance}
                    disabled={isEnhancing || !text.trim()}
                    className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                  >
                    {isEnhancing ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        Enhance with AI
                      </>
                    )}
                  </Button>
                  {isEnhanced && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUndoEnhance}
                      className="h-7 text-xs gap-1 text-gray-500 hover:text-gray-700"
                    >
                      <Undo2 className="h-3 w-3" />
                      Undo
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Page Size</Label>
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Orientation</Label>
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !text.trim()}
                className="flex-1 py-5 text-base gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generate PDF
                  </>
                )}
              </Button>
              {pdfUrl && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  PDF Preview
                </h2>
                <p className="text-gray-500 text-sm">
                  Preview your generated PDF before downloading.
                </p>
              </div>
              {pdfUrl && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden min-h-[480px] flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4 text-gray-400">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm font-medium">Generating your PDF...</p>
                  <p className="text-xs text-gray-300">
                    This usually takes a few seconds
                  </p>
                </div>
              ) : isEnhancing ? (
                <div className="flex flex-col items-center gap-4 text-gray-400">
                  <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                  <p className="text-sm font-medium">AI is enhancing your text...</p>
                  <p className="text-xs text-gray-300">
                    Improving grammar, clarity, and formatting
                  </p>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full min-h-[480px] border-0"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-gray-300 p-8 text-center">
                  <div className="h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Eye className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">
                      No preview yet
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      Enter text and click &ldquo;Generate PDF&rdquo; to see a
                      preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm text-gray-500">
              Text to PDF Converter
            </span>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Text to PDF Converter. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
