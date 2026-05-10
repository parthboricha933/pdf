import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, pageSize, orientation } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "No text provided" },
        { status: 400 }
      );
    }

    // Determine page dimensions
    const isLandscape = orientation === "landscape";
    let width: number;
    let height: number;

    if (pageSize === "Letter") {
      width = isLandscape ? 792 : 612; // 8.5 x 11 inches in points
      height = isLandscape ? 612 : 792;
    } else {
      // A4 default
      width = isLandscape ? 842 : 595; // A4 in points
      height = isLandscape ? 595 : 842;
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const margin = 50;
    const lineHeight = 16;
    const maxWidth = width - margin * 2;

    // Split text into lines that fit within the page width
    const paragraphs = text.split("\n");
    const allLines: string[] = [];

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === "") {
        allLines.push("");
        continue;
      }

      const words = paragraph.split(" ");
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, 12);

        if (testWidth > maxWidth && currentLine) {
          allLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        allLines.push(currentLine);
      }
    }

    // Calculate lines per page
    const usableHeight = height - margin * 2;
    const linesPerPage = Math.floor(usableHeight / lineHeight);

    // Create pages and add text
    let lineIndex = 0;
    while (lineIndex < allLines.length) {
      const page = pdfDoc.addPage([width, height]);

      // Add subtle header line
      page.drawLine({
        start: { x: margin, y: height - margin + 10 },
        end: { x: width - margin, y: height - margin + 10 },
        thickness: 0.5,
        color: rgb(0.85, 0.85, 0.85),
      });

      // Draw lines of text on this page
      const pageLines = allLines.slice(lineIndex, lineIndex + linesPerPage);
      for (let i = 0; i < pageLines.length; i++) {
        const y = height - margin - 20 - i * lineHeight;
        if (y < margin) break;

        page.drawText(pageLines[i], {
          x: margin,
          y,
          size: 12,
          font,
          color: rgb(0.15, 0.15, 0.15),
        });
      }

      // Add page number at bottom
      const pageNum = Math.floor(lineIndex / linesPerPage) + 1;
      const pageNumText = `Page ${pageNum}`;
      const pageNumWidth = font.widthOfTextAtSize(pageNumText, 9);
      page.drawText(pageNumText, {
        x: (width - pageNumWidth) / 2,
        y: margin - 15,
        size: 9,
        font,
        color: rgb(0.6, 0.6, 0.6),
      });

      lineIndex += linesPerPage;
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
