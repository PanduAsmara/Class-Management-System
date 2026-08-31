import { NextRequest, NextResponse } from "next/server";

// Handle GET for Webhook Verification (e.g. Meta / Twilio / Wablas verification challenge)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get("hub.challenge");
  if (challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({
    status: "active",
    message: "TMJ Class Management WhatsApp Bot Webhook is online!",
    supportedCommands: [
      "!menu - Tampilkan menu bantuan",
      "!jadwal - Tampilkan jadwal kuliah hari ini",
      "!tugas - Tampilkan deadline tugas yang masih aktif",
      "!pengumuman - Tampilkan pengumuman terbaru kelas",
    ],
  });
}

// Handle POST for Incoming WhatsApp Messages from Bot Gateways
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sender = body.sender || body.from || body.phone || "Mahasiswa";
    const rawMessage = (body.message || body.text || "").trim();
    const command = rawMessage.toLowerCase();

    let replyText = "";

    if (command.startsWith("!menu") || command.startsWith("!help") || command === "halo" || command === "hi") {
      replyText = [
        `🤖 *TMJ Class Management Bot*`,
        `Halo *${sender}*, silakan gunakan perintah berikut:`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `📌 *!jadwal* : Cek jadwal kuliah hari ini`,
        `📌 *!tugas*  : Cek deadline tugas & praktikum`,
        `📌 *!info*   : Cek pengumuman penting kelas`,
        `📌 *!portal* : Dapatkan link portal web TMJ`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `_TMJ Class Management System_`,
      ].join("\n");
    } else if (command.startsWith("!jadwal")) {
      replyText = [
        `📅 *JADWAL KULIAH HARI INI*`,
        `🏛️ *Kelas TMJ*`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `Gunakan portal website untuk melihat jadwal lengkap & link ruang meeting:`,
        `👉 https://tmj-keras.vercel.app/schedule`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `_TMJ Class Management System_`,
      ].join("\n");
    } else if (command.startsWith("!tugas")) {
      replyText = [
        `🚨 *DAFTAR DEADLINE TUGAS*`,
        `🏛️ *Kelas TMJ*`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `Pantau tugas, checklist mandiri, & link submission di portal:`,
        `👉 https://tmj-keras.vercel.app/assignments`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `_TMJ Class Management System_`,
      ].join("\n");
    } else if (command.startsWith("!portal")) {
      replyText = [
        `🌐 *PORTAL UTAMA TMJ CMS*`,
        `Silakan login dengan Username / NIM Anda di:`,
        `👉 https://tmj-keras.vercel.app`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `_TMJ Class Management System_`,
      ].join("\n");
    }

    return NextResponse.json({
      success: true,
      reply: replyText || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
