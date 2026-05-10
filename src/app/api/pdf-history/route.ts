import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/pdf-history - Retrieve PDF generation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where = email ? { userEmail: email } : {};

    const history = await db.pdfHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("PDF history fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch PDF history" },
      { status: 500 }
    );
  }
}

// POST /api/pdf-history - Save a PDF generation record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userEmail,
      fileName,
      pdfUrl,
      template,
      font,
      pageSize,
      orientation,
      pageColor,
      textColor,
      textLength,
      emailSent,
    } = body;

    if (!fileName || !pdfUrl) {
      return NextResponse.json(
        { success: false, error: "fileName and pdfUrl are required" },
        { status: 400 }
      );
    }

    const record = await db.pdfHistory.create({
      data: {
        userEmail: userEmail || null,
        fileName,
        pdfUrl,
        template: template || "Simple",
        font: font || "Arial",
        pageSize: pageSize || "A4",
        orientation: orientation || "portrait",
        pageColor: pageColor || "#FFFFFF",
        textColor: textColor || "#000000",
        textLength: textLength || 0,
        emailSent: emailSent || false,
      },
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("PDF history save error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save PDF history" },
      { status: 500 }
    );
  }
}
