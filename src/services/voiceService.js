import { STATES, SERVICE_CENTERS } from "../data/db";
import { LANGUAGES_REGISTRY, TRANSLATIONS } from "../data/translations";

export const VOICE_STATES = {
  READY: "ready",
  LISTENING: "listening",
  PROCESSING: "processing",
  FINDING_LOCATION: "finding_location",
  RESPONSE: "response",
};

// Conversational context memory
let conversationContext = {
  activeIntent: null,
  state: "Andhra Pradesh",
  age: null,
  occupation: null,
  category: null,
  hasRationCard: true,
  lat: null,
  lng: null
};

export function resetConversationContext() {
  conversationContext = {
    activeIntent: null,
    state: "Andhra Pradesh",
    age: null,
    occupation: null,
    category: null,
    hasRationCard: true,
    lat: null,
    lng: null
  };
}

export function getConversationContext() {
  return conversationContext;
}

// Haversine formula to compute distance in km
export function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Add coordinates to demo service centers for calculations
const CENTER_COORDINATES = {
  "Village Sachivalayam Center": { lat: 16.3067, lng: 80.4365 },
  "MeeSeva Center AP-042": { lat: 16.5062, lng: 80.6480 },
  "MeeSeva Center TS-109": { lat: 17.4834, lng: 78.3871 },
  "Prajavani Helpdesk": { lat: 17.9689, lng: 79.5941 },
  "e-Sevai Center TN-015": { lat: 13.0601, lng: 80.2621 },
  "TNeGA Helpdesk": { lat: 9.9252, lng: 78.1198 },
  "Bangalore One Center": { lat: 12.9279, lng: 77.5902 },
  "Karnataka One Center": { lat: 15.3647, lng: 75.1240 },
  "Akshaya Center KL-08": { lat: 8.5241, lng: 76.9366 },
  "Akshaya Center KL-92": { lat: 9.9816, lng: 76.2763 },
  "Aaple Sarkar Seva Kendra": { lat: 18.9400, lng: 72.8350 },
  "MahaOnline Citizen Kiosk": { lat: 18.5204, lng: 73.8567 }
};

// Fetch up-to-date schemes database
function getActiveSchemes() {
  const saved = localStorage.getItem("janaseva_schemes");
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [];
}

// Detect language from text (supports 13 languages and Latin transliterations)
export function detectLanguage(text) {
  const patterns = {
    te: /[\u0c00-\u0c7f]/, // Telugu
    hi: /[\u0900-\u097f]/, // Hindi / Marathi
    ta: /[\u0b80-\u0bff]/, // Tamil
    kn: /[\u0c80-\u0cff]/, // Kannada
    ml: /[\u0d00-\u0d7f]/, // Malayalam
    bn: /[\u0980-\u09ff]/, // Bengali / Assamese
    gu: /[\u0a80-\u0aff]/, // Gujarati
    pa: /[\u0a00-\u0a7f]/, // Punjabi
    or: /[\u0b00-\u0b7f]/, // Odia
    ur: /[\u0600-\u06ff]/  // Urdu
  };

  for (const [code, regex] of Object.entries(patterns)) {
    if (regex.test(text)) return code;
  }

  // Mixed / Latin script transliteration checks
  const lower = text.toLowerCase();
  
  // Telugu keywords
  if (containsAny(lower, ["nenu", "student ni", "naaku", "unnaya", "schemes emaina", "kavali", "rythu", "telugu", "vastayi", "cheppandi"])) {
    return "te";
  }
  // Hindi keywords
  if (containsAny(lower, ["main ek", "chahiye", "hai", "hu", "kya", "yojana", "mujhe", "batao", "kaise"])) {
    return "hi";
  }
  // Tamil keywords
  if (containsAny(lower, ["nan", "enakku", "manavan", "kidaikkum", "irukki", "tamil"])) {
    return "ta";
  }
  // Malayalam keywords
  if (containsAny(lower, ["njan", "enikku", "kursan", "mlayalam"])) {
    return "ml";
  }
  // Kannada keywords
  if (containsAny(lower, ["nanu", "kannada", "yojane"])) {
    return "kn";
  }

  return "en";
}

