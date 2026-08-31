import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_SECRET = process.env.API_SECRET_KEY || "tmj-secret-bot-2026";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const SYSTEM_INSTRUCTION = [
  "You are TMJ AI Assistant, an intelligent academic pair-programmer, tutor, and companion for college students of Teknik Multimedia dan Jaringan (TMJ).",
  "Your expertise includes: Multimedia Design, UI/UX, Web & Mobile Development, Networking (Cisco, Mikrotik, Subnetting, TCP/IP), Linux & Cloud Infrastructure.",
  "Always be polite, encouraging, concise, highly structured, and helpful.",
  "Format responses cleanly for WhatsApp: use *bold* for emphasis, `code blocks` for syntax, bullet points, and appropriate emojis.",
  "Answer in friendly Indonesian by default.",
].join(" ");

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("x-api-secret") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (API_SECRET && token !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: "Akses Ditolak: Secret Key tidak valid." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { prompt, senderName } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "Prompt tidak boleh kosong." },
        { status: 400 }
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

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const userQuery = `Nama penanya: ${senderName || "Mahasiswa TMJ"}.\nPertanyaan: ${prompt}`;
    const result = await model.generateContent(userQuery);
    const response = await result.response;
    const answer = response.text();

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
