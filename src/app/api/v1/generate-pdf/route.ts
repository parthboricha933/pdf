import { NextRequest } from "next/server";
import {
  CORS_HEADERS,
  corsResponse,
  corsBinaryResponse,
  authenticate,
  checkRateLimit,
  validateGenerateRequest,
  type GeneratePdfRequest,
} from "@/lib/api-utils";

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * POST /api/v1/generate-pdf
 *
 * External API endpoint for generating PDFs.
 *
 * Authentication (optional):
 * - Authorization: Bearer <API_KEY>
 * - X-API-Key: <API_KEY>
 *
 * Without API key: 10 requests/minute (public rate limit)
 * With API key: 1000 requests/minute
 *
 * Request body:
 * {
 *   "text": "required - text content, # for headings",
 *   "template": "optional - default: Simple",
 *   "font": "optional - default: Arial",
 *   "pageColor": "optional - default: #FFFFFF",
 *   "textColor": "optional - default: #000000",
 *   "pageSize": "optional - A4|Letter, default: A4",
 *   "orientation": "optional - portrait|landscape, default: portrait",
 *   "fileName": "optional - default: document.pdf",
 *   "responseFormat": "optional - json|binary, default: json"
 * }
 *
 * Response (json mode):
 * { "success": true, "data": { "pdfBase64": "...", "fileName": "...", "template": "...", ... } }
 *
 * Response (binary mode):
 * Raw PDF file download
 */
export async function POST(request: NextRequest) {
  try {
    // ── Authenticate ──
    const auth = await authenticate(request);

    if (!auth.authenticated && !auth.isPublic) {
      return corsResponse(
        { success: false, error: auth.error },
        401
      );
    }

    // ── Rate limit ──
    const rateLimitId = auth.apiKeyId || request.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = checkRateLimit(rateLimitId, auth.authenticated);

    if (!rateLimit.allowed) {
      return corsResponse(
        {
          success: false,
          error: "Rate limit exceeded",
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        429,
        { "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString() }
      );
    }

    // ── Parse and validate body ──
    let body: Partial<GeneratePdfRequest>;
    try {
      body = await request.json();
    } catch {
      return corsResponse(
        { success: false, error: "Invalid JSON body" },
        400
      );
    }

    const validation = validateGenerateRequest(body);
    if (!validation.valid) {
      return corsResponse(
        { success: false, error: "Validation failed", details: validation.errors },
        400
      );
    }

    // ── Generate PDF via internal API ──
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const pdfResponse = await fetch(`${baseUrl}/api/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: body.text,
        template: body.template || "Simple",
        font: body.font || "Arial",
        pageColor: body.pageColor || "#FFFFFF",
        textColor: body.textColor || "#000000",
        pageSize: body.pageSize || "A4",
        orientation: body.orientation || "portrait",
      }),
    });

    const pdfResult = await pdfResponse.json();

    if (!pdfResult.success || !pdfResult.pdfUrl) {
      return corsResponse(
        { success: false, error: pdfResult.error || "PDF generation failed" },
        502
      );
    }

    // ── Extract base64 data ──
    const dataUrl = pdfResult.pdfUrl as string;
    const base64Data = dataUrl.replace("data:application/pdf;base64,", "");
    const pdfBuffer = Buffer.from(base64Data, "base64");
    const fileName = body.fileName || "document.pdf";

    // ── Save to history (non-blocking) ──
    fetch(`${baseUrl}/api/pdf-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName,
        pdfUrl: dataUrl,
        template: body.template || "Simple",
        font: body.font || "Arial",
        pageSize: body.pageSize || "A4",
        orientation: body.orientation || "portrait",
        pageColor: body.pageColor || "#FFFFFF",
        textColor: body.textColor || "#000000",
        textLength: (body.text || "").length,
        emailSent: false,
      }),
    }).catch(() => {});

    // ── Return based on format ──
    const format = body.responseFormat || "json";

    if (format === "binary") {
      return corsBinaryResponse(pdfBuffer, fileName);
    }

    // JSON response
    return corsResponse({
      success: true,
      data: {
        pdfBase64: base64Data,
        pdfDataUrl: dataUrl,
        fileName,
        template: body.template || "Simple",
        font: body.font || "Arial",
        pageSize: body.pageSize || "A4",
        orientation: body.orientation || "portrait",
        pageColor: body.pageColor || "#FFFFFF",
        textColor: body.textColor || "#000000",
        textLength: (body.text || "").length,
      },
      meta: {
        authenticated: auth.authenticated,
        rateLimit: {
          remaining: rateLimit.remaining,
          resetAt: new Date(rateLimit.resetAt).toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("v1 generate-pdf error:", error);
    return corsResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
