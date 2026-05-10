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

// Template definitions
interface TemplateConfig {
  margin: number;
  fontSize: number;
  headingFontSize: number;
  lineHeight: number;
  headerStyle: "none" | "line" | "bar" | "accent-bar" | "double-line";
  accentColor: string;
  spacing: number;
  showPageNumbers: boolean;
  headingSpacing: number;
}

const TEMPLATES: Record<string, TemplateConfig> = {
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

    // Create PDF
    const pdfDoc = await PDFDocument.create();

    // Get fonts
    const fontConfig = FONT_MAP[fontName] || FONT_MAP.Arial;
    const regularFont = await pdfDoc.embedFont(fontConfig.regular);
    const boldFont = await pdfDoc.embedFont(fontConfig.bold);

    const margin = tmpl.margin;
    const maxWidth = width - margin * 2;

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
    const usableHeight = height - margin * 2;

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

      // Draw header based on template style
      switch (tmpl.headerStyle) {
        case "line":
          page.drawLine({
            start: { x: margin, y: height - margin + 15 },
            end: { x: width - margin, y: height - margin + 15 },
            thickness: 1,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
          break;

        case "bar":
          page.drawRectangle({
            x: 0,
            y: height - margin + 5,
            width,
            height: 20,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
          break;

        case "accent-bar":
          page.drawRectangle({
            x: 0,
            y: height - margin + 5,
            width: 6,
            height: 30,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
          break;

        case "double-line":
          page.drawLine({
            start: { x: margin, y: height - margin + 20 },
            end: { x: width - margin, y: height - margin + 20 },
            thickness: 2,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
          page.drawLine({
            start: { x: margin, y: height - margin + 14 },
            end: { x: width - margin, y: height - margin + 14 },
            thickness: 0.5,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
          break;
      }

      // Draw text lines
      let y = height - margin - 10;
      for (const line of pageLines) {
        if (line.text === "") {
          y -= line.height;
          continue;
        }

        const currentFont = line.isHeading ? boldFont : regularFont;
        const currentSize = line.isHeading ? tmpl.headingFontSize : tmpl.fontSize;

        // For Modern template: draw accent left bar for headings
        if (line.isHeading && tmpl.headerStyle === "accent-bar") {
          page.drawRectangle({
            x: margin - 4,
            y: y - 3,
            width: 3,
            height: currentSize + 2,
            color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
          });
        }

        page.drawText(line.text, {
          x: margin,
          y,
          size: currentSize,
          font: currentFont,
          color: rgb(txtColor.r, txtColor.g, txtColor.b),
        });

        y -= line.height;
      }

      // Page numbers
      if (tmpl.showPageNumbers) {
        const pageNum = p + 1;
        const totalText = `Page ${pageNum}`;
        const pageNumWidth = regularFont.widthOfTextAtSize(totalText, 9);
        page.drawText(totalText, {
          x: (width - pageNumWidth) / 2,
          y: margin - 20,
          size: 9,
          font: regularFont,
          color: rgb(0.6, 0.6, 0.6),
        });
      }

      // Footer line for some templates
      if (tmpl.headerStyle === "line" || tmpl.headerStyle === "double-line") {
        page.drawLine({
          start: { x: margin, y: margin - 8 },
          end: { x: width - margin, y: margin - 8 },
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
