import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook: POST /api/webhook/generate-pdf
 *
 * This is the orchestration endpoint that mirrors the n8n workflow:
 * 1. Webhook Trigger (this route)
 * 2. Validate input (IF node)
 * 3. Call PDF generation API (HTTP Request node)
 * 4. Check API success (IF node)
 * 5. Save to database (Database Insert node)
 * 6. Send email if provided (IF + Email node)
 * 7. Respond to webhook
 *
 * When n8n is set up, set USE_N8N=true and N8N_WEBHOOK_URL in .env
 * to forward requests to n8n instead of running this orchestration.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      pageColor = "#FFFFFF",
      textColor = "#000000",
      font = "Arial",
      template = "Simple",
      pageSize = "A4",
      orientation = "portrait",
      email,
    } = body;

    // ── Node 2: Validate Input ──
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed: text is required and cannot be empty.",
          node: "validation",
        },
        { status: 400 }
      );
    }

    // ── Node 3 & 4: Call PDF Generation API ──
    let pdfResult: { success: boolean; pdfUrl?: string; error?: string };

    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

      const pdfResponse = await fetch(`${baseUrl}/api/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          pageColor,
          textColor,
          font,
          template,
          pageSize,
          orientation,
        }),
      });

      pdfResult = await pdfResponse.json();

      if (!pdfResult.success || !pdfResult.pdfUrl) {
        return NextResponse.json(
          {
            success: false,
            error: pdfResult.error || "PDF generation API returned an error.",
            node: "pdf-generation",
          },
          { status: 502 }
        );
      }
    } catch (fetchError) {
      console.error("PDF API call failed:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to reach PDF generation API. Please try again.",
          node: "pdf-generation",
        },
        { status: 502 }
      );
    }

    const pdfUrl = pdfResult.pdfUrl!;
    const fileName = `document-${Date.now()}.pdf`;

    // ── Node 5 & 6: Save to Database ──
    let dbRecord = null;
    let emailSent = false;

    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

      const dbResponse = await fetch(`${baseUrl}/api/pdf-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: email || null,
          fileName,
          pdfUrl,
          template,
          font,
          pageSize,
          orientation,
          pageColor,
          textColor,
          textLength: text.length,
          emailSent: false,
        }),
      });

      const dbResult = await dbResponse.json();
      if (dbResult.success) {
        dbRecord = dbResult.data;
      }
    } catch (dbError) {
      console.error("Database save failed (non-fatal):", dbError);
      // Non-fatal: continue even if DB save fails
    }

    // ── Node 7 & 8: Send Email (optional) ──
    if (email && email.includes("@")) {
      try {
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000";

        const emailResponse = await fetch(`${baseUrl}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            pdfUrl,
            fileName,
          }),
        });

        const emailResult = await emailResponse.json();
        emailSent = emailResult.success === true;

        if (emailResult.skipped) {
          console.log("[Webhook] Email skipped - RESEND_API_KEY not configured");
        }
      } catch (emailError) {
        console.error("Email send failed (non-fatal):", emailError);
        // Non-fatal: continue even if email fails
      }

      // Update DB record with emailSent status
      if (dbRecord && emailSent) {
        try {
          const { db } = await import("@/lib/db");
          await db.pdfHistory.update({
            where: { id: dbRecord.id },
            data: { emailSent: true },
          });
        } catch {
          // Ignore update error
        }
      }
    }

    // ── Node 9: Respond to Webhook ──
    return NextResponse.json({
      success: true,
      pdfUrl,
      fileName,
      template,
      font,
      pageSize,
      orientation,
      emailSent,
      historyId: dbRecord?.id || null,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Webhook orchestration error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal webhook orchestration error",
        node: "orchestration",
      },
      { status: 500 }
    );
  }
}
