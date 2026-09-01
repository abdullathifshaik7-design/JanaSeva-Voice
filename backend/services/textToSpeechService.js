// Text-to-Speech Processing Service for JanaSeva Phone Voice
// Synthesizes natural speech in Telugu, Hindi, Tamil, and English with senior-citizen pacing

import { toTelephonyLanguageCode, getLanguageMeta } from "./languageService.js";

/**
 * Generate SSML formatted speech text with clear, gentle pacing suitable for elderly callers
 * @param {string} text
 * @param {string} langCode
 * @param {boolean} slowPaced
 * @returns {string}
 */
export function formatSeniorCitizenSSML(text, langCode = "te-IN", slowPaced = false) {
  const rate = slowPaced ? "85%" : "92%";
  const clean = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  return `<speak><prosody rate="${rate}">${clean}</prosody></speak>`;
}

/**
 * Synthesize speech to MP3 base64 audio via Google Cloud Text-to-Speech API
 * @param {string} text
 * @param {string} languageCode e.g. "te-IN", "hi-IN", "ta-IN", "en-IN"
 * @param {object} options
 * @returns {Promise<{ audioContent: string|null, format: string, languageCode: string }>}
 */
export async function synthesizeSpeech(text, languageCode = "te-IN", options = {}) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const telephonyLang = toTelephonyLanguageCode(languageCode);
  const meta = getLanguageMeta(telephonyLang);

  if (!apiKey) {
    // Return null audioContent to instruct telephony provider to use native TTS (<Say>)
    return {
      audioContent: null,
      format: "native_say",
      languageCode: telephonyLang,
      voiceName: meta.voiceName,
      text
    };
  }

  try {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: telephonyLang,
          name: options.voiceName || meta.voiceName,
          ssmlGender: "FEMALE"
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: options.speakingRate || 0.92
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();
    if (data.audioContent) {
      return {
        audioContent: data.audioContent,
        format: "mp3_base64",
        languageCode: telephonyLang,
        voiceName: meta.voiceName,
        text
      };
    }
  } catch (err) {
    console.warn("[TTS Service] Google TTS API call failed, falling back to native telephony Say:", err.message);
  }

  return {
    audioContent: null,
    format: "native_say",
    languageCode: telephonyLang,
    voiceName: meta.voiceName,
    text
  };
}

export default { synthesizeSpeech, formatSeniorCitizenSSML };