function containsAny(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k.toLowerCase()));
}

// Generate response based on user context extraction and matching
export function generateDialogResponse(transcript, currentLanguage) {
  const lang = detectLanguage(transcript) || currentLanguage || "en";
  const lower = transcript.toLowerCase();
  
  const trans = TRANSLATIONS[lang] || TRANSLATIONS.en || TRANSLATIONS.te;
  const textMap = {
    ackFarmer: trans.cat_farmers,
    ackPension: trans.cat_pension,
    greeting: trans.howCanHelp,
    fallback: trans.askPrompt
  };

  // 1. Acknowledge and extract demographics from spoken text
  // Parse State
  if (containsAny(lower, ["andhra", "ap", "ఆంధ్ర", "ఆంధ్రప్రదేశ్", "आंध्र", "ஆந்திர", "andhra pradesh"])) {
    conversationContext.state = "Andhra Pradesh";
  } else if (containsAny(lower, ["telangana", "ts", "తెలంగాణ", "तेलंगाना"])) {
    conversationContext.state = "Telangana";
  } else if (containsAny(lower, ["tamil nadu", "tamilnadu", "தமிழ்நாடு", "तमिलनाडु"])) {
    conversationContext.state = "Tamil Nadu";
  } else if (containsAny(lower, ["karnataka", "ಕರ್ణాಟక", "कर्नाटक"])) {
    conversationContext.state = "Karnataka";
  } else if (containsAny(lower, ["kerala", "కేరళ", "केरल"])) {
    conversationContext.state = "Kerala";
  } else if (containsAny(lower, ["maharashtra", "మహారాష్ట్ర", "महाराष्ट्र"])) {
    conversationContext.state = "Maharashtra";
  }

  // Parse Occupation
  if (containsAny(lower, ["student", "scholarship", "study", "college", "విద్యార్థి", "छात्र", "மாணவன்", "స్కాలర్షిప్"])) {
    conversationContext.occupation = "student";
    conversationContext.category = "education";
  } else if (containsAny(lower, ["farmer", "agriculture", "crop", "rythu", "రైతు", "किसान", "விவசாயி"])) {
    conversationContext.occupation = "farmer";
    conversationContext.category = "farmers";
  } else if (containsAny(lower, ["senior", "elderly", "pension", "old age", "పెన్షన్", "पेंशन", "ஓய்வூதியம்"])) {
    conversationContext.occupation = "senior";
    conversationContext.category = "pension";
  } else if (containsAny(lower, ["worker", "labor", "mgnrega", "ಉದ್ಯೋಗ", "కూలి", "मजदूर"])) {
    conversationContext.occupation = "worker";
    conversationContext.category = "employment";
  }

  // Parse Age
  const ageMatch = lower.match(/\b(6\d|7\d|8\d|9\d|1[89]|20|30|40|50)\b/);
  if (ageMatch) {
    conversationContext.age = parseInt(ageMatch[0]);
  }

  // 2. CONVERSATIONAL TURN-TAKING FLOW
  // Welcome/Greetings
  if (containsAny(lower, ["hello", "hi", "namaste", "నమస్కారం", "नमस्ते", "வணக்கம்", "ഹലോ", "ನಮಸ್ಕಾರ"])) {
    return {
      response: "Hello! Welcome to JanaSeva Voice. To match you with the best government schemes, please tell me: What is your occupation (e.g. Student, Farmer, Senior Citizen, or Worker)?",
      language: lang,
      category: "home"
    };
  }

  // Follow-up: Ask for State if missing
  if (conversationContext.occupation && !conversationContext.state) {
    // Return friendly prompt in detected language context
    const prompts = {
      te: `అవును. మీకు సహాయం చేయడానికి నేను సిద్ధంగా ఉన్నాను. మీరు ఏ రాష్ట్రంలో ఉంటున్నారు?`,
      hi: `जी हाँ, मैं आपकी मदद कर सकता हूँ। आप किस राज्य में रहते हैं?`,
      ta: `ஆமாம், நான் உங்களுக்கு உதவ முடியும். நீங்கள் எந்த மாநிலத்தில் இருக்கிறீர்கள்?`,
      en: `Alright. To help you with schemes, which state do you live in?`
    };
    return {
      response: prompts[lang] || prompts.en,
      language: lang,
      category: conversationContext.category
    };
  }

  // Follow-up: Ask for Age if senior and age is missing
  if (conversationContext.occupation === "senior" && !conversationContext.age) {
    return {
      response: "I understand you are looking for senior citizen services. Could you please tell me your exact age to check old age pension eligibility?",
      language: lang,
      category: "pension"
    };
  }

  // 3. SCHEME ELIGIBILITY FILTERING ENGINE
  // Once we have key demographics, recommend matching schemes
  if (conversationContext.occupation) {
    const isStudent = conversationContext.occupation === "student";
    const isFarmer = conversationContext.occupation === "farmer";
    const isSenior = conversationContext.occupation === "senior" || (conversationContext.age && conversationContext.age >= 60);
    const isWorker = conversationContext.occupation === "worker";

    let recommended = [];

    // Filter from mock/db schemes
    if (isStudent) {
      recommended.push({
        name: "Post Matric Scholarship Scheme",
        why: "Provides financial aid for college students post 10th grade.",
        benefits: "100% tuition fee reimbursement and a monthly allowance of up to ₹1,200.",
        eligibility: "SC/ST/OBC students with family income under ₹2.5 Lakhs.",
        docs: "Aadhaar Card, Caste Certificate, Income Certificate, Marks List",
        process: "Register online on the National Scholarship Portal (scholarships.gov.in) and upload certificates.",
        website: "https://scholarships.gov.in",
        helpline: "0120-6619540"
      });
    }

    if (isFarmer) {
      recommended.push({
        name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        why: "Central government direct income support for farmers.",
        benefits: "₹6,000 per year, sent directly in three equal installments of ₹2,000 every 4 months.",
        eligibility: "Landowning farmer families with cultivable land in their name.",
        docs: "Aadhaar Card, Land Passbook/Records, Bank Details",
        process: "Apply online at pmkisan.gov.in or visit your local citizen center.",
        website: "https://pmkisan.gov.in",
        helpline: "155261"
      });

      if (conversationContext.state === "Andhra Pradesh") {
        recommended.push({
          name: "YSR Rythu Bharosa (AP)",
          why: "Andhra Pradesh state scheme combining crop investment support.",
          benefits: "₹13,500 per year (including tenant farmers).",
          eligibility: "Landowners or registered tenant farmers in AP.",
          docs: "Aadhaar, Land records, Bank Details",
          process: "Submit details at the local Rythu Bharosa Kendra (RBK).",
          website: "https://ysrrythubharosa.ap.gov.in",
          helpline: "1902"
        });
      }
    }

    if (isSenior) {
      recommended.push({
        name: "IGNOAPS (Indira Gandhi National Old Age Pension)",
        why: "National monthly pension scheme for senior citizens.",
        benefits: "Monthly cash assistance directly into bank account.",
        eligibility: "Aged 60+ from Below Poverty Line (BPL) households.",
        docs: "Aadhaar, BPL Ration Card, Bank Passbook",
        process: "Submit physical form to Gram Panchayat or Block Development Officer (BDO).",
        website: "https://nsap.nic.in",
        helpline: "1800-11-1902"
      });

      if (conversationContext.state === "Andhra Pradesh") {
        recommended.push({
          name: "NTR Bharosa Pension Scheme (AP)",
          why: "State pension delivered directly to your doorstep.",
          benefits: "₹4,000 per month for senior citizens.",
          eligibility: "Resident of Andhra Pradesh, age 60+, white ration card holder.",
          docs: "Aadhaar, White Ration Card, Age proof",
          process: "Register at Village/Ward Sachivalayam; volunteer delivers cash on the 1st of every month.",
          website: "https://sspensions.ap.gov.in",
          helpline: "1902"
        });
      }
    }

    if (isWorker) {
      recommended.push({
        name: "MGNREGA Job Card",
        why: "Guarantees 100 days of unskilled manual labor work.",
        benefits: "Paid employment weekly direct to your bank account.",
        eligibility: "Rural adults willing to do unskilled manual work.",
        docs: "Aadhaar Card, Ration Card, Photo",
        process: "Apply orally or in writing at the local Gram Panchayat office.",
        website: "https://nrega.nic.in",
        helpline: "1800-11-1555"
      });
    }

    if (recommended.length > 0) {
      // Build detailed structured text response
      let respText = `Based on your profile as a ${conversationContext.occupation} in ${conversationContext.state || 'India'}, here are the relevant schemes:\n\n`;
      
      recommended.forEach((s, idx) => {
        respText += `${idx + 1}. ${s.name}\n- Why it applies: ${s.why}\n- Benefits: ${s.benefits}\n- Eligibility: ${s.eligibility}\n- Documents required: ${s.docs}\n- Application process: ${s.process}\n- Official Website: ${s.website}\n- Helpline: ${s.helpline}\n\n`;
      });
      
      return {
        response: respText.trim(),
        language: lang,
        category: conversationContext.category
      };
    }
  }

  // Location search check
  const requiresLocation = containsAny(lower, ["near me", "center", "office", "సమీప", "కేంద్రం", "ஆபீஸ்", "அருகில்"]);
  if (requiresLocation) {
    return { response: "Finding local helpdesks...", language: lang, category: "help", requiresLocation: true };
  }
  if (conversationContext.category === "farmers" || conversationContext.occupation === "farmer") {
    return { response: textMap.ackFarmer, language: lang, category: "farmers" };
  }
  if (conversationContext.category === "pension") {
    return { response: textMap.ackPension, language: lang, category: "pension" };
  }
  if (containsAny(lower, ["hello", "hi", "namaste", "నమస్కారం", "नमस्ते", "வணக்கம்", "ഹലോ", "ನಮಸ್ಕಾರ"])) {
    return { response: textMap.greeting, language: lang, category: "home" };
  }

  return { response: textMap.fallback, language: lang, category: null };
}

