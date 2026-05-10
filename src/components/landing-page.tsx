"use client";

import { Button } from "@/components/ui/button";
import {
  Zap,
  MousePointerClick,
  ShieldCheck,
  Download,
  FileText,
} from "lucide-react";

interface LandingPageProps {
  onNavigate: () => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gray-900">
              Text to PDF
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <button
              onClick={onNavigate}
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Converter
            </button>
            <Button onClick={onNavigate} size="sm">
              Try Now
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            Lightning-fast conversion
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            Convert Text to PDF
            <br />
            <span className="text-primary">Instantly</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste your text and download it as a PDF in one click. No sign-up,
            no hassle — just simple, secure conversion.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={onNavigate}
              className="text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Try Now — It&apos;s Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onNavigate}
              className="text-base px-8 py-6 rounded-xl"
            >
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50/80 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Converter?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Built for simplicity and speed. No unnecessary features, just
              exactly what you need.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Fast Conversion"
              description="Generate your PDF in seconds. Our optimized engine processes your text instantly without any delays."
            />
            <FeatureCard
              icon={<MousePointerClick className="h-6 w-6" />}
              title="Simple Interface"
              description="No clutter, no learning curve. Just paste your text, pick your settings, and click generate."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Secure Processing"
              description="Your text is processed securely and never stored. Privacy is our priority — your data stays yours."
            />
            <FeatureCard
              icon={<Download className="h-6 w-6" />}
              title="Instant Download"
              description="Preview your PDF before downloading. Get exactly what you expect, every single time."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Convert?
          </h2>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
            Start converting your text to professional PDFs right now. It takes
            less than a minute.
          </p>
          <Button
            size="lg"
            onClick={onNavigate}
            className="text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Start Converting
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-auto">
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all group">
      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
