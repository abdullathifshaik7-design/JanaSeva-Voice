// POST /api/voice/test - Local Development & In-Browser Phone Call Simulation Endpoint
import { handleSimulationTurn } from "../../backend/services/phoneVoiceService.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  try {
    const rawBody = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { callId, text, language } = rawBody;

    const result = await handleSimulationTurn({
      callId,
      text: (text || "").trim(),
      language: language || "te-IN"
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("[Test Simulation Error]:", err);
    return res.status(500).json({
      status: "error",
      error: err.message
    });
  }
}