// Generate Nearby search results filtered and sorted by distance
export function processLocationResults(latitude, longitude, lang) {
  conversationContext.lat = latitude;
  conversationContext.lng = longitude;

  const activeState = conversationContext.state || "Andhra Pradesh";
  const centers = SERVICE_CENTERS[activeState] || [];
  
  const mapped = centers.map(center => {
    const coords = CENTER_COORDINATES[center.name] || { lat: 16.3067, lng: 80.4365 };
    const dist = getHaversineDistance(latitude, longitude, coords.lat, coords.lng);
    return {
      ...center,
      distance: dist,
      lat: coords.lat,
      lng: coords.lng
    };
  });

  mapped.sort((a, b) => a.distance - b.distance);

  const responses = {
    te: `మీ లొకేషన్ విజయవంతంగా కనుగొనబడింది. మీ చుట్టుపక్కల ఉన్న ${mapped.length} సేవా కేంద్రాలను గుర్తించాను. అత్యంత సమీపంలో ఉన్నది ${mapped[0]?.distance.toFixed(1)} కిలోమీటర్ల దూరంలో ఉన్న ${mapped[0]?.name}. వివరాలను క్రింద చూపిస్తున్నాను.`,
    hi: `आपका स्थान मिल गया है। आपके निकटतम ${mapped.length} सेवा केंद्र मिले हैं। सबसे पास ${mapped[0]?.distance.toFixed(1)} किमी की दूरी पर ${mapped[0]?.name} है।`,
    ta: `இருப்பிடம் கண்டறியப்பட்டது. உங்களுக்கு அருகில் ${mapped.length} மையங்கள் உள்ளன. மிக அருகில் ${mapped[0]?.distance.toFixed(1)} கிமீ தொலைவில் ${mapped[0]?.name} உள்ளது.`,
    en: `Location found successfully. I detected ${mapped.length} service centers near you. The closest one is ${mapped[0]?.name}, located ${mapped[0]?.distance.toFixed(1)} km away.`
  };

  return {
    response: responses[lang] || responses.en,
    results: mapped
  };
}

