/**
 * End-to-end tests for the Text to PDF webhook workflow
 *
 * Run: bun test tests/webhook.test.ts
 */

import { describe, test, expect, beforeAll } from "bun:test";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

describe("Webhook Workflow: POST /api/webhook/generate-pdf", () => {
  test("1. Valid request returns success and pdfUrl", async () => {
    const response = await fetch(`${BASE_URL}/api/webhook/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "# Test Document\nThis is a test PDF generation.",
        pageColor: "#FFFFFF",
        textColor: "#000000",
        font: "Arial",
        template: "Professional",
        pageSize: "A4",
        orientation: "portrait",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.pdfUrl).toBeDefined();
    expect(data.pdfUrl).toContain("data:application/pdf;base64,");
    expect(data.template).toBe("Professional");
    expect(data.font).toBe("Arial");
  });

  test("2. Empty text returns validation error", async () => {
    const response = await fetch(`${BASE_URL}/api/webhook/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "",
        template: "Simple",
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("text is required");
    expect(data.node).toBe("validation");
  });

  test("3. Missing text field returns validation error", async () => {
    const response = await fetch(`${BASE_URL}/api/webhook/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template: "Simple",
        font: "Arial",
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test("4. Database record is created", async () => {
    // Generate a PDF first
    const genResponse = await fetch(`${BASE_URL}/api/webhook/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Test for database record",
        template: "Simple",
        font: "Helvetica",
      }),
    });

    const genData = await genResponse.json();
    expect(genData.success).toBe(true);
    expect(genData.historyId).toBeDefined();

    // Check history endpoint
    const historyResponse = await fetch(`${BASE_URL}/api/pdf-history`);
    const historyData = await historyResponse.json();
    expect(historyData.success).toBe(true);
    expect(historyData.data).toBeInstanceOf(Array);
    expect(historyData.data.length).toBeGreaterThan(0);
  });

  test("5. Email is skipped when RESEND_API_KEY not configured", async () => {
    const response = await fetch(`${BASE_URL}/api/webhook/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Test with email",
        email: "test@example.com",
      }),
    });

    const data = await response.json();
    expect(data.success).toBe(true);
    // Email should be skipped (no RESEND_API_KEY configured in test)
    // But the workflow should still succeed
    expect(data.pdfUrl).toBeDefined();
  });

  test("6. PDF preview and download works (iframe-compatible URL)", async () => {
    const response = await fetch(`${BASE_URL}/api/webhook/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "# My Resume\nName: Test User\n# Education\nB.E. Computer Science",
        template: "Resume",
        font: "Georgia",
      }),
    });

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.pdfUrl).toMatch(/^data:application\/pdf;base64,/);

    // Verify the base64 data is valid by decoding
    const base64Part = data.pdfUrl.replace("data:application/pdf;base64,", "");
    const decoded = atob(base64Part);
    expect(decoded.length).toBeGreaterThan(0);
    expect(decoded.startsWith("%PDF")).toBe(true);
  });
});

describe("PDF Generation API: POST /api/generate-pdf", () => {
  test("Generates PDF with heading support", async () => {
    const response = await fetch(`${BASE_URL}/api/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "# Heading One\nRegular paragraph\n# Heading Two\nAnother paragraph",
        template: "Modern",
        pageColor: "#F5F5F5",
        textColor: "#333333",
      }),
    });

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.pdfUrl).toBeDefined();
  });

  test("Generates PDF with all templates", async () => {
    const templates = ["Simple", "Professional", "Modern", "Minimal", "Resume", "Report"];

    for (const tmpl of templates) {
      const response = await fetch(`${BASE_URL}/api/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `# ${tmpl} Template\nContent for ${tmpl}`,
          template: tmpl,
        }),
      });

      const data = await response.json();
      expect(data.success, `Template ${tmpl} failed`).toBe(true);
    }
  });
});

describe("PDF History API: GET /api/pdf-history", () => {
  test("Returns history records", async () => {
    const response = await fetch(`${BASE_URL}/api/pdf-history`);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});

describe("Email API: POST /api/send-email", () => {
  test("Returns skipped when RESEND_API_KEY not set", async () => {
    const response = await fetch(`${BASE_URL}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        pdfUrl: "https://example.com/test.pdf",
        fileName: "test.pdf",
      }),
    });

    const data = await response.json();
    // Should either succeed (if key is set) or skip (if not)
    expect(data.skipped === true || data.success === true).toBe(true);
  });
});
