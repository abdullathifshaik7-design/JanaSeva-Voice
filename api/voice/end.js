// POST /api/voice/end - Telephony Call Termination Webhook
import { handleEndCall } from "../../backend/services/phoneVoiceService.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = req.method === "POST" ? (req.body || {}) : (req.query || {});
    const callId = body.CallSid || body.callId || "";
    
    const session = handleEndCall(callId);
    return res.status(200).json({
      status: "success",
      message: "Call session ended",
      callId,
      duration: session?.duration || 0
    });
  } catch (err) {
    console.error("[End Webhook Error]:", err);
    return res.status(500).json({ error: err.message });
  }
}
