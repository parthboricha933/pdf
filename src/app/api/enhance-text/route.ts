import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "No text provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.AI_API_KEY;
    const apiUrl = process.env.AI_API_URL;
    const model = process.env.AI_MODEL;

    if (!apiKey || !apiUrl || !model) {
      return NextResponse.json(
        { success: false, error: "AI API is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a professional text editor. Enhance the user's text by improving grammar, clarity, and formatting while preserving the original meaning and intent. Return ONLY the enhanced text with no explanations, prefixes, or commentary. Maintain the original language of the input.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      return NextResponse.json(
        { success: false, error: "AI enhancement failed. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const enhancedText =
      data.choices?.[0]?.message?.content?.trim() || text;

    return NextResponse.json({
      success: true,
      enhancedText,
    });
  } catch (error) {
    console.error("Enhance text error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to enhance text",
      },
      { status: 500 }
    );
  }
}
