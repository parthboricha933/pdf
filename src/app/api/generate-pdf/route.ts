import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Helper: parse hex color to rgb (0-1 range)
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;
  return { r, g, b };
}

// Font mapping to pdf-lib standard fonts
const FONT_MAP: Record<string, { regular: StandardFonts; bold: StandardFonts }> = {
  Arial: { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold },
  Helvetica: { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold },
  "Times New Roman": { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold },
  Georgia: { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold },
  "Courier New": { regular: StandardFonts.Courier, bold: StandardFonts.CourierBold },
  Verdana: { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold },
};

// Template definitions — 6 base + 15 sample template overrides
interface TemplateConfig {
  margin: number;
  fontSize: number;
  headingFontSize: number;
  lineHeight: number;
  headerStyle: "none" | "line" | "bar" | "accent-bar" | "double-line" | "sidebar" | "bordered" | "comic" | "certificate" | "storybook";
  accentColor: string;
  headingColor?: string; // overrides textColor for headings
  spacing: number;
  showPageNumbers: boolean;
  headingSpacing: number;
  sidebarWidth?: number;
  sidebarColor?: string;
  borderColor?: string;
  footerLine?: boolean;
}

const TEMPLATES: Record<string, TemplateConfig> = {
  // ── Original 6 Base Templates ──
  Simple: {
    margin: 50,
    fontSize: 12,
    headingFontSize: 18,
    lineHeight: 18,
    headerStyle: "none",
    accentColor: "#000000",
    spacing: 4,
    showPageNumbers: true,
    headingSpacing: 8,
  },
  Professional: {
    margin: 60,
    fontSize: 11,
    headingFontSize: 16,
    lineHeight: 17,
    headerStyle: "line",
    accentColor: "#1a365d",
    spacing: 4,
    showPageNumbers: true,
    headingSpacing: 10,
    footerLine: true,
  },
  Modern: {
    margin: 55,
    fontSize: 11,
    headingFontSize: 20,
    lineHeight: 17,
    headerStyle: "accent-bar",
    accentColor: "#2563eb",
    spacing: 5,
    showPageNumbers: false,
    headingSpacing: 12,
  },
  Minimal: {
    margin: 70,
    fontSize: 11,
    headingFontSize: 14,
    lineHeight: 20,
    headerStyle: "none",
    accentColor: "#374151",
    spacing: 6,
    showPageNumbers: false,
    headingSpacing: 10,
  },
  Resume: {
    margin: 50,
    fontSize: 10.5,
    headingFontSize: 14,
    lineHeight: 16,
    headerStyle: "double-line",
    accentColor: "#1e40af",
    spacing: 2,
    showPageNumbers: false,
    headingSpacing: 6,
    footerLine: true,
  },
  Report: {
    margin: 60,
    fontSize: 11,
    headingFontSize: 18,
    lineHeight: 17,
    headerStyle: "bar",
    accentColor: "#059669",
    spacing: 4,
    showPageNumbers: true,
    headingSpacing: 10,
  },

  // ── 15 Sample Templates with Custom Styling ──

  "professional-resume": {
    margin: 45,
    fontSize: 10,
    headingFontSize: 13,
    lineHeight: 15,
    headerStyle: "sidebar",
    accentColor: "#3B82F6",
    headingColor: "#1D4ED8",
    spacing: 2,
    showPageNumbers: false,
    headingSpacing: 6,
    sidebarWidth: 140,
    sidebarColor: "#1D4ED8",
  },
  "modern-cv": {
    margin: 55,
    fontSize: 10.5,
    headingFontSize: 16,
    lineHeight: 16,
    headerStyle: "accent-bar",
    accentColor: "#14B8A6",
    headingColor: "#0F766E",
    spacing: 3,
    showPageNumbers: false,
    headingSpacing: 10,
  },
  "corporate-report": {
    margin: 60,
    fontSize: 11,
    headingFontSize: 18,
    lineHeight: 17,
    headerStyle: "bar",
    accentColor: "#2563EB",
    headingColor: "#1E3A5F",
    spacing: 4,
    showPageNumbers: true,
    headingSpacing: 10,
  },
  "business-proposal": {
    margin: 60,
    fontSize: 11,
    headingFontSize: 16,
    lineHeight: 17,
    headerStyle: "line",
    accentColor: "#D97706",
    headingColor: "#92400E",
    spacing: 4,
    showPageNumbers: true,
    headingSpacing: 10,
    footerLine: true,
  },
  invoice: {
    margin: 50,
    fontSize: 10.5,
    headingFontSize: 15,
    lineHeight: 16,
    headerStyle: "bar",
    accentColor: "#10B981",
    headingColor: "#065F46",
    spacing: 3,
    showPageNumbers: false,
    headingSpacing: 8,
  },
  "project-documentation": {
    margin: 50,
    fontSize: 10,
    headingFontSize: 14,
    lineHeight: 15,
    headerStyle: "accent-bar",
    accentColor: "#6366F1",
    headingColor: "#4338CA",
    spacing: 3,
    showPageNumbers: true,
    headingSpacing: 8,
  },
  "academic-notes": {
    margin: 55,
    fontSize: 11,
    headingFontSize: 16,
    lineHeight: 17,
    headerStyle: "line",
    accentColor: "#3B82F6",
    headingColor: "#1E40AF",
    spacing: 4,
    showPageNumbers: true,
    headingSpacing: 8,
  },
  "research-paper": {
    margin: 65,
    fontSize: 11,
    headingFontSize: 16,
    lineHeight: 17,
    headerStyle: "line",
    accentColor: "#374151",
    headingColor: "#000000",
    spacing: 4,
    showPageNumbers: true,
    headingSpacing: 10,
    footerLine: true,
  },
  certificate: {
    margin: 50,
    fontSize: 12,
    headingFontSize: 22,
    lineHeight: 20,
    headerStyle: "certificate",
    accentColor: "#D97706",
    headingColor: "#92400E",
    spacing: 6,
    showPageNumbers: false,
    headingSpacing: 14,
    borderColor: "#D97706",
  },
  "ebook-chapter": {
    margin: 70,
    fontSize: 12,
    headingFontSize: 18,
    lineHeight: 22,
    headerStyle: "none",
    accentColor: "#B45309",
    headingColor: "#78350F",
    spacing: 6,
    showPageNumbers: false,
    headingSpacing: 14,
  },
  "meeting-minutes": {
    margin: 55,
    fontSize: 10.5,
    headingFontSize: 15,
    lineHeight: 16,
    headerStyle: "bar",
    accentColor: "#14B8A6",
    headingColor: "#0F766E",
    spacing: 3,
    showPageNumbers: true,
    headingSpacing: 8,
  },
  "personal-letter": {
    margin: 65,
    fontSize: 12,
    headingFontSize: 14,
    lineHeight: 20,
    headerStyle: "none",
    accentColor: "#C2410C",
    headingColor: "#7C2D12",
    spacing: 5,
    showPageNumbers: false,
    headingSpacing: 10,
  },
  "comic-book-classic": {
    margin: 45,
    fontSize: 11,
    headingFontSize: 22,
    lineHeight: 17,
    headerStyle: "comic",
    accentColor: "#FF6F00",
    headingColor: "#D32F2F",
    spacing: 4,
    showPageNumbers: false,
    headingSpacing: 12,
  },
  "manga-style": {
    margin: 55,
    fontSize: 11,
    headingFontSize: 16,
    lineHeight: 18,
    headerStyle: "accent-bar",
    accentColor: "#374151",
    headingColor: "#000000",
    spacing: 4,
    showPageNumbers: false,
    headingSpacing: 10,
  },
  "kids-storybook": {
    margin: 55,
    fontSize: 13,
    headingFontSize: 20,
    lineHeight: 20,
    headerStyle: "storybook",
    accentColor: "#F59E0B",
    headingColor: "#DC2626",
    spacing: 6,
    showPageNumbers: false,
    headingSpacing: 14,
  },
};