// Translate Text API client with offline fallback
export async function translateText(text, sourceLanguage, targetLanguage) {
  if (sourceLanguage === targetLanguage) return text;
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, sourceLanguage, targetLanguage })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.translatedText;
  } catch (e) {
    console.warn("Google Cloud Translation API unavailable. Falling back to local strings:", e);
    return text;
  }
}

// Speech-to-Text backend API client with client fallback
export async function SpeechToTextAPI(base64Audio, languageCode) {
  try {
    const response = await fetch("/api/stt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioContent: base64Audio, languageCode })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.transcript;
  } catch (e) {
    console.error("STT API failed:", e);
    throw e;
  }
}

// Process voice conversation using AI translation/intent engine
export async function processVoiceRequest(transcript, language) {
  const detectedLang = detectLanguage(transcript) || language || "en";
  console.log(`[VoiceService] Detected input language: ${detectedLang}`);

  try {
    // 1. Translate user's phrase to English to normalize intent checking
    const englishTranscript = await translateText(transcript, detectedLang, "en");
    console.log(`[VoiceService] English normalized transcript: "${englishTranscript}"`);

    // 2. Generate response in English via local dialog engine
    const result = generateDialogResponse(englishTranscript, "en");

    // 3. Translate response back to user's native tongue
    const localizedResponse = await translateText(result.response, "en", detectedLang);
    console.log(`[VoiceService] Localized response back: "${localizedResponse}"`);

    return {
      transcript,
      response: localizedResponse,
      detectedLanguage: detectedLang,
      category: result.category,
      requiresLocation: result.requiresLocation || false,
      isDemo: false,
      source: "Google Translation API + Localized Dialog Engine"
    };
  } catch (err) {
    console.warn("[VoiceService] Translation pipeline fallback triggered:", err);
    // Hardcoded local fallbacks
    const result = generateDialogResponse(transcript, language);
    return {
      transcript,
      response: result.response,
      detectedLanguage: detectedLang,
      category: result.category,
      requiresLocation: result.requiresLocation || false,
      isDemo: true,
      source: "JanaSeva Voice AI Dialog Engine (Local Fallback)"
    };
  }
}

// Speaks response in user's language using Google TTS with Web Speech API fallback
export async function speakText(text, language) {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  try {
    const regItem = LANGUAGES_REGISTRY.find(item => item.code === language);
    const langCode = regItem ? regItem.speechSynthesisCode : "en-IN";

    console.log(`[VoiceService] Requesting Google Cloud TTS for language: ${langCode}`);
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, languageCode: langCode })
    });
    const data = await response.json();
    if (data.error || data.useFallback) throw new Error(data.error || data.info || "Using browser fallback");

    // Play base64 audio stream via HTML5 Audio
    const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve) => {
      audio.onended = () => resolve({ spoken: true });
      audio.onerror = () => {
        speakTextBrowserFallback(text, language).then(resolve);
      };
      audio.play().catch(async () => {
        await speakTextBrowserFallback(text, language);
        resolve({ spoken: true });
      });
    });
  } catch (err) {
    console.warn("[VoiceService] Google Cloud TTS failed, using browser speechSynthesis fallback:", err);
    return speakTextBrowserFallback(text, language);
  }
}

// Native SpeechSynthesis Fallback
function speakTextBrowserFallback(text, language) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve({ spoken: false });
    
    const utterance = new SpeechSynthesisUtterance(text);
    const regItem = LANGUAGES_REGISTRY.find(item => item.code === language);
    utterance.lang = regItem ? regItem.speechSynthesisCode : "en-IN";

    const isSeniorMode = document.documentElement.classList.contains("large-buttons");
    utterance.rate = isSeniorMode ? 0.75 : 0.9;

    utterance.onend = () => resolve({ spoken: true });
    utterance.onerror = () => resolve({ spoken: false });
    window.speechSynthesis.speak(utterance);
  });
}
