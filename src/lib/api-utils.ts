/**
 * Shared utilities for the external API (v1)
 * - CORS headers
 * - API key authentication
 * - Rate limiting (in-memory)
 * - Request validation
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ── CORS ──

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
  "Access-Control-Max-Age": "86400",
};

export function corsResponse(body: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return NextResponse.json(body, {
    status,
    headers: { ...CORS_HEADERS, ...extraHeaders },
  });
}

export function corsBinaryResponse(buffer: Buffer, filename: string) {
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}

// ── API Key Auth ──

export interface AuthResult {
  authenticated: boolean;
  isPublic: boolean;
  apiKeyId?: string;
  error?: string;
}

/**
 * Validate API key from request.
 * Supports both:
 * - `Authorization: Bearer <key>` header
 * - `X-API-Key: <key>` header
 *
 * If no key is provided, request is treated as public (rate-limited).
 */
export async function authenticate(request: NextRequest): Promise<AuthResult> {
  // Extract API key
  const authHeader = request.headers.get("authorization");
  const xApiKey = request.headers.get("x-api-key");

  let key: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    key = authHeader.substring(7).trim();
  } else if (xApiKey) {
    key = xApiKey.trim();
  }

  // No key = public request
  if (!key) {
    return { authenticated: false, isPublic: true };
  }

  // Look up key in database
  try {
    const apiKey = await db.apiKey.findUnique({ where: { key } });

    if (!apiKey) {
      return { authenticated: false, isPublic: false, error: "Invalid API key" };
    }

    if (!apiKey.isActive) {
      return { authenticated: false, isPublic: false, error: "API key has been revoked" };
    }

    // Update last used + request count (non-blocking)
    db.apiKey
      .update({
        where: { id: apiKey.id },
        data: {
          requestCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      })
      .catch(() => {});

    return { authenticated: true, isPublic: false, apiKeyId: apiKey.id };
  } catch (error) {
    console.error("API key lookup error:", error);
    return { authenticated: false, isPublic: true };
  }
}

// ── In-Memory Rate Limiter ──

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const PUBLIC_LIMIT = 10; // requests per window
const AUTHED_LIMIT = 1000; // requests per window
const WINDOW_MS = 60 * 1000; // 1 minute

export function checkRateLimit(identifier: string, isAuthenticated: boolean): { allowed: boolean; remaining: number; resetAt: number } {
  const limit = isAuthenticated ? AUTHED_LIMIT : PUBLIC_LIMIT;
  const now = Date.now();

  let entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    rateLimitMap.set(identifier, entry);
  }

  entry.count++;

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

// ── Validation ──

export interface GeneratePdfRequest {
  text: string;
  template?: string;
  font?: string;
  pageColor?: string;
  textColor?: string;
  pageSize?: string;
  orientation?: string;
  fileName?: string;
  responseFormat?: "json" | "binary";
}

export function validateGenerateRequest(body: Partial<GeneratePdfRequest>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!body.text || typeof body.text !== "string" || !body.text.trim()) {
    errors.push("`text` is required and cannot be empty");
  }

  if (body.text && body.text.length > 100000) {
    errors.push("`text` must be under 100,000 characters");
  }

  const validTemplates = [
    "Simple", "Professional", "Modern", "Minimal", "Resume", "Report",
    "professional-resume", "modern-cv", "corporate-report", "business-proposal",
    "invoice", "project-documentation", "academic-notes", "research-paper",
    "certificate", "ebook-chapter", "meeting-minutes", "personal-letter",
    "comic-book-classic", "manga-style", "kids-storybook",
  ];

  if (body.template && !validTemplates.includes(body.template)) {
    errors.push(`Invalid template. Valid options: ${validTemplates.join(", ")}`);
  }

  const validFonts = ["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana"];
  if (body.font && !validFonts.includes(body.font)) {
    errors.push(`Invalid font. Valid options: ${validFonts.join(", ")}`);
  }

  const validSizes = ["A4", "Letter"];
  if (body.pageSize && !validSizes.includes(body.pageSize)) {
    errors.push(`Invalid pageSize. Valid options: ${validSizes.join(", ")}`);
  }

  const validOrientations = ["portrait", "landscape"];
  if (body.orientation && !validOrientations.includes(body.orientation)) {
    errors.push(`Invalid orientation. Valid options: ${validOrientations.join(", ")}`);
  }

  const validFormats = ["json", "binary"];
  if (body.responseFormat && !validFormats.includes(body.responseFormat)) {
    errors.push(`Invalid responseFormat. Valid options: ${validFormats.join(", ")}`);
  }

  if (body.pageColor && !/^#[0-9A-Fa-f]{6}$/.test(body.pageColor)) {
    errors.push("`pageColor` must be a valid hex color (e.g. #FFFFFF)");
  }

  if (body.textColor && !/^#[0-9A-Fa-f]{6}$/.test(body.textColor)) {
    errors.push("`textColor` must be a valid hex color (e.g. #000000)");
  }

  return { valid: errors.length === 0, errors };
}

// ── Generate API Key ──

export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const prefix = "tpk_live_";
  let key = prefix;
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}