interface TextLine {
  text: string;
  isHeading: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      pageSize,
      orientation,
      pageColor = "#FFFFFF",
      textColor = "#000000",
      font: fontName = "Arial",
      template: templateName = "Simple",
    } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "No text provided" },
        { status: 400 }
      );
    }

    // Get template config
    const tmpl = TEMPLATES[templateName] || TEMPLATES.Simple;

    // Determine page dimensions
    const isLandscape = orientation === "landscape";
    let width: number;
    let height: number;

    if (pageSize === "Letter") {
      width = isLandscape ? 792 : 612;
      height = isLandscape ? 612 : 792;
    } else {
      width = isLandscape ? 842 : 595;
      height = isLandscape ? 595 : 842;
    }

    // Parse colors
    const bgColor = hexToRgb(pageColor);
    const txtColor = hexToRgb(textColor);
    const accentRgb = hexToRgb(tmpl.accentColor);
    const headingRgb = tmpl.headingColor ? hexToRgb(tmpl.headingColor) : txtColor;

    // For sidebar templates, adjust layout
    const isSidebar = tmpl.headerStyle === "sidebar" && tmpl.sidebarWidth;
    const sidebarW = isSidebar ? tmpl.sidebarWidth! : 0;
    const effectiveMargin = isSidebar ? tmpl.margin : tmpl.margin;
    const contentMarginLeft = isSidebar ? sidebarW + 15 : effectiveMargin;
    const contentMarginRight = effectiveMargin;

    // Create PDF
    const pdfDoc = await PDFDocument.create();

    // Get fonts
    const fontConfig = FONT_MAP[fontName] || FONT_MAP.Arial;
    const regularFont = await pdfDoc.embedFont(fontConfig.regular);
    const boldFont = await pdfDoc.embedFont(fontConfig.bold);

    const maxWidth = width - contentMarginLeft - contentMarginRight;

    // Parse text into lines with heading detection
    const rawLines = text.split("\n");
    const parsedLines: TextLine[] = [];

    for (const line of rawLines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        parsedLines.push({ text: "", isHeading: false });
        continue;
      }

      // Check for heading markers (# ## ### etc.)
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        parsedLines.push({ text: headingMatch[2], isHeading: true });
      } else {
        parsedLines.push({ text: trimmed, isHeading: false });
      }
    }

    // Word-wrap lines
    interface WrappedLine {
      text: string;
      isHeading: boolean;
      height: number;
    }

    const wrappedLines: WrappedLine[] = [];

    for (const parsed of parsedLines) {
      if (parsed.text === "") {
        wrappedLines.push({ text: "", isHeading: false, height: tmpl.spacing });
        continue;
      }

      const currentFont = parsed.isHeading ? boldFont : regularFont;
      const currentSize = parsed.isHeading ? tmpl.headingFontSize : tmpl.fontSize;
      const currentLineHeight = parsed.isHeading
        ? tmpl.headingFontSize + tmpl.headingSpacing
        : tmpl.lineHeight;

      const words = parsed.text.split(" ");
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = currentFont.widthOfTextAtSize(testLine, currentSize);

        if (testWidth > maxWidth && currentLine) {
          wrappedLines.push({
            text: currentLine,
            isHeading: parsed.isHeading,
            height: currentLineHeight,
          });
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        wrappedLines.push({
          text: currentLine,
          isHeading: parsed.isHeading,
          height: currentLineHeight,
        });
      }
    }

    // Calculate which lines go on which page
    const pageBreaks: number[] = [0];
    let currentY = 0;
    const usableHeight = height - effectiveMargin * 2;

    for (let i = 0; i < wrappedLines.length; i++) {
      const lineH = wrappedLines[i].height;
      if (currentY + lineH > usableHeight && i > 0) {
        pageBreaks.push(i);
        currentY = lineH;
      } else {
        currentY += lineH;
      }
    }

    // Create pages
    for (let p = 0; p < pageBreaks.length; p++) {
      const startIdx = pageBreaks[p];
      const endIdx = p + 1 < pageBreaks.length ? pageBreaks[p + 1] : wrappedLines.length;
      const pageLines = wrappedLines.slice(startIdx, endIdx);

      const page = pdfDoc.addPage([width, height]);

      // Fill page background
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(bgColor.r, bgColor.g, bgColor.b),
      });

      // ── Draw sidebar (resume-style) ──
      if (isSidebar) {
        const sidebarRgb = tmpl.sidebarColor ? hexToRgb(tmpl.sidebarColor) : accentRgb;
        page.drawRectangle({
          x: 0,
          y: 0,
          width: sidebarW,
          height,
          color: rgb(sidebarRgb.r, sidebarRgb.g, sidebarRgb.b),
        });

        // Extract sidebar content (lines before first non-heading text or first 3 items)
        // For simplicity, sidebar shows the first few lines in white
        const sidebarLines = pageLines.slice(0, Math.min(6, pageLines.length));
        let sy = height - effectiveMargin - 10;
        for (const line of sidebarLines) {
          if (line.text === "") {
            sy -= line.height;
            continue;
          }
          const currentFont = line.isHeading ? boldFont : regularFont;
          const currentSize = line.isHeading ? tmpl.headingFontSize - 1 : tmpl.fontSize - 1;

          try {
            page.drawText(line.text, {
              x: 10,
              y: sy,
              size: currentSize,
              font: currentFont,
              color: rgb(1, 1, 1),
            });
          } catch {
            // Skip characters not in font
          }
          sy -= line.height;
        }
      }

      // ── Draw header based on template style ──
      switch (tmpl.headerStyle) {
        case "line":
          page.drawLine({
            start: { x: effectiveMargin, y: height - effectiveMargin + 15 },
            end: { x: width - effectiveMargin, y: height - effectiveMargin + 15 },
            thickness: 1,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
          break;

        case "bar":
          page.drawRectangle({
            x: 0,
            y: height - effectiveMargin + 5,
            width,
            height: 20,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
          break;

        case "accent-bar":
          page.drawRectangle({
            x: 0,
            y: height - effectiveMargin + 5,
            width: 6,
            height: 30,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
          break;

        case "double-line":
          page.drawLine({
            start: { x: effectiveMargin, y: height - effectiveMargin + 20 },
            end: { x: width - effectiveMargin, y: height - effectiveMargin + 20 },
            thickness: 2,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
          page.drawLine({
            start: { x: effectiveMargin, y: height - effectiveMargin + 14 },
            end: { x: width - effectiveMargin, y: height - effectiveMargin + 14 },
            thickness: 0.5,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
          break;

        case "comic":
          // Bold top bar + accent stripe
          page.drawRectangle({
            x: 0,
            y: height - effectiveMargin + 5,
            width,
            height: 24,
            color: rgb(headingRgb.r, headingRgb.g, headingRgb.b),
          });
          page.drawRectangle({
            x: 0,
            y: height - effectiveMargin + 5,
            width,
            height: 6,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
          break;

        case "certificate":
          // Double border frame
          const borderRgb = tmpl.borderColor ? hexToRgb(tmpl.borderColor) : accentRgb;
          page.drawRectangle({
            x: 12,
            y: 12,
            width: width - 24,
            height: height - 24,
            borderColor: rgb(borderRgb.r, borderRgb.g, borderRgb.b),
            borderWidth: 2,
            color: rgb(bgColor.r, bgColor.g, bgColor.b),
          });
          page.drawRectangle({
            x: 18,
            y: 18,
            width: width - 36,
            height: height - 36,
            borderColor: rgb(borderRgb.r, borderRgb.g, borderRgb.b),
            borderWidth: 1,
            color: rgb(bgColor.r, bgColor.g, bgColor.b),
          });
          // Corner decorations
          const cornerSize = 15;
          const corners = [
            { x: 24, y: height - 24 },
            { x: width - 24, y: height - 24 },
            { x: 24, y: 24 },
            { x: width - 24, y: 24 },
          ];
          for (const corner of corners) {
            page.drawRectangle({
              x: corner.x - 3,
              y: corner.y - 3,
              width: cornerSize,
              height: cornerSize,
              borderColor: rgb(borderRgb.r, borderRgb.g, borderRgb.b),
              borderWidth: 1,
              color: rgb(bgColor.r, bgColor.g, bgColor.b),
            });
          }
          break;

        case "storybook":
          // Colorful wavy-style top bar
          page.drawRectangle({
            x: 0,
            y: height - effectiveMargin + 5,
            width,
            height: 28,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
          // Dot decorations
          const dotCount = 8;
          for (let d = 0; d < dotCount; d++) {
            const dx = (width / dotCount) * d + width / (dotCount * 2);
            page.drawCircle({
              x: dx,
              y: height - effectiveMargin + 19,
              size: 4,
              color: rgb(headingRgb.r, headingRgb.g, headingRgb.b),
            });
          }
          break;

        case "sidebar":
          // Sidebar already drawn above, add a thin separator line
          if (isSidebar) {
            page.drawLine({
              start: { x: sidebarW + 5, y: effectiveMargin },
              end: { x: sidebarW + 5, y: height - effectiveMargin },
              thickness: 0.5,
              color: rgb(0.85, 0.85, 0.85),
            });
          }
          break;
      }

      // ── Draw text lines ──
      let y = height - effectiveMargin - 10;

      // Skip sidebar lines from main content area if sidebar template
      const mainLines = isSidebar
        ? pageLines.slice(Math.min(6, pageLines.length))
        : pageLines;

      for (const line of mainLines) {
        if (line.text === "") {
          y -= line.height;
          continue;
        }

        const currentFont = line.isHeading ? boldFont : regularFont;
        const currentSize = line.isHeading ? tmpl.headingFontSize : tmpl.fontSize;
        const currentColor = line.isHeading
          ? rgb(headingRgb.r, headingRgb.g, headingRgb.b)
          : rgb(txtColor.r, txtColor.g, txtColor.b);

        // For Modern/accent-bar template: draw accent left bar for headings
        if (line.isHeading && (tmpl.headerStyle === "accent-bar" || tmpl.headerStyle === "manga-style")) {
          page.drawRectangle({
            x: contentMarginLeft - 4,
            y: y - 3,
            width: 3,
            height: currentSize + 2,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
        }

        // Comic-style: bold heading underline
        if (line.isHeading && tmpl.headerStyle === "comic") {
          page.drawText(line.text.toUpperCase(), {
            x: contentMarginLeft,
            y,
            size: currentSize,
            font: currentFont,
            color: currentColor,
          });
          page.drawLine({
            start: { x: contentMarginLeft, y: y - 4 },
            end: { x: contentMarginLeft + currentFont.widthOfTextAtSize(line.text.toUpperCase(), currentSize), y: y - 4 },
            thickness: 2,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
        } else {
          try {
            page.drawText(line.text, {
              x: contentMarginLeft,
              y,
              size: currentSize,
              font: currentFont,
              color: currentColor,
            });
          } catch {
            // Skip characters not in font
          }
        }

        y -= line.height;
      }

      // ── Page numbers ──
      if (tmpl.showPageNumbers) {
        const pageNum = p + 1;
        const totalText = `Page ${pageNum}`;
        const pageNumWidth = regularFont.widthOfTextAtSize(totalText, 9);
        page.drawText(totalText, {
          x: (width - pageNumWidth) / 2,
          y: effectiveMargin - 20,
          size: 9,
          font: regularFont,
          color: rgb(0.6, 0.6, 0.6),
        });
      }

      // ── Footer line ──
      if (tmpl.footerLine || tmpl.headerStyle === "line" || tmpl.headerStyle === "double-line") {
        page.drawLine({
          start: { x: effectiveMargin, y: effectiveMargin - 8 },
          end: { x: width - effectiveMargin, y: effectiveMargin - 8 },
          thickness: 0.5,
          color: rgb(0.85, 0.85, 0.85),
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");
    const dataUrl = `data:application/pdf;base64,${base64}`;

    return NextResponse.json({
      success: true,
      pdfUrl: dataUrl,
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate PDF",
      },
      { status: 500 }
    );
  }
}
