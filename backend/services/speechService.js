// Speech-to-Text Processing Service for JanaSeva Phone Voice
// Integrates Groq Whisper, OpenAI Whisper, and Google Cloud STT with timeouts & fallbacks

/**
 * Transcribe base64 audio buffer into text using configured STT provider
 * @param {string} base64Audio
 * @param {string} languageCode e.g. "te-IN", "hi-IN", "ta-IN", "en-IN"
 * @returns {Promise<string>}
 */
export async function transcribeAudio(base64Audio, languageCode = "te-IN") {
  if (!base64Audio) return "";

  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;

  // Language mapping to Whisper ISO 639-1
  const whisperLang = (languageCode || "en").toLowerCase().startsWith("te")
    ? "te"
    : (languageCode || "").toLowerCase().startsWith("hi")
    ? "hi"
    : (languageCode || "").toLowerCase().startsWith("ta")
    ? "ta"
    : "en";

  // 1. Groq / OpenAI Whisper transcription
  if (groqKey || openaiKey) {
    const activeKey = groqKey || openaiKey;
    const sttUrl = groqKey
      ? "https://api.groq.com/openai/v1/audio/transcriptions"
      : "https://api.openai.com/v1/audio/transcriptions";
    const modelName = groqKey ? "whisper-large-v3-turbo" : "whisper-1";

    try {
      const audioBuffer = Buffer.from(base64Audio, "base64");
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: "audio/webm" });
      formData.append("file", audioBlob, "audio.webm");
      formData.append("model", modelName);
      formData.append("language", whisperLang);
      formData.append("temperature", "0");
      formData.append("response_format", "json");

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(sttUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${activeKey}` },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeout);
      const data = await response.json();
      if (data.text) {
        return data.text.trim();
      }
    } catch (err) {
      console.warn("[SpeechService] Whisper transcription error:", err.message);
    }
  }

  // 2. Google Cloud Speech-to-Text fallback
  if (googleKey) {
    try {
      const url = `https://speech.googleapis.com/v1/speech:recognize?key=${googleKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding: "WEBM_OPUS",
            sampleRateHertz: 48000,
            languageCode: languageCode || "te-IN"
          },
          audio: { content: base64Audio }
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      const data = await response.json();
      const transcript = data.results?.[0]?.alternatives?.[0]?.transcript || "";
      if (transcript) return transcript.trim();
    } catch (err) {
      console.warn("[SpeechService] Google STT error:", err.message);
    }
  }

  return "";
}

export default { transcribeAudio };
