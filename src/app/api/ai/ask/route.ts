import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const API_SECRET = process.env.API_SECRET_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const SYSTEM_INSTRUCTION = [
  "You are TMJ AI Assistant, an intelligent academic pair-programmer, tutor, and companion for college students of Teknik Multimedia dan Jaringan (TMJ).",
  "Your expertise includes: Multimedia Design, UI/UX, Web & Mobile Development, Networking (Cisco, Mikrotik, Subnetting, TCP/IP), Linux & Cloud Infrastructure.",
  "Always be polite, encouraging, concise, highly structured, and helpful.",
  "Format responses cleanly for WhatsApp: use *bold* for emphasis, `code blocks` for syntax, bullet points, and appropriate emojis.",
  "Answer in friendly Indonesian by default.",
].join(" ");

const MODELS_TO_TRY = [
  { version: "v1beta", model: "gemini-3.7-flash" },
  { version: "v1beta", model: "gemini-flash-latest" },
  { version: "v1beta", model: "gemini-3.5-flash" },
  { version: "v1beta", model: "gemini-3.5-flash-lite" },
  { version: "v1beta", model: "gemini-flash-lite-latest" },
  { version: "v1beta", model: "gemini-3.1-pro-preview" },
  { version: "v1beta", model: "gemini-pro-latest" },
  { version: "v1beta", model: "gemini-3-flash-preview" },
];

function timingSafeCheck(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(req: NextRequest) {
  try {
    if (!API_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: "Keamanan: API_SECRET_KEY belum diisi di Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    const timestamp = req.headers.get("x-timestamp") || "";
    const signature = req.headers.get("x-signature") || "";
    const bearerToken = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();

    const body = await req.json();
    const { prompt, senderName, senderJid } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "Prompt tidak boleh kosong." },
        { status: 400 }
      );
    }

    // 1. VERIFIKASI HMAC TIME-BASED SIGNATURE (Anti-Replay Attack & Anti-Sniffing)
    let isAuthorized = false;

    if (timestamp && signature) {
      const now = Math.floor(Date.now() / 1000);
      const reqTime = parseInt(timestamp, 10);

      // Kunci kedaluwarsa setelah 60 detik
      if (Math.abs(now - reqTime) <= 60) {
        const expectedSignature = crypto
          .createHmac("sha256", API_SECRET)
          .update(`${timestamp}:${prompt}`)
          .digest("hex");

        if (timingSafeCheck(signature, expectedSignature)) {
          isAuthorized = true;
        }
      }
    }

    // Fallback: Direct Bearer Token check
    if (!isAuthorized && bearerToken) {
      if (timingSafeCheck(bearerToken, API_SECRET)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Akses Ditolak (403 Forbidden): HMAC Signature kedaluwarsa atau tidak valid.",
        },
        { status: 403 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY belum diisi di Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nPenanya: ${senderName || "Mahasiswa TMJ"}\nPertanyaan: ${prompt}\n\nJawaban:`;

    let answer = "";
    let lastErrorDetails = "";

    for (const { version, model } of MODELS_TO_TRY) {
      try {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: fullPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1500,
            },
          }),
        });

        const data = await res.json();

        if (res.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          answer = data.candidates[0].content.parts[0].text;
          break;
        } else if (data.error) {
          lastErrorDetails = `[${model}] ${data.error.message || JSON.stringify(data.error)}`;
        }
      } catch (err: any) {
        lastErrorDetails = `[${model}] ${err.message}`;
      }
    }

    if (!answer) {
      return NextResponse.json(
        {
          success: false,
          error: `Google Gemini API Error: ${lastErrorDetails || "Gagal menghasilkan jawaban."}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error: any) {
    console.error("AI Proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Gagal memproses permintaan AI.",
      },
      { status: 500 }
    );
  }
}
