"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  Palette,
  Type,
  Layout,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Template definitions for the UI cards
const TEMPLATE_CONFIG = [
  {
    id: "Simple",
    description: "Clean and straightforward layout",
    accent: "#000000",
    preview: "border-gray-300",
  },
  {
    id: "Professional",
    description: "Elegant with header lines",
    accent: "#1a365d",
    preview: "border-blue-900",
  },
  {
    id: "Modern",
    description: "Bold accent bars and headings",
    accent: "#2563eb",
    preview: "border-blue-500",
  },
  {
    id: "Minimal",
    description: "Wide margins, lots of space",
    accent: "#374151",
    preview: "border-gray-500",
  },
  {
    id: "Resume",
    description: "Compact with double-line header",
    accent: "#1e40af",
    preview: "border-blue-700",
  },
  {
    id: "Report",
    description: "Structured with top bar",
    accent: "#059669",
    preview: "border-emerald-600",
  },
];

const FONTS = ["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana"];

// localStorage key
const SETTINGS_KEY = "pdf-converter-settings";

interface SavedSettings {
  pageColor: string;
  textColor: string;
  font: string;
  template: string;
  pageSize: string;
  orientation: string;
}

function loadSettings(): Partial<SavedSettings> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveSettings(settings: SavedSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

interface ConverterPageProps {
  onNavigate: () => void;
}

export default function ConverterPage({ onNavigate }: ConverterPageProps) {
  // Load saved settings on first render
  const [initialized, setInitialized] = useState(false);

  const [text, setText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [pageColor, setPageColor] = useState("#FFFFFF");
  const [textColor, setTextColor] = useState("#000000");
  const [font, setFont] = useState("Arial");
  const [template, setTemplate] = useState("Simple");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const livePreviewTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    if (!initialized) {
      const saved = loadSettings();
      if (saved.pageColor) setPageColor(saved.pageColor);
      if (saved.textColor) setTextColor(saved.textColor);
      if (saved.font) setFont(saved.font);
      if (saved.template) setTemplate(saved.template);
      if (saved.pageSize) setPageSize(saved.pageSize);
      if (saved.orientation) setOrientation(saved.orientation);
      setInitialized(true);
    }
  }, [initialized]);

  // Save settings whenever they change
  useEffect(() => {
    if (!initialized) return;
    saveSettings({ pageColor, textColor, font, template, pageSize, orientation });
  }, [pageColor, textColor, font, template, pageSize, orientation, initialized]);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.success && data.enhancedText) {
        setOriginalText(text);
        setText(data.enhancedText);
        setIsEnhanced(true);
        toast({
          title: "Text Enhanced!",
          description: "AI has improved your text. Review the changes and generate your PDF.",
        });
      } else {
        throw new Error(data.error || "Failed to enhance text");
      }
    } catch (error) {
      toast({
        title: "Enhancement Failed",
        description:
          error instanceof Error ? error.message : "Something went wrong. Please try again.",
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
      toast({ title: "Reverted", description: "Your original text has been restored." });
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          pageSize,
          orientation,
          pageColor,
          textColor,
          font,
          template,
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
          error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [text, pageSize, orientation, pageColor, textColor, font, template, toast]);

  // Live preview: auto-regenerate when settings change (debounced)
  useEffect(() => {
    if (!initialized || !text.trim() || isLoading || isEnhancing) return;

    if (livePreviewTimeout.current) {
      clearTimeout(livePreviewTimeout.current);
    }

    livePreviewTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/generate-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            pageSize,
            orientation,
            pageColor,
            textColor,
            font,
            template,
          }),
        });

        const data = await response.json();
        if (data.success && data.pdfUrl) {
          setPdfUrl(data.pdfUrl);
        }
      } catch {
        // Silently fail for live preview
      }
    }, 1500);

    return () => {
      if (livePreviewTimeout.current) {
        clearTimeout(livePreviewTimeout.current);
      }
    };
  }, [text, pageSize, orientation, pageColor, textColor, font, template, initialized, isLoading, isEnhancing]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Enter Your Text
              </h2>
              <p className="text-gray-500 text-sm">
                Paste or type the content you want to convert. Use{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  # Heading
                </code>{" "}
                for bold headings.
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
                placeholder={"Paste or type your text here...\n\nUse # for headings:\n# My Title\nRegular text here..."}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (isEnhanced) {
                    setIsEnhanced(false);
                    setOriginalText("");
                  }
                }}
                className="min-h-[220px] resize-y text-sm leading-relaxed"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{text.length} characters</p>
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

            {/* Template Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4 text-gray-500" />
                <Label className="text-sm font-medium">Template</Label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATE_CONFIG.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`relative p-3 rounded-xl border-2 text-left transition-all hover:shadow-sm ${
                      template === t.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    {template === t.id && (
                      <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                    )}
                    <div
                      className={`h-1.5 w-8 rounded-full mb-2 ${t.preview}`}
                      style={{ backgroundColor: t.accent }}
                    />
                    <p className="text-xs font-semibold text-gray-900">{t.id}</p>
                    <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                      {t.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors & Font */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Page Background</Label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={pageColor}
                      onChange={(e) => setPageColor(e.target.value)}
                      className="h-9 w-9 rounded-lg border border-gray-200 cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={pageColor}
                    onChange={(e) => setPageColor(e.target.value)}
                    className="h-9 flex-1 rounded-lg border border-gray-200 px-2 text-xs font-mono text-gray-600 bg-white"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Text Color</Label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-9 w-9 rounded-lg border border-gray-200 cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-9 flex-1 rounded-lg border border-gray-200 px-2 text-xs font-mono text-gray-600 bg-white"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            {/* Font & Page Settings */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Font</Label>
                </div>
                <Select value={font} onValueChange={setFont}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Page Size</Label>
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Size" />
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
                    <SelectValue placeholder="Orient." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Heading Info */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Lines starting with <code className="bg-amber-100 px-1 rounded font-mono">#</code> will be rendered as <strong>bold headings</strong> in the PDF. Example: <code className="bg-amber-100 px-1 rounded font-mono"># My Resume</code>
              </p>
            </div>

            {/* Generate Button */}
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
                <Button variant="outline" onClick={handleReset} className="gap-2">
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
                  Preview auto-updates as you change settings
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

            <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden min-h-[560px] flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4 text-gray-400">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm font-medium">Generating your PDF...</p>
                  <p className="text-xs text-gray-300">This usually takes a few seconds</p>
                </div>
              ) : isEnhancing ? (
                <div className="flex flex-col items-center gap-4 text-gray-400">
                  <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                  <p className="text-sm font-medium">AI is enhancing your text...</p>
                  <p className="text-xs text-gray-300">Improving grammar, clarity, and formatting</p>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full min-h-[560px] border-0"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-gray-300 p-8 text-center">
                  <div className="h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Eye className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">No preview yet</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Enter text to see a live preview
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm text-gray-500">Text to PDF Converter</span>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Text to PDF Converter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
