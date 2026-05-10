import { NextRequest } from "next/server";
import { CORS_HEADERS, corsResponse, generateApiKey } from "@/lib/api-utils";
import { db } from "@/lib/db";

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * POST /api/v1/keys
 * Create a new API key.
 *
 * Request body:
 * {
 *   "name": "My App",
 *   "email": "dev@example.com"  // optional
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": { "key": "tpk_live_...", "name": "...", "createdAt": "..." }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Simple admin check - require a master key from env or basic auth
    const adminKey = process.env.API_ADMIN_KEY;
    if (adminKey) {
      const authHeader = request.headers.get("authorization");
      const xApiKey = request.headers.get("x-api-key");
      const providedKey = authHeader?.replace("Bearer ", "") || xApiKey;

      if (providedKey !== adminKey) {
        return corsResponse(
          { success: false, error: "Admin key required to create API keys. Set API_ADMIN_KEY env var." },
          403
        );
      }
    }

    let body: { name?: string; email?: string };
    try {
      body = await request.json();
    } catch {
      return corsResponse(
        { success: false, error: "Invalid JSON body" },
        400
      );
    }

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return corsResponse(
        { success: false, error: "`name` is required" },
        400
      );
    }

    const key = generateApiKey();

    const apiKey = await db.apiKey.create({
      data: {
        key,
        name: body.name.trim(),
        email: body.email?.trim() || null,
      },
    });

    return corsResponse({
      success: true,
      data: {
        key: apiKey.key,
        name: apiKey.name,
        email: apiKey.email,
        createdAt: apiKey.createdAt.toISOString(),
      },
      message: "Save your API key securely. It will not be shown again.",
    }, 201);
  } catch (error) {
    console.error("Create API key error:", error);
    return corsResponse(
      { success: false, error: "Failed to create API key" },
      500
    );
  }
}

/**
 * GET /api/v1/keys
 * List all API keys (admin only).
 */
export async function GET(request: NextRequest) {
  try {
    const adminKey = process.env.API_ADMIN_KEY;
    if (adminKey) {
      const authHeader = request.headers.get("authorization");
      const xApiKey = request.headers.get("x-api-key");
      const providedKey = authHeader?.replace("Bearer ", "") || xApiKey;

      if (providedKey !== adminKey) {
        return corsResponse(
          { success: false, error: "Admin key required" },
          403
        );
      }
    }

    const keys = await db.apiKey.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        key: true,
        name: true,
        email: true,
        isActive: true,
        requestCount: true,
        lastUsedAt: true,
        createdAt: true,
        revokedAt: true,
      },
    });

    // Mask keys for security
    const masked = keys.map((k) => ({
      ...k,
      key: k.key.substring(0, 12) + "..." + k.key.substring(k.key.length - 4),
    }));

    return corsResponse({
      success: true,
      data: masked,
      meta: { total: masked.length, active: masked.filter((k) => k.isActive).length },
    });
  } catch (error) {
    console.error("List API keys error:", error);
    return corsResponse(
      { success: false, error: "Failed to list API keys" },
      500
    );
  }
}

/**
 * DELETE /api/v1/keys
 * Revoke an API key.
 *
 * Query params:
 * - key: the API key to revoke (or use body)
 */
export async function DELETE(request: NextRequest) {
  try {
    const adminKey = process.env.API_ADMIN_KEY;
    if (adminKey) {
      const authHeader = request.headers.get("authorization");
      const xApiKey = request.headers.get("x-api-key");
      const providedKey = authHeader?.replace("Bearer ", "") || xApiKey;

      if (providedKey !== adminKey) {
        return corsResponse(
          { success: false, error: "Admin key required" },
          403
        );
      }
    }

    // Get key from query params or body
    const { searchParams } = new URL(request.url);
    let keyToRevoke = searchParams.get("key");

    if (!keyToRevoke) {
      try {
        const body = await request.json();
        keyToRevoke = body.key;
      } catch {}
    }

    if (!keyToRevoke) {
      return corsResponse(
        { success: false, error: "Provide `key` in query params or request body" },
        400
      );
    }

    const apiKey = await db.apiKey.findUnique({ where: { key: keyToRevoke } });

    if (!apiKey) {
      return corsResponse(
        { success: false, error: "API key not found" },
        404
      );
    }

    await db.apiKey.update({
      where: { id: apiKey.id },
      data: { isActive: false, revokedAt: new Date() },
    });

    return corsResponse({
      success: true,
      message: `API key "${apiKey.name}" has been revoked`,
    });
  } catch (error) {
    console.error("Revoke API key error:", error);
    return corsResponse(
      { success: false, error: "Failed to revoke API key" },
      500
    );
  }
}
