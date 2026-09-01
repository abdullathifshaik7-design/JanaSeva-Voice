// Multilingual Language Detection & Mapping Service for JanaSeva Phone Voice
// Supports Telugu (te-IN), Hindi (hi-IN), Tamil (ta-IN), and English (en-IN)

export const SUPPORTED_LANGUAGES = {
  TELUGU: {
    code: "te",
    telephonyCode: "te-IN",
    name: "Telugu",
    nativeName: "తెలుగు",
    voiceName: "te-IN-Standard-A"
  },
  HINDI: {
    code: "hi",
    telephonyCode: "hi-IN",
    name: "Hindi",
    nativeName: "हिंदी",
    voiceName: "hi-IN-Standard-A"
  },
  TAMIL: {
    code: "ta",
    telephonyCode: "ta-IN",
    name: "Tamil",
    nativeName: "தமிழ்",
    voiceName: "ta-IN-Standard-A"
  },
  ENGLISH: {
    code: "en",
    telephonyCode: "en-IN",
    name: "English",
    nativeName: "English",
    voiceName: "en-IN-Standard-C"
  }
};

// Unicode regex patterns for native script detection
const SCRIPT_PATTERNS = {
  te: /[\u0c00-\u0c7f]/, // Telugu block
  hi: /[\u0900-\u097f]/, // Devanagari block
  ta: /[\u0b80-\u0bff]/  // Tamil block
};

// Transliterated keyword dictionaries for phonetic / Romanized speech
const TRANSLITERATION_KEYWORDS = {
  te: [
    "naaku", "nenu", "kavali", "telusukovali", "gurinchi", "cheppandi", "cheppu",
    "unnaya", "schemes emaina", "rythu", "pension", "pathakam", "yojana",
    "ardham", "malli", "sahayam", "dhanyavadalu", "namaskaram", "samasya",
    "vastundi", "vastayi", "eppudu", "ela", "yentha", "dharakhasthu", "telugu"
  ],
  hi: [
    "mujhe", "mera", "meri", "humko", "chahiye", "batao", "bataiye", "jaankari",
    "kya", "kaise", "kab", "yojana", "pension", "kisan", "sarkari", "samajh",
    "phir", "madad", "dhanyawad", "namaste", "shikayat", "shukriya", "hindi"
  ],
  ta: [
    "enakku", "enaku", "nan", "theriya", "solunga", "solli", "thittam", "vivasayi",
    "oothiyum", "oiyvoothiyam", "puriyala", "marubadiyum", "udavi", "vanakkam",
    "nandri", "tamil", "eppadi", "kidaikkum", "irukku", "thevai"
  ]
};

/**
 * Detect language from text (supporting native script + phonetic transliteration)
 * @param {string} text
 * @param {string} fallbackLangCode
 * @returns {string} ISO 639-1 code ("te", "hi", "ta", or "en")
 */
export function detectLanguage(text, fallbackLangCode = "en") {
  if (!text || typeof text !== "string") {
    return fallbackLangCode;
  }

  const trimmed = text.trim();
  if (!trimmed) return fallbackLangCode;

  // 1. Check native Unicode scripts
  for (const [lang, regex] of Object.entries(SCRIPT_PATTERNS)) {
    if (regex.test(trimmed)) {
      return lang;
    }
  }

  // 2. Check transliterated Romanized keywords
  const lower = trimmed.toLowerCase();
  const words = lower.split(/\s+/);

  const scores = { te: 0, hi: 0, ta: 0 };

  for (const [lang, keywords] of Object.entries(TRANSLITERATION_KEYWORDS)) {
    for (const kw of keywords) {
      if (kw.includes(" ")) {
        if (lower.includes(kw)) scores[lang] += 2;
      } else {
        if (words.includes(kw)) scores[lang] += 1;
        else if (lower.includes(kw) && kw.length >= 5) scores[lang] += 0.5;
      }
    }
  }

  const highestLang = Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));
  if (scores[highestLang] > 0) {
    return highestLang;
  }

  // Default fallback if no Indian language patterns match
  return fallbackLangCode;
}

/**
 * Convert short code ("te") to telephony locale code ("te-IN")
 * @param {string} langCode
 * @returns {string}
 */
export function toTelephonyLanguageCode(langCode) {
  const code = (langCode || "en").toLowerCase().split("-")[0];
  switch (code) {
    case "te": return "te-IN";
    case "hi": return "hi-IN";
    case "ta": return "ta-IN";
    default: return "en-IN";
  }
}

/**
 * Convert telephony locale code ("te-IN") to short code ("te")
 * @param {string} telephonyCode
 * @returns {string}
 */
export function fromTelephonyLanguageCode(telephonyCode) {
  const code = (telephonyCode || "en").toLowerCase().split("-")[0];
  if (["te", "hi", "ta", "en"].includes(code)) {
    return code;
  }
  return "en";
}

/**
 * Get language metadata object
 * @param {string} langCode
 */
export function getLanguageMeta(langCode) {
  const short = fromTelephonyLanguageCode(langCode);
  switch (short) {
    case "te": return SUPPORTED_LANGUAGES.TELUGU;
    case "hi": return SUPPORTED_LANGUAGES.HINDI;
    case "ta": return SUPPORTED_LANGUAGES.TAMIL;
    default: return SUPPORTED_LANGUAGES.ENGLISH;
  }
}
