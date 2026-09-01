// GET /api/voice/health - System Healthcheck & Telephony Readiness
import { phoneSessionManager } from "../../backend/services/phoneSessionManager.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;
  const phoneProvider = process.env.PHONE_PROVIDER || (process.env.TWILIO_ACCOUNT_SID ? "twilio" : "mock");
  const phoneNumber = process.env.PHONE_NUMBER || "Demo Helpline (Simulator Active)";

  const sttProvider = groqKey ? "Groq Whisper (Turbo)" : openaiKey ? "OpenAI Whisper" : googleKey ? "Google Cloud STT" : "Browser Web Speech Fallback";
  const llmProvider = groqKey ? "Groq LLaMA 3.3 70B" : openaiKey ? "OpenAI GPT-4o-mini" : "JanaSeva Local Dialog Engine";
  const ttsProvider = googleKey ? "Google Cloud TTS (Multilingual)" : "Telephony Native Say (<Say>)";

  const analytics = phoneSessionManager.getAnalytics();

  return res.status(200).json({
    status: "healthy",
    service: "JanaSeva Voice Phone Call AI",
    timestamp: new Date().toISOString(),
    configuration: {
      phoneProvider,
      phoneNumber,
      sttProvider,
      llmProvider,
      ttsProvider,
      webhookConfigured: Boolean(process.env.PHONE_WEBHOOK_URL),
      webhookSecretConfigured: Boolean(process.env.PHONE_WEBHOOK_SECRET)
    },
    supportedLanguages: ["te-IN (Telugu)", "hi-IN (Hindi)", "ta-IN (Tamil)", "en-IN (English)"],
    analytics
  });
}
