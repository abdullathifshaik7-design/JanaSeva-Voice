// POST /api/voice/process - Speech Processing & Voice Conversation Loop Webhook
import { handleProcessSpeech } from "../../backend/services/phoneVoiceService.js";

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Twilio-Signature");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = req.method === "POST" ? (req.body || {}) : (req.query || {});
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host || "localhost";
    const webhookUrl = `${protocol}://${host}/api/voice/process`;

    const providerResponse = await handleProcessSpeech({
      body,
      webhookUrl,
      provider: process.env.PHONE_PROVIDER
    });

    res.setHeader("Content-Type", providerResponse.contentType || "text/xml");
    return res.status(200).send(providerResponse.body);
  } catch (err) {
    console.error("[Process Webhook Error]:", err);
    res.setHeader("Content-Type", "text/xml");
    return res.status(500).send(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say language="te-IN">Samasya vachindi. Kasepatlo malli call cheyyandi.</Say><Hangup/></Response>`
    );
  }
}
