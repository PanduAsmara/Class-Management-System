import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey, targetPhone, targetGroupId, message, customWebhookUrl } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Pesan WhatsApp tidak boleh kosong" },
        { status: 400 }
      );
    }

    // 1. Direct WA Web Link (Client Handled)
    if (provider === "direct") {
      return NextResponse.json({
        success: true,
        provider: "direct",
        message: "Pesan siap dikirim via WhatsApp Web/App",
      });
    }

    // 2. Pterodactyl Baileys Bot Node.js Server
    if (provider === "pterodactyl") {
      const endpoint = customWebhookUrl || "http://localhost:2266";
      const target = targetGroupId || targetPhone;

      if (!target) {
        return NextResponse.json(
          { success: false, error: "Nomor tujuan atau Group ID WhatsApp belum diisi" },
          { status: 400 }
        );
      }

      const cleanUrl = endpoint.endsWith("/send-message")
        ? endpoint
        : `${endpoint.replace(/\/$/, "")}/send-message`;

      try {
        const response = await fetch(cleanUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey || "tmj-secret-bot-2026"}`,
          },
          body: JSON.stringify({
            target: target,
            message: message,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          return NextResponse.json(
            {
              success: false,
              error: data.error || `Pterodactyl Bot Server merespon dengan status ${response.status}`,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          provider: "pterodactyl",
          messageId: data.messageId,
          data,
        });
      } catch (err: any) {
        return NextResponse.json(
          {
            success: false,
            error: `Gagal menghubungi server Pterodactyl di ${cleanUrl}. Pastikan server Pterodactyl sedang AKTIF (Status ON) dan port 2266 terbuka.`,
          },
          { status: 502 }
        );
      }
    }

    // 3. Fonnte API (Indonesia WA Gateway)
    if (provider === "fonnte") {
      if (!apiKey) {
        return NextResponse.json(
          { success: false, error: "API Token Fonnte belum diisi di Pengaturan" },
          { status: 400 }
        );
      }

      const target = targetGroupId || targetPhone;
      if (!target) {
        return NextResponse.json(
          { success: false, error: "Nomor tujuan atau Group ID WhatsApp belum diisi" },
          { status: 400 }
        );
      }

      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: target,
          message: message,
          countryCode: "62",
        }),
      });

      const data = await response.json();
      if (!data.status) {
        return NextResponse.json(
          { success: false, error: data.reason || "Fonnte API gagal mengirim pesan" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        provider: "fonnte",
        messageId: data.id || `fonnte-${Date.now()}`,
        data,
      });
    }

    // 4. Wablas API
    if (provider === "wablas") {
      if (!apiKey) {
        return NextResponse.json(
          { success: false, error: "API Token Wablas belum diisi" },
          { status: 400 }
        );
      }

      const target = targetPhone || targetGroupId;
      const response = await fetch("https://kudus.wablas.com/api/send-message", {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: target,
          message: message,
        }),
      });

      const data = await response.json();
      return NextResponse.json({
        success: data.status,
        provider: "wablas",
        data,
      });
    }

    // 5. Custom Webhook API
    if (provider === "custom") {
      if (!customWebhookUrl) {
        return NextResponse.json(
          { success: false, error: "Custom Webhook URL belum diisi" },
          { status: 400 }
        );
      }

      const response = await fetch(customWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          targetPhone,
          targetGroupId,
          message,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json().catch(() => ({}));
      return NextResponse.json({
        success: response.ok,
        provider: "custom",
        data,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Pesan berhasil diproses",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
