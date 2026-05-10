import { NextRequest } from "next/server";
import { CORS_HEADERS, corsResponse, authenticate, checkRateLimit } from "@/lib/api-utils";
import { SAMPLE_TEMPLATES } from "@/lib/templates";

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * GET /api/v1/templates
 *
 * List all available PDF templates.
 *
 * Query params:
 * - category: filter by category (Professional, Creative, Business, Education, Comic, Personal)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [...templates],
 *   "categories": [...],
 *   "meta": { "total": 21 }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // ── Auth (optional — public endpoint, just for rate limiting) ──
    const auth = await authenticate(request);
    const rateLimitId = auth.apiKeyId || request.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = checkRateLimit(rateLimitId, auth.authenticated);

    if (!rateLimit.allowed) {
      return corsResponse(
        { success: false, error: "Rate limit exceeded" },
        429
      );
    }

    // ── Filter by category ──
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const templates = category
      ? SAMPLE_TEMPLATES.filter((t) => t.category === category)
      : SAMPLE_TEMPLATES;

    // ── Also include the 6 base templates ──
    const baseTemplates = [
      { id: "Simple", name: "Simple", category: "Professional", description: "Clean and straightforward layout with page numbers.", font: "Arial", pageColor: "#FFFFFF", textColor: "#000000", headingColor: "#000000", accentColor: "#000000" },
      { id: "Professional", name: "Professional", category: "Professional", description: "Elegant design with header lines and structured sections.", font: "Arial", pageColor: "#FFFFFF", textColor: "#000000", headingColor: "#1a365d", accentColor: "#1a365d" },
      { id: "Modern", name: "Modern", category: "Creative", description: "Bold accent bars and contemporary styling.", font: "Arial", pageColor: "#FFFFFF", textColor: "#000000", headingColor: "#2563eb", accentColor: "#2563eb" },
      { id: "Minimal", name: "Minimal", category: "Creative", description: "Wide margins with lots of breathing room.", font: "Arial", pageColor: "#FFFFFF", textColor: "#000000", headingColor: "#374151", accentColor: "#374151" },
      { id: "Resume", name: "Resume", category: "Professional", description: "Compact double-line header for resumes.", font: "Arial", pageColor: "#FFFFFF", textColor: "#000000", headingColor: "#1e40af", accentColor: "#1e40af" },
      { id: "Report", name: "Report", category: "Business", description: "Structured report with top bar and page numbers.", font: "Arial", pageColor: "#FFFFFF", textColor: "#000000", headingColor: "#059669", accentColor: "#059669" },
    ];

    const allTemplates = [
      ...baseTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        font: t.font,
        pageColor: t.pageColor,
        textColor: t.textColor,
        headingColor: t.headingColor,
        accentColor: t.accentColor,
        type: "base" as const,
      })),
      ...templates.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        font: t.font,
        pageColor: t.pageColor,
        textColor: t.textColor,
        headingColor: t.headingColor,
        accentColor: t.accentColor,
        type: "sample" as const,
      })),
    ];

    const categories = [...new Set(allTemplates.map((t) => t.category))];

    return corsResponse({
      success: true,
      data: allTemplates,
      categories,
      meta: {
        total: allTemplates.length,
        filtered: category ? templates.length + baseTemplates.filter((t) => t.category === category).length : allTemplates.length,
      },
    });
  } catch (error) {
    console.error("v1 templates error:", error);
    return corsResponse(
      { success: false, error: "Failed to list templates" },
      500
    );
  }
}
