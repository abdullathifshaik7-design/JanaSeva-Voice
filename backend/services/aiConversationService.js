// AI Conversation Engine for JanaSeva Phone Voice
// Features Senior Citizen UX, Scheme Intelligence, Grievance Registration,
// Dynamic Multi-turn Language Switching, and Hybrid LLM + Deterministic Fallback

import { SCHEMES, CATEGORIES, SERVICE_CENTERS } from "../../src/data/db.js";
import { DB_TRANSLATIONS, getTranslatedDbText } from "../../src/data/dbTranslations.js";
import { detectLanguage, toTelephonyLanguageCode, fromTelephonyLanguageCode } from "./languageService.js";
import {
  createEmptyProfile,
  extractProfileFromText,
  getNextEligibilityQuestion,
  evaluateSchemeEligibility,
  recommendSchemes,
  formatSpokenRecommendation,
  getSchemeDetailVoice
} from "./eligibilityEngine.js";

// Specialized Senior-Citizen greeting phrases per language
export const GREETINGS = {
  te: "నమస్కారం! జనసేవ వాయిస్ హెల్ప్‌లైన్‌కు స్వాగతం. మీకు ఏ ప్రభుత్వ పథకం లేదా సమస్య గురించి సమాచారం కావాలి? మీరు తెలుగు, హిందీ, తమిళం లేదా ఇంగ్లీషులో మాట్లాడవచ్చు.",
  hi: "नमस्ते! जनसेवा वॉइस हेल्पलाइन में आपका स्वागत है। आपको किस सरकारी योजना या समस्या के बारे में जानकारी चाहिए? आप हिंदी, तेलुगु, तमिल या अंग्रेजी में बोल सकते हैं।",
  ta: "வணக்கம்! ஜனசேவா உதவி மையத்திற்கு வரவேற்கிறோம். உங்களுக்கு எந்த அரசு திட்டம் அல்லது புகார் பற்றி தகவல் வேண்டும்? நீங்கள் தமிழ், தெலுங்கு, இந்தி அல்லது ஆங்கிலத்தில் பேசலாம்.",
  en: "Namaskaram! Welcome to JanaSeva Voice Helpline. How can I assist you with government schemes or services today? You can speak in Telugu, Hindi, Tamil, or English."
};

// No speech prompts
const NO_SPEECH_RESPONSES = {
  te: "మీరు ఏమీ చెప్పలేదు. దయచేసి మళ్లీ చెప్పండి.",
  hi: "आपने कुछ नहीं कहा। कृपया फिर से कहिए।",
  ta: "நீங்கள் எதுவும் பேசவில்லை. தயவுசெய்து மீண்டும் சொல்லுங்கள்.",
  en: "I couldn't hear you clearly. Please speak again."
};

// Polite farewells
const FAREWELL_RESPONSES = {
  te: "జనసేవకు కాల్ చేసినందుకు ధన్యవాదాలు. మీకు ఎల్లప్పుడూ సహాయం చేయడానికి మేము సిద్ధంగా ఉంటాము. నమస్కారం!",
  hi: "जनसेवा को कॉल करने के लिए धन्यवाद। आपका दिन शुभ हो। नमस्ते!",
  ta: "ஜனசேவாவை தொடர்பு கொண்டதற்கு நன்றி. நல்வாழ்த்துக்கள். வணக்கம்!",
  en: "Thank you for calling JanaSeva. Have a wonderful day. Goodbye!"
};

// Commands recognition dictionaries
const COMMAND_KEYWORDS = {
  repeat: {
    te: ["మళ్లీ చెప్పు", "మళ్ళీ చెప్పు", "మళ్లీ చెప్పండి", "మళ్లీ", "అర్థం కాలేదు", "రిపీట్", "malli cheppu", "malli", "ardham kaaledu", "repeat"],
    hi: ["फिर से बोलो", "फिर से बताइए", "दोबारा बताओ", "समझ नहीं आया", "रिपीट", "phir se", "phir se batao", "samajh nahi aaya", "repeat"],
    ta: ["மீண்டும் சொல்லுங்கள்", "மறுபடியும் சொல்", "புரியவில்லை", "marubadiyum", "puriyala", "repeat"],
    en: ["repeat", "say again", "didn't understand", "pardon", "repeat that", "what did you say"]
  },
  slow: {
    te: ["మెల్లగా చెప్పు", "స్లోగా చెప్పు", "నెమ్మదిగా చెప్పు", "slow ga", "slow ga cheppu", "nemmadiga"],
    hi: ["धीरे बोलो", "धीरे से बताइए", "आराम से बोलो", "dheere bolo", "slow"],
    ta: ["மெதுவாக சொல்லுங்கள்", "மெதுவா பேசு", "medhuva solunga", "slow"],
    en: ["speak slowly", "talk slower", "slow down", "go slow"]
  },
  end: {
    te: ["కాల్ ఎండ్ చెయ్యి", "కాల్ కట్ చెయ్యి", "సరిపోతుంది", "చాలు", "ధన్యవాదాలు", "ఇక ఉంటాను", "call end", "call cut", "chalu", "dhanyavadalu", "bye"],
    hi: ["कॉल बंद करो", "कॉल काट दो", "बस हो गया", "धन्यवाद", "शुक्रिया", "अलविदा", "call end", "call cut", "dhanyawad", "bye"],
    ta: ["கால் முடிக", "கால் கட் செய்", "போதும்", "நன்றி", "போய்ட்டு வரேன்", "call end", "nandri", "bye"],
    en: ["end call", "hang up", "cut the call", "cut call", "disconnect", "bye", "goodbye", "thank you bye", "done"]
  },
  help: {
    te: ["హెల్ప్", "సహాయం", "ఏం చేయగలను", "help", "sahayam"],
    hi: ["मदद", "सहायता", "हेल्प", "help", "madad"],
    ta: ["உதவி", "ஹெல்ப்", "help", "udavi"],
    en: ["help", "what can you do", "options", "assist me"]
  },
  grievance: {
    te: ["కంప్లైంట్", "ఫిర్యాదు", "సమస్య ఉంది", "కంప్లైంట్ ఇవ్వాలి", "రాలేదు", "సమస్య", "complaint", "issue", "firyaad", "raleedu"],
    hi: ["शिकायत", "समस्या", "शिकायत दर्ज", "नहीं आया", "परेशानी", "shikayat", "problem", "nahi aaya"],
    ta: ["புகார்", "பிரச்சனை", "வரவில்லை", "புகார் பதிவு", "complaint", "pirachanai"],
    en: ["complaint", "grievance", "issue", "problem", "not received", "register complaint"]
  }
};

function matchesAny(text, keywordsList) {
  const lower = (text || "").toLowerCase();
  return keywordsList.some(kw => lower.includes(kw.toLowerCase()));
}

/**
 * Check if the text is a pure affirmation/confirmation
 */
export function isAffirmation(text) {
  const clean = (text || "").toLowerCase().replace(/[.,!?;:]/g, " ").trim();
  const words = clean.split(/\s+/).filter(Boolean);

  // Exact phrase match
  const phrases = [
    "avunu cheppu", "avunu cheppandi", "sare cheppu", "sare cheppandi",
    "ha cheppu", "ha cheppandi", "yes please", "yes cheppu", "yes tell me",
    "అవును చెప్పండి", "అవును చెప్పు", "సరే చెప్పండి", "సరే చెప్పు", "హా చెప్పండి", "చెప్పండి",
    "हाँ बताइए", "हाँ बोलो", "हाँ जी", "ठीक है", "बताइए", "बताओ", "जरूर बताओ",
    "ஆம் சொல்லுங்கள்", "சரி சொல்லுங்கள்"
  ];
  if (phrases.some(p => clean.includes(p))) return true;

  // Single word / token match
  const exactTokens = new Set([
    "yes", "yeah", "yep", "sure", "okay", "ok", "fine",
    "avunu", "ha", "haa", "sare", "cheppu", "cheppandi",
    "అవును", "సరే", "చెప్పు", "హా",
    "हाँ", "हां", "ज़रूर", "जरूर", "सही",
    "ஆம்", "சரி", "ஆமாம்"
  ]);

  return words.some(w => exactTokens.has(w));
}

/**
 * Check if the text is a pure negation
 */
export function isNegation(text) {
  const clean = (text || "").toLowerCase().replace(/[.,!?;:]/g, " ").trim();
  const words = clean.split(/\s+/).filter(Boolean);

  const phrases = [
    "no thanks", "not now", "don't want", "dont want", "nahi chahiye",
    "వద్దు ధన్యవాదాలు", "ఇప్పుడు వద్దు", "నాకొద్దు", "లేదు వద్దు",
    "नहीं चाहिए", "मत बताओ", "வேண்டாம் நன்றி"
  ];
  if (phrases.some(p => clean.includes(p))) return true;

  const exactTokens = new Set([
    "no", "nope", "vaddu", "vaddhu", "ledu", "oddu", "oddhu",
    "వద్దు", "లేదు",
    "नहीं", "ना", "नही",
    "இல்லை", "வேண்டாம்"
  ]);

  return words.some(w => exactTokens.has(w));
}

/**
 * Identify user intent and category with strict priority ordering
 */
export function identifyIntent(text, currentLang = "te") {
  if (!text) return { intent: "general_inquiry", category: "general" };
  const lower = text.toLowerCase().trim();

  // 1. END CALL
  for (const langList of Object.values(COMMAND_KEYWORDS.end)) {
    if (matchesAny(lower, langList)) return { intent: "end_call", category: "system" };
  }

  // 2. REPEAT
  for (const langList of Object.values(COMMAND_KEYWORDS.repeat)) {
    if (matchesAny(lower, langList)) return { intent: "repeat", category: "system" };
  }

  // 3. SLOW
  for (const langList of Object.values(COMMAND_KEYWORDS.slow)) {
    if (matchesAny(lower, langList)) return { intent: "slow", category: "system" };
  }

  // 4. HELP
  for (const langList of Object.values(COMMAND_KEYWORDS.help)) {
    if (matchesAny(lower, langList)) return { intent: "help", category: "system" };
  }

  // 5. GRIEVANCE / COMPLAINT
  for (const langList of Object.values(COMMAND_KEYWORDS.grievance)) {
    if (matchesAny(lower, langList)) return { intent: "grievance", category: "problems" };
  }

  // 6. PENSION STATUS (specific status check)
  if (
    matchesAny(lower, ["pension", "పెన్షన్", "పించన్", "पेंशन", "ஓய்வூதியம்"]) &&
    matchesAny(lower, ["status", "check", "స్టేటస్", "చెక్", "जांच", "നില", "స్థితి", "వచ్చిందా", "రాలేదు"])
  ) {
    return { intent: "pension_status", category: "pension" };
  }

  // 7. SPECIFIC CODE-MIXED / SCHEME ACTIONS:
  // Check documents inquiry (supports "Yes documents cheppu", "Sare documents cheppu", "Documents enti")
  if (matchesAny(lower, [
    "documents", "document", "డాక్యుమెంట్లు", "డాక్యుమెంట్", "కాగితాలు", "దస్తావేజులు", "दस्तावेज", "ஆவணங்கள்",
    "dastavez", "pathirangal", "documents enti", "documents cheppu", "documents kavali", "documents chahiye"
  ])) {
    return { intent: "scheme_documents", category: "scheme_query" };
  }

  // Check how to apply inquiry (supports "Yes apply ela?", "Avunu apply ela cheyyali", "Apply ela")
  if (matchesAny(lower, [
    "how to apply", "apply ela", "ela apply", "apply cheyyali", "daraghasthu", "apply kaise",
    "kaise kare", "eppadi vinnapam", "దరఖాస్తు", "आवेदन कैसे", "ఎలా అప్లై", "అప్లై", "apply cheyyadam"
  ])) {
    return { intent: "scheme_apply", category: "scheme_query" };
  }

  // Check Pension Schemes ("Na pension gurinchi cheppu", "Naaku pension kavali", "Old age pension")
  if (matchesAny(lower, [
    "pension", "పెన్షన్", "పించన్", "पेंशन", "ஓய்வூதியம்", "old age", "vridha", "senior", "వృద్ధాప్య", "ntr bharosa", "ఎన్టీఆర్ భరోసా"
  ])) {
    return { intent: "pension", category: "pension" };
  }

  // Check Farmer / Agriculture Schemes ("Farmer ki schemes enti?", "PM Kisan details cheppu", "రైతు పథకాలు")
  if (matchesAny(lower, [
    "farmer", "farmers", "rythu", "rythulu", "రైతు", "రైతులు", "రైతుల", "किसान", "खेती", "விவசாயி",
    "pm kisan", "pm-kisan", "crop", "పంట", "సమ్మాన్", "రైతు భరోసా", "rythu bharosa"
  ])) {
    return { intent: "farmers", category: "farmers" };
  }

  // Check Scholarship / Education
  if (matchesAny(lower, [
    "scholarship", "స్కాలర్‌షిప్", "విద్యా", "छात्रवृत्ति", "கல்வி உதவி", "student", "college", "fees"
  ])) {
    return { intent: "scholarship", category: "education" };
  }

  // Check Scheme Details / Summary ("details cheppu", "vivaralu", "ke baare mein")
  if (matchesAny(lower, [
    "details", "details cheppu", "gurinchi cheppu", "vivaralu", "ke baare mein", "patthi solunga", "వివరాలు", "గురించి చెప్పు", "కే బారే మే"
  ])) {
    return { intent: "scheme_details", category: "scheme_query" };
  }

  // Check Eligibility / Recommendation Request ("Mee schemes kanukkundam", "Check eligibility", "Naku em schemes vastayi", "Farmer ki em schemes unnayi")
  if (matchesAny(lower, [
    "suitable", "eligibility", "eligible", "arhulanu", "arhulu", "arhutha",
    "naku em schemes", "naaku em schemes", "em schemes unnayi", "yojana check",
    "schemes kanukkundam", "check eligibility", "naaku schemes kavali", "scheme kavali",
    "schemes unte cheppu", "kya yojana", "kon si yojana", "yojana batayein", "schemes enti",
    "పథకాలు ఏంటి", "పథకాలు", "पात्र", "पात्रता", "ennaku enna thittam"
  ])) {
    return { intent: "eligibility_check", category: "eligibility" };
  }

  // Check Certificates / Documents
  if (matchesAny(lower, [
    "certificate", "ధృవీకరణ", "సర్టిఫికెట్", "प्रमाण पत्र", "சான்றிதழ்", "income certificate", "caste certificate", "ration card", "రేషన్ కార్డు"
  ])) {
    return { intent: "certificates", category: "identity" };
  }

  // Check Housing
  if (matchesAny(lower, [
    "house", "housing", "pmay", "ఇల్లు", "ఆవాస్", "వీడు", "illu", "ఇళ్ల పథకం"
  ])) {
    return { intent: "housing", category: "housing" };
  }

  // Check Health
  if (matchesAny(lower, [
    "health", "hospital", "ayushman", "ఆరోగ్యం", "చికిత్స", "स्वास्थ्य", "மருத்துவம்"
  ])) {
    return { intent: "health", category: "health" };
  }

  // Check Nearby Center
  if (matchesAny(lower, [
    "near me", "center", "office", "సమీప", "కేంద్రం", "समीप", "அருகில்", "meeseva", "sachivalayam"
  ])) {
    return { intent: "near_me", category: "help" };
  }

  // 8. AFFIRMATION / CONFIRMATION (pure confirmation without specific intent words)
  if (isAffirmation(lower)) {
    return { intent: "confirmation", category: "dialog" };
  }

  // 9. NEGATION (pure rejection / polite refusal)
  if (isNegation(lower)) {
    return { intent: "negation", category: "dialog" };
  }

  return { intent: "general_inquiry", category: "general" };
}

/**
 * Match a specific scheme from user utterance
 */
export function findSchemeByQuery(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  for (const s of SCHEMES) {
    if (lower.includes(s.id)) return s;
    if (lower.includes(s.name.toLowerCase())) return s;
    if (s.alternateNames && s.alternateNames.some(alt => lower.includes(alt.toLowerCase()))) return s;
  }

  if (/pm kisan|పీఎం కిసాన్|पीएम किसान|kisan samman/.test(lower)) {
    return SCHEMES.find(s => s.id === "pm-kisan");
  }
  if (/rythu bharosa|రైతు భరోసా|ysr rythu/.test(lower)) {
    return SCHEMES.find(s => s.id === "ap-rythu-bharosa");
  }
  if (/ntr bharosa|ఆంధ్రప్రదేశ్ వృద్ధాప్య|ap pension/.test(lower)) {
    return SCHEMES.find(s => s.id === "ybr-ntr-pension-ap");
  }
  if (/pension|పెన్షన్|పించన్|पेंशन|old age/.test(lower)) {
    return SCHEMES.find(s => s.id === "old-age-pension-national") || SCHEMES.find(s => s.id === "ybr-ntr-pension-ap");
  }
  if (/scholarship|student|విద్యార్థి|छात्रवृत्ति/.test(lower)) {
    return SCHEMES.find(s => s.id === "post-matric-scholarship");
  }
  if (/ayushman|pmjay|health card|ఆరోగ్య కార్డ్|आयुष्मान/.test(lower)) {
    return SCHEMES.find(s => s.id === "ayushman-bharat-pmjay");
  }
  if (/pmay|house|housing|ఇళ్ల|ఆవాస్|आवास/.test(lower)) {
    return SCHEMES.find(s => s.id === "pm-awas-yojana");
  }
  if (/nrega|100 days|ఉపాధి హామీ|मनरेगा/.test(lower)) {
    return SCHEMES.find(s => s.id === "mgnrega-jobseeker");
  }
  if (/sukanya|girl child|సుకన్య|सुकन्या/.test(lower)) {
    return SCHEMES.find(s => s.id === "sukanya-samriddhi");
  }

  return null;
}

/**
 * Generate senior-citizen friendly answer using local scheme database
 */
export function generateLocalPhoneResponse(intent, category, userText, langCode, session) {
  const lang = fromTelephonyLanguageCode(langCode);

  // 1. Repeat last answer
  if (intent === "repeat") {
    if (session && session.lastResponse) {
      const intro = {
        te: "నేను మళ్లీ చెప్తున్నాను: ",
        hi: "मैं फिर से दोहरा रहा हूँ: ",
        ta: "நான் மீண்டும் சொல்கிறேன்: ",
        en: "Let me repeat that for you: "
      };
      return {
        text: (intro[lang] || intro.en) + session.lastResponse,
        isEndCall: false
      };
    }
  }

  // 2. Speak slowly
  if (intent === "slow") {
    if (session && session.lastResponse) {
      const slowIntro = {
        te: "సరేనండి, నెమ్మదిగా చెప్తాను. ",
        hi: "जी हाँ, मैं धीरे से बता रहा हूँ। ",
        ta: "சரி, மெதுவாக சொல்கிறேன். ",
        en: "Certainly, I will speak more slowly. "
      };
      return {
        text: (slowIntro[lang] || slowIntro.en) + session.lastResponse,
        isEndCall: false,
        slowPaced: true
      };
    }
  }

  // 3. Help Overview
  if (intent === "help") {
    const helpText = {
      te: "జనసేవలో మీరు పెన్షన్, పీఎం-కిసాన్ రైతు పథకాలు, స్కాలర్‌షిప్‌లు, రేషన్ లేదా ఇతర సర్టిఫికెట్ల గురించి తెలుసుకోవచ్చు. లేదా ఏదైనా సమస్య ఉంటే ఫిర్యాదు కూడా నమోదు చేయవచ్చు. మీకు ఏ పథకం గురించి కావాలి?",
      hi: "जनसेवा में आप पेंशन, पीएम-किसान, छात्रवृत्ति, राशन या प्रमाण पत्रों की जानकारी पा सकते हैं, और शिकायत भी दर्ज कर सकते हैं। आप किसके बारे में जानना चाहते हैं?",
      ta: "ஜனசேவாவில் ஓய்வூதியம், பிஎம்-கிசான் விவசாய திட்டம், உதவித்தொகை அல்லது சான்றிதழ்கள் பற்றி அறியலாம். புகார் கூட பதியலாம். உங்களுக்கு என்ன உதவி வேண்டும்?",
      en: "In JanaSeva, you can ask about pensions, PM-KISAN farmer schemes, student scholarships, certificates, or register a complaint. What would you like to know?"
    };
    return { text: helpText[lang] || helpText.en, isEndCall: false };
  }

  // 4. Grievance Registration
  if (intent === "grievance") {
    const trackingId = `JSV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const grievanceReplies = {
      te: `మీ సమస్య నమోదు చేయబడింది. మీ కంప్లైంట్ ట్రాకింగ్ నంబర్: ${trackingId}. సంబంధిత ప్రభుత్వ అధికారి దీనిని పరిశీలిస్తారు. దయచేసి ఈ నంబర్ గుర్తుపెట్టుకోండి. మీకు ఇంకేమైనా సహాయం కావాలా?`,
      hi: `आपकी शिकायत दर्ज कर ली गई है। आपका ट्रैकिंग नंबर है: ${trackingId}। संबंधित अधिकारी इसकी जांच करेंगे। कृपया यह नंबर याद रखें। क्या आपको कोई अन्य सहायता चाहिए?`,
      ta: `உங்கள் புகார் பதிவு செய்யப்பட்டது. உங்கள் புகார் எண்: ${trackingId}. அரசு அலுவலர் இதை ஆய்வு செய்வார். இந்த எண்ணை குறித்துக் கொள்ளுங்கள். வேறு உதவி தேவையா?`,
      en: `Your complaint has been registered. Your tracking ID is ${trackingId}. An official will review your issue. Please note this ID. Can I help with anything else?`
    };
    return { text: grievanceReplies[lang] || grievanceReplies.en, isEndCall: false, trackingId };
  }

  // 5. Pension Schemes
  if (intent === "pension") {
    const lower = (userText || "").toLowerCase();
    if (/status|స్టేటస్|check|చెక్|जांच/.test(lower)) {
      const statusReplies = {
        te: "మీ పెన్షన్ స్థితిని తనిఖీ చేయడానికి ఆధార్ నంబర్ లేదా రేషన్ కార్డుతో sspensions.ap.gov.in లేదా మీ గ్రామ సచివాలయంలో సంప్రదించవచ్చు. అధికారిక హెల్ప్‌లైన్: 1902.",
        hi: "पेंशन की स्थिति जांचने के लिए आप अपने आधार नंबर के साथ sspensions.ap.gov.in या नजदीकी नागरिक सेवा केंद्र पर संपर्क करें। आधिकारिक हेल्पलाइन: 1902।",
        ta: "ஓய்வூதிய நிலையை அறிய ஆதார் எண்ணுடன் அதிகாரப்பூர்వ இணையதளம் sspensions.ap.gov.in அல்லது இ-சேவை மையத்தை தொடர்பு கொள்ளவும். உதவி எண்: 1902.",
        en: "To check your pension status, you can visit sspensions.ap.gov.in or your local Village Secretariat with your Aadhaar or Ration card. Helpline: 1902."
      };
      const pensionScheme = SCHEMES.find(s => s.id === "ybr-ntr-pension-ap") || SCHEMES.find(s => s.id === "old-age-pension-national");
      return {
        text: statusReplies[lang] || statusReplies.en,
        isEndCall: false,
        selectedScheme: pensionScheme,
        recommendations: [pensionScheme]
      };
    }

    const pensionReplies = {
      te: "వృద్ధాప్య పెన్షన్ పథకం కింద 60 ఏళ్లు పైబడిన వారికి నెలకు ఆర్థిక సహాయం అందుతుంది. ఆంధ్రప్రదేశ్‌లో ఎన్టీఆర్ భరోసా కింద నెలకు రూ. 4,000 ఇస్తున్నారు. అర్హత కోసం తెల్ల రేషన్ కార్డు మరియు ఆధార్ కార్డు అవసరం. మీ స్థానిక సచివాలయంలో దరఖాస్తు చేసుకోవచ్చు. అవసరమైన డాక్యుమెంట్లు లేదా దరఖాస్తు విధానం చెప్పమంటారా?",
      hi: "वृद्धावस्था पेंशन योजना में 60 वर्ष से अधिक उम्र के नागरिकों को मासिक वित्तीय सहायता मिलती है। इसके लिए आधार कार्ड, बैंक खाता और बीपीएल राशन कार्ड आवश्यक है। आप अपने नजदीकी नागरिक सेवा केंद्र पर आवेदन कर सकते हैं।",
      ta: "முதியோர் ஓய்வூதிய திட்டத்தின் கீழ் 60 வயதுக்கு மேற்பட்டோருக்கு மாதாந்திர உதவித்தொகை வழங்கப்படுகிறது. இதற்கு ஆதார் அட்டை மற்றும் குடும்ப அட்டை தேவை. அருகிலுள்ள இ-சேவை மையத்தில் விண்ணப்பிக்கலாம்.",
      en: "Under the Old Age Pension scheme, senior citizens aged 60 and above receive monthly financial assistance. For example, in AP, NTR Bharosa provides ₹4,000 per month. Required documents are Aadhaar and White Ration card. Would you like to hear the required documents or how to apply?"
    };
    const pensionScheme = SCHEMES.find(s => s.id === "ybr-ntr-pension-ap") || SCHEMES.find(s => s.id === "old-age-pension-national");
    return {
      text: pensionReplies[lang] || pensionReplies.en,
      isEndCall: false,
      selectedScheme: pensionScheme,
      recommendations: [pensionScheme]
    };
  }

  // 6. Farmer Schemes
  if (intent === "farmers") {
    const farmerReplies = {
      te: "రైతులకు కేంద్ర ప్రభుత్వం పీఎం-కిసాన్ ద్వారా ఏడాదికి రూ. 6,000 మూడు విడతల్లో నేరుగా బ్యాంక్ ఖాతాలో జమ చేస్తుంది. సొంత భూమి ఉన్న రైతులు ఆధార్ మరియు పట్టాదారు పాస్‌బుక్‌తో pmkisan.gov.in లేదా రైతు భరోసా కేంద్రంలో దరఖాస్తు చేయవచ్చు. అవసరమైన డాక్యుమెంట్లు చెప్పమంటారా?",
      hi: "किसानों के लिए पीएम-किसान योजना के तहत हर साल ₹6,000 की सहायता तीन किश्तों में सीधे बैंक खाते में मिलती है। इसके लिए आधार कार्ड और जमीन के कागजात आवश्यक हैं। pmkisan.gov.in पर आवेदन कर सकते हैं।",
      ta: "விவசாயிகளுக்கு பிஎம்-கிசான் திட்டத்தின் கீழ் ஆண்டுக்கு ₹6,000 மூன்று தவணைகளாக வங்கி கணக்கில் செலுத்தப்படுகிறது. இதற்கு ஆதார் மற்றும் நில ஆவணங்கள் தேவை.",
      en: "Under PM-KISAN, eligible farmers receive ₹6,000 annually in three equal installments directly into their bank accounts. Official portal: pmkisan.gov.in. Required documents are Aadhaar and Land records. Would you like to hear the required documents?"
    };
    const farmerSchemes = SCHEMES.filter(s => s.category === "farmers");
    return {
      text: farmerReplies[lang] || farmerReplies.en,
      isEndCall: false,
      selectedScheme: farmerSchemes[0],
      recommendations: farmerSchemes
    };
  }

  // 7. Scholarship
  if (intent === "scholarship") {
    const scholarshipReplies = {
      te: "పోస్ట్ మెట్రిక్ స్కాలర్‌షిప్ పథకం ద్వారా 10వ తరగతి తర్వాతి విద్యార్థులకు 100% ట్యూషన్ ఫీజు రీయింబర్స్మెంట్ మరియు నెలవారీ అలవెన్స్ లభిస్తుంది. scholarships.gov.in లో దరఖాస్తు చేసుకోవచ్చు.",
      hi: "पोस्ट मैट्रिक छात्रवृत्ति योजना 10वीं कक्षा के बाद के छात्रों को ट्यूशन फीस प्रतिपूर्ति और मासिक भत्ता प्रदान करती है। छात्र scholarships.gov.in पर आवेदन कर सकते हैं।",
      ta: "போஸ்ட் மெட்ரிக் உதவித்தொகை திட்டம் 10 ஆம் வகுப்பிற்குப் பிந்தைய மாணவர்களுக்கு முழு கல்வி கட்டண சலுகை வழங்குகிறது. scholarships.gov.in இல் விண்ணப்பிக்கலாம்.",
      en: "The Post Matric Scholarship provides 100% tuition fee reimbursement and monthly allowances for students after 10th grade on scholarships.gov.in."
    };
    return { text: scholarshipReplies[lang] || scholarshipReplies.en, isEndCall: false };
  }

  // 8. Certificates
  if (intent === "certificates") {
    const certReplies = {
      te: "ఆదాయం, కులం లేదా నివాస ధ్రువీకరణ పత్రాల కోసం ఆధార్ కార్డు, రేషన్ కార్డు మరియు చిరునామా ఆధారంతో మీ సమీప మీసేవ లేదా గ్రామ సచివాలయంలో దరఖాస్తు చేసుకోవచ్చు.",
      hi: "आय, जाति या निवास प्रमाण पत्र के लिए आधार कार्ड और राशन कार्ड के साथ अपने निकटतम नागरिक सेवा केंद्र या सीएससी पर आवेदन करें।",
      ta: "வருமானம், சாதி அல்லது இருப்பிடச் சான்றிதழுக்கு ஆதார் மற்றும் குடும்ப அட்டையுடன் இ-சேவை மையத்தில் விண்ணப்பிக்கலாம்.",
      en: "For Income, Caste, or Residence certificates, you can apply at your nearest MeeSeva or Citizen Service Center with your Aadhaar and Ration card."
    };
    return { text: certReplies[lang] || certReplies.en, isEndCall: false };
  }

  // 9. Nearby Centers
  if (intent === "near_me") {
    const centerReplies = {
      te: "మీ దగ్గరలోని గ్రామ సచివాలయం లేదా మీసేవ కేంద్రంలో అన్ని ప్రభుత్వ సేవలు అందుబాటులో ఉంటాయి. లేదా అధికారిక హెల్ప్‌లైన్ 1902 కి కాల్ చేయవచ్చు.",
      hi: "आपके नजदीकी ग्राम सचिवालय या जन सेवा केंद्र में सभी सरकारी सेवाएं उपलब्ध हैं। अधिक जानकारी के लिए हेल्पलाइन 1902 पर कॉल करें।",
      ta: "உங்கள் அருகிலுள்ள இ-சேவை மையம் அல்லது பஞ்சாயத்து அலுவலகத்தில் அரசு சேவைகளை பெறலாம். உதவிக்கு 1902 எண்ணை அழைக்கலாம்.",
      en: "Government services are available at your nearest Village Secretariat, MeeSeva, or Common Service Center. You can also dial helpline 1902."
    };
    return { text: centerReplies[lang] || centerReplies.en, isEndCall: false };
  }

  // 10. General fallback / clarification
  const fallbackReplies = {
    te: "మీరు పెన్షన్ గురించి అడుగుతున్నారా, లేదా రైతు పథకాలు, స్కాలర్‌షిప్ వంటి ఇతర పథకాల గురించి తెలుసుకోవాలా?",
    hi: "क्या आप पेंशन के बारे में पूछ रहे हैं, या किसान योजना, छात्रवृत्ति जैसी अन्य सरकारी योजनाओं के बारे में जानना चाहते हैं?",
    ta: "நீங்கள் ஓய்வூதியம் பற்றி கேட்கிறீர்களா, அல்லது பிற அரசு திட்டங்கள் பற்றி அறிய விரும்புகிறீர்களா?",
    en: "Are you asking about pensions, or would you like to know about farmer schemes, scholarships, or other government services?"
  };

  if (session) {
    session.lastOffer = "scheme_offer";
  }

  return { text: fallbackReplies[lang] || fallbackReplies.en, isEndCall: false };
}

/**
 * Call Groq / OpenAI LLM for natural, conversational response grounded in scheme data
 */
async function callLLMConversation(userText, langCode, session) {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!groqKey && !openaiKey) return null;

  const activeKey = groqKey || openaiKey;
  const url = groqKey
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const model = groqKey ? "llama-3.3-70b-versatile" : "gpt-4o-mini";

  const lang = fromTelephonyLanguageCode(langCode);
  const langNames = { te: "Telugu", hi: "Hindi", ta: "Tamil", en: "English" };
  const targetLanguageName = langNames[lang] || "English";

  const systemPrompt = `You are JanaSeva, a warm, patient, and respectful telephone AI voice assistant for Indian citizens, especially senior citizens.
Target language: ${targetLanguageName}.
Guidelines:
1. Speak ONLY in ${targetLanguageName}. Use natural, respectful, and simple vocabulary.
2. Keep your answer SHORT (maximum 2-3 brief sentences) so it sounds natural over a phone call.
3. NEVER use Markdown, asterisks, bullet points, numbered lists, or URLs. Only plain spoken text.
4. If the user asks about a government scheme (pension, PM-KISAN, scholarship, ration card, housing), give a helpful summary of benefits, required documents, and how to apply.
5. If the caller asks to file a complaint or grievance, say their complaint has been registered with ID "JSV-2026-${Math.floor(100000 + Math.random() * 900000)}".
6. Be warm, reassuring, and conclude with a gentle follow-up question.`;

  const messages = [
    { role: "system", content: systemPrompt }
  ];

  if (session && session.conversationHistory) {
    const recent = session.conversationHistory.slice(-4);
    for (const h of recent) {
      messages.push({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.text
      });
    }
  }

  messages.push({ role: "user", content: userText });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 220
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (reply) {
      return reply.replace(/[*#_`]/g, "").trim();
    }
  } catch (err) {
    console.warn("[AIConversationService] LLM call error, using local fallback:", err.message);
  }

  return null;
}

/**
 * Main conversational entry point: processes speech utterance within a phone call session
 * @param {string} userSpeech
 * @param {object} session
 * @returns {Promise<{ text: string, language: string, isEndCall: boolean, intent: string, slowPaced: boolean }>}
 */
export async function processPhoneSpeechTurn(userSpeech, session) {
  // 1. Handle No Speech / Empty Speech
  if (!userSpeech || !userSpeech.trim()) {
    const currentLang = session?.language ? fromTelephonyLanguageCode(session.language) : "te";
    const prompt = NO_SPEECH_RESPONSES[currentLang] || NO_SPEECH_RESPONSES.en;
    return {
      text: prompt,
      language: toTelephonyLanguageCode(currentLang),
      isEndCall: false,
      intent: "no_speech",
      slowPaced: false
    };
  }

  const cleanSpeech = userSpeech.trim();

  // 2. Dynamic Language Detection (detect from this specific utterance)
  const previousLang = session?.language ? fromTelephonyLanguageCode(session.language) : "te";
  const detectedShortLang = detectLanguage(cleanSpeech, previousLang);
  const activeTelephonyLang = toTelephonyLanguageCode(detectedShortLang);

  console.log(`[Phone AI] Call: ${session?.callId || 'test'} | Detected Lang: ${detectedShortLang} | Speech: "${cleanSpeech}"`);

  // 3. Detect Intent with strict priority
  const { intent, category } = identifyIntent(cleanSpeech, detectedShortLang);

  let finalResponse = null;

  // 4. Handle Polite End Call
  if (intent === "end_call") {
    const farewell = FAREWELL_RESPONSES[detectedShortLang] || FAREWELL_RESPONSES.en;
    finalResponse = {
      text: farewell,
      language: activeTelephonyLang,
      isEndCall: true,
      intent: "end_call",
      slowPaced: false
    };
  }

  // 5. Repeat Command
  else if (intent === "repeat") {
    const localRes = generateLocalPhoneResponse(intent, category, cleanSpeech, activeTelephonyLang, session);
    finalResponse = {
      text: localRes.text,
      language: activeTelephonyLang,
      isEndCall: false,
      intent: "repeat",
      slowPaced: false
    };
  }

  // 6. Slow Command
  else if (intent === "slow") {
    const localRes = generateLocalPhoneResponse(intent, category, cleanSpeech, activeTelephonyLang, session);
    finalResponse = {
      text: localRes.text,
      language: activeTelephonyLang,
      isEndCall: false,
      intent: "slow",
      slowPaced: true
    };
  }

  // 7. Help Command
  else if (intent === "help") {
    const localRes = generateLocalPhoneResponse(intent, category, cleanSpeech, activeTelephonyLang, session);
    if (session) session.lastOffer = "scheme_offer";
    finalResponse = {
      text: localRes.text,
      language: activeTelephonyLang,
      isEndCall: false,
      intent: "help",
      slowPaced: false
    };
  }

  // 8. Grievance Registration
  else if (intent === "grievance") {
    const localRes = generateLocalPhoneResponse(intent, category, cleanSpeech, activeTelephonyLang, session);
    finalResponse = {
      text: localRes.text,
      language: activeTelephonyLang,
      isEndCall: false,
      intent: "grievance",
      trackingId: localRes.trackingId,
      slowPaced: false
    };
  }

  // 9. Pension Status Check ("Na pension status check cheyyali")
  else if (intent === "pension_status") {
    const statusReplies = {
      te: "మీ పెన్షన్ స్థితిని తనిఖీ చేయడానికి ఆధార్ నంబర్ లేదా రేషన్ కార్డుతో sspensions.ap.gov.in లేదా మీ గ్రామ సచివాలయంలో సంప్రదించవచ్చు. అధికారిక హెల్ప్‌లైన్: 1902.",
      hi: "पेंशन की स्थिति जांचने के लिए आप अपने आधार नंबर के साथ sspensions.ap.gov.in या नजदीकी नागरिक सेवा केंद्र पर संपर्क करें। आधिकारिक हेल्पलाइन: 1902।",
      ta: "ஓய்வூதிய நிலையை அறிய ஆதార్ எண்ணுடன் அதிகாரப்பூர்வ இணையதளம் sspensions.ap.gov.in அல்லது இ-சேவை மையத்தை தொடர்பு கொள்ளவும். உதவி எண்: 1902.",
      en: "To check your pension status, you can visit sspensions.ap.gov.in or your local Village Secretariat with your Aadhaar or Ration card. Helpline: 1902."
    };
    const pensionScheme = SCHEMES.find(s => s.id === "ybr-ntr-pension-ap") || SCHEMES.find(s => s.id === "old-age-pension-national");
    if (session) {
      session.selectedScheme = pensionScheme;
      session.lastOffer = null;
    }
    finalResponse = {
      text: statusReplies[detectedShortLang] || statusReplies.en,
      language: activeTelephonyLang,
      isEndCall: false,
      intent: "pension_status",
      selectedScheme: pensionScheme,
      recommendations: [pensionScheme]
    };
  }

  // 10. Scheme Documents inquiry (e.g., "Documents enti?", "Yes documents cheppu")
  else if (intent === "scheme_documents") {
    if (session) session.interviewMode = false;
    const targetScheme = findSchemeByQuery(cleanSpeech) || (session && session.selectedScheme) || SCHEMES[0];
    if (session) {
      session.selectedScheme = targetScheme;
      session.lastOffer = "apply_offer";
    }
    const docText = getSchemeDetailVoice(targetScheme, "documents", detectedShortLang);
    const applyPrompt = {
      te: " దరఖాస్తు విధానం కూడా తెలుసుకోవాలా?",
      hi: " क्या आप आवेदन प्रक्रिया भी जानना चाहते हैं?",
      ta: " விண்ணப்பிக்கும் முறையையும் அறிய விரும்புகிறீர்களா?",
      en: " Would you also like to know how to apply?"
    };
    finalResponse = {
      text: docText + (applyPrompt[detectedShortLang] || applyPrompt.en),
      language: activeTelephonyLang,
      isEndCall: false,
      intent: "scheme_documents",
      selectedScheme: targetScheme,
      recommendations: (session && session.recommendations) || [targetScheme]
    };
  }

  // 11. Scheme How to Apply inquiry (e.g., "Apply ela cheyyali?", "Yes apply ela?")
  else if (intent === "scheme_apply") {
    if (session) {
      session.interviewMode = false;
      session.lastOffer = null;
    }
    const targetScheme = findSchemeByQuery(cleanSpeech) || (session && session.selectedScheme) || SCHEMES[0];
    if (session) session.selectedScheme = targetScheme;
    const applyText = getSchemeDetailVoice(targetScheme, "apply", detectedShortLang);
    finalResponse = {
      text: applyText,
      language: activeTelephonyLang,
      isEndCall: false,
      intent: "scheme_apply",
      selectedScheme: targetScheme,
      recommendations: (session && session.recommendations) || [targetScheme]
    };
  }

  // 12. Specific Pension Inquiries ("Na pension gurinchi cheppu", "Naaku pension kavali")
  else if (intent === "pension") {
    if (session) session.interviewMode = false;
    const pensionScheme = SCHEMES.find(s => s.id === "ybr-ntr-pension-ap") || SCHEMES.find(s => s.id === "old-age-pension-national");
    if (session) {
      session.selectedScheme = pensionScheme;
      session.lastOffer = "documents_offer";
    }
    const pensionReplies = {
      te: "వృద్ధాప్య పెన్షన్ పథకం కింద 60 ఏళ్లు పైబడిన వారికి నెలకు ఆర్థిక సహాయం అందుతుంది. ఆంధ్రప్రదేశ్‌లో ఎన్టీఆర్ భరోసా కింద నెలకు రూ. 4,000 ఇస్తున్నారు. అర్హత కోసం తెల్ల రేషన్ కార్డు మరియు ఆధార్ కార్డు అవసరం. అవసరమైన డాక్యుమెంట్లు చెప్పమంటారా?",
      hi: "वृद्धावस्था पेंशन योजना में 60 वर्ष से अधिक उम्र के नागरिकों को मासिक वित्तीय सहायता (एनटीआर भरोसा के तहत ₹4,000) मिलती है। इसके लिए आधार कार्ड और राशन कार्ड आवश्यक है। क्या आप इसके आवश्यक दस्तावेज जानना चाहते हैं?",
      ta: "முதியோர் ஓய்வூதிய திட்டத்தின் கீழ் 60 வயதுக்கு மேற்பட்டோருக்கு மாதாந்திர உதவித்தொகை வழங்கப்படுகிறது. இதற்கு தேவையான ஆவணங்களை அறிய விரும்புகிறீர்களா?",
      en: "Under the Old Age Pension scheme, senior citizens aged 60 and above receive monthly financial assistance (₹4,000/month under NTR Bharosa). Required documents are Aadhaar and Ration card. Would you like to hear the required documents?"
    };
    finalResponse = {
      text: pensionReplies[detectedShortLang] || pensionReplies.en,
      language: activeTelephonyLang,
      isEndCall: false,
      intent: "pension",
      selectedScheme: pensionScheme,
      recommendations: [pensionScheme]
    };
  }

  // 13. Specific Farmer Inquiries ("Farmer ki schemes enti?", "PM Kisan details cheppu")
  else if (intent === "farmers") {
    if (session) session.interviewMode = false;
    const farmerSchemes = SCHEMES.filter(s => s.category === "farmers");
    const farmerScheme = farmerSchemes[0] || SCHEMES[0];
    if (session) {
      session.selectedScheme = farmerScheme;
      session.lastOffer = "documents_offer";
    }
    const farmerReplies = {
      te: "రైతులకు కేంద్ర ప్రభుత్వం పీఎం-కిసాన్ ద్వారా ఏడాదికి రూ. 6,000 మరియు ఏపీలో రైతు భరోసా కింద ఆర్థిక సాయం అందిస్తోంది. అధికారిక పోర్టల్ pmkisan.gov.in. అవసరమైన డాక్యుమెంట్లు చెప్పమంటారా?",
      hi: "किसानों के लिए पीएम-किसान योजना के तहत हर साल ₹6,000 की सहायता तीन किश्तों में सीधे बैंक खाते में मिलती है। आधिकारिक पोर्टल pmkisan.gov.in है। क्या आप आवश्यक दस्तावेज जानना चाहते हैं?",
      ta: "விவசாயிகளுக்கு பிஎம்-கிசான் திட்டத்தின் கீழ் ஆண்டுக்கு ₹6,000 மூன்று தவணைகளாக வங்கி கணக்கில் செலுத்தப்படுகிறது. தேவையான ஆவணங்களை அறிய விரும்புகிறீர்களா?",
      en: "Under PM-KISAN, eligible farmers receive ₹6,000 annually in three installments on pmkisan.gov.in. Required documents are Aadhaar and Land ownership records. Would you like to hear the required documents?"
    };
    finalResponse = {
      text: farmerReplies[detectedShortLang] || farmerReplies.en,
      language: activeTelephonyLang,
      isEndCall: false,
      intent: "farmers",
      selectedScheme: farmerScheme,
      recommendations: farmerSchemes
    };
  }

  // 14. Scholarship Inquiries
  else if (intent === "scholarship") {
    if (session) session.interviewMode = false;
    const scholarScheme = SCHEMES.find(s => s.id === "post-matric-scholarship") || SCHEMES[4];
    if (session) {
      session.selectedScheme = scholarScheme;
      session.lastOffer = "documents_offer";
    }
    const scholarshipReplies = {
      te: "పోస్ట్ మెట్రిక్ స్కాలర్‌షిప్ పథకం ద్వారా 10వ తరగతి తర్వాతి విద్యార్థులకు 100% ట్యూషన్ ఫీజు రీయింబర్స్మెంట్ మరియు అలవెన్స్ లభిస్తుంది. scholarships.gov.in లో దరఖాస్తు చేసుకోవచ్చు. అవసరమైన డాక్యుమెంట్లు చెప్పమంటారా?",
      hi: "पोस्ट मैट्रिक छात्रवृत्ति योजना 10वीं के बाद के छात्रों को फीस प्रतिपूर्ति और भत्ता प्रदान करती है। scholarships.gov.in पर आवेदन कर सकते हैं। क्या आप दस्तावेज जानना चाहते हैं?",
      ta: "போஸ்ட் மெட்ரிக் உதவித்தொகை திட்டம் மாணவர்களுக்கு கல்வி கட்டண சலுகை வழங்குகிறது. தேவையான ஆவணங்களை அறிய விரும்புகிறீர்களா?",
      en: "Post Matric Scholarship provides 100% tuition fee reimbursement and monthly allowances on scholarships.gov.in. Would you like to hear the required documents?"
    };
    finalResponse = {
      text: scholarshipReplies[detectedShortLang] || scholarshipReplies.en,
      language: activeTelephonyLang,
      isEndCall: false,
      intent: "scholarship",
      selectedScheme: scholarScheme,
      recommendations: [scholarScheme]
    };
  }

  // 15. Scheme Details / Summary inquiry
  else if (intent === "scheme_details") {
    if (session) session.interviewMode = false;
    const targetScheme = findSchemeByQuery(cleanSpeech) || (session && session.selectedScheme);
    if (targetScheme) {
      if (session) {
        session.selectedScheme = targetScheme;
        session.lastOffer = "documents_offer";
      }
      const detailText = getSchemeDetailVoice(targetScheme, "summary", detectedShortLang);
      finalResponse = {
        text: detailText,
        language: activeTelephonyLang,
        isEndCall: false,
        intent: "scheme_details",
        selectedScheme: targetScheme,
        recommendations: (session && session.recommendations) || [targetScheme]
      };
    }
  }

  // 16. AFFIRMATIVE / CONFIRMATION RESPONSES ("Yes", "Avunu", "Avunu cheppu", "Ha", "Sare", "Sure", "Okay")
  else if (intent === "confirmation") {
    // Context 1: Prior assistant offer was to read documents
    if (session && session.lastOffer === "documents_offer") {
      const targetScheme = session.selectedScheme || SCHEMES[0];
      const docText = getSchemeDetailVoice(targetScheme, "documents", detectedShortLang);
      const applyPrompt = {
        te: " దరఖాస్తు విధానం కూడా తెలుసుకోవాలా?",
        hi: " क्या आप आवेदन प्रक्रिया भी जानना चाहते हैं?",
        ta: " விண்ணப்பிக்கும் முறையையும் அறிய விரும்புகிறீர்களா?",
        en: " Would you also like to know how to apply?"
      };
      session.lastOffer = "apply_offer";
      finalResponse = {
        text: docText + (applyPrompt[detectedShortLang] || applyPrompt.en),
        language: activeTelephonyLang,
        isEndCall: false,
        intent: "scheme_documents",
        selectedScheme: targetScheme,
        recommendations: session.recommendations || [targetScheme]
      };
    }
    // Context 2: Prior assistant offer was to read application steps
    else if (session && session.lastOffer === "apply_offer") {
      const targetScheme = session.selectedScheme || SCHEMES[0];
      const applyText = getSchemeDetailVoice(targetScheme, "apply", detectedShortLang);
      session.lastOffer = null;
      finalResponse = {
        text: applyText,
        language: activeTelephonyLang,
        isEndCall: false,
        intent: "scheme_apply",
        selectedScheme: targetScheme,
        recommendations: session.recommendations || [targetScheme]
      };
    }
    // Context 3: In an active interview answering a binary question (e.g. land ownership)
    else if (session && session.interviewMode && session.profile && session.profile.lastQuestionAsked === "landOwner") {
      session.profile.landOwner = true;
      session.profile.lastQuestionAsked = null;
      const nextQ = getNextEligibilityQuestion(session.profile, detectedShortLang);
      if (nextQ) {
        session.profile.lastQuestionAsked = nextQ.field;
        finalResponse = {
          text: nextQ.text,
          language: activeTelephonyLang,
          isEndCall: false,
          intent: "eligibility_interview",
          profile: session.profile
        };
      } else {
        session.profile.interviewComplete = true;
        session.interviewMode = false;
        const recs = recommendSchemes(session.profile, SCHEMES);
        session.recommendations = recs;
        session.selectedScheme = recs[0];
        session.lastOffer = "documents_offer";
        const spokenText = formatSpokenRecommendation(recs, detectedShortLang);
        finalResponse = {
          text: spokenText,
          language: activeTelephonyLang,
          isEndCall: false,
          intent: "recommendation",
          recommendations: recs.slice(0, 4),
          profile: session.profile,
          selectedScheme: recs[0]
        };
      }
    }
    // Context 4: General confirmation or after a scheme offer ("Can I assist you with some schemes?" -> "Yes")
    else {
      if (session) {
        session.profile = session.profile || createEmptyProfile();
        session.interviewMode = true;
        session.lastOffer = null;
      }
      const nextQ = getNextEligibilityQuestion(session?.profile || createEmptyProfile(), detectedShortLang);
      if (nextQ) {
        if (session && session.profile) {
          session.profile.lastQuestionAsked = nextQ.field;
          session.profile.interviewStarted = true;
        }
        const confirmIntro = {
          te: `సరేనండి. ${nextQ.text}`,
          hi: `ज़रूर। ${nextQ.text}`,
          ta: `நிச்சயமாக. ${nextQ.text}`,
          en: `Sure. ${nextQ.text}`
        };
        finalResponse = {
          text: confirmIntro[detectedShortLang] || confirmIntro.en,
          language: activeTelephonyLang,
          isEndCall: false,
          intent: "eligibility_interview",
          profile: session?.profile
        };
      } else {
        const recs = recommendSchemes(session?.profile || {}, SCHEMES);
        if (session) {
          session.recommendations = recs;
          session.selectedScheme = recs[0];
          session.lastOffer = "documents_offer";
        }
        finalResponse = {
          text: formatSpokenRecommendation(recs, detectedShortLang),
          language: activeTelephonyLang,
          isEndCall: false,
          intent: "recommendation",
          recommendations: recs.slice(0, 4),
          profile: session?.profile,
          selectedScheme: recs[0]
        };
      }
    }
  }

  // 17. NEGATION / DECLINE ("No", "No thanks", "Vaddu", "Ledu", "Nahi", "వద్దు", "లేదు")
  else if (intent === "negation") {
    // If in an active interview answering landOwner question
    if (session && session.interviewMode && session.profile && session.profile.lastQuestionAsked === "landOwner") {
      session.profile.landOwner = false;
      session.profile.lastQuestionAsked = null;
      const nextQ = getNextEligibilityQuestion(session.profile, detectedShortLang);
      if (nextQ) {
        session.profile.lastQuestionAsked = nextQ.field;
        finalResponse = {
          text: nextQ.text,
          language: activeTelephonyLang,
          isEndCall: false,
          intent: "eligibility_interview",
          profile: session.profile
        };
      } else {
        session.profile.interviewComplete = true;
        session.interviewMode = false;
        const recs = recommendSchemes(session.profile, SCHEMES);
        session.recommendations = recs;
        session.selectedScheme = recs[0];
        session.lastOffer = "documents_offer";
        finalResponse = {
          text: formatSpokenRecommendation(recs, detectedShortLang),
          language: activeTelephonyLang,
          isEndCall: false,
          intent: "recommendation",
          recommendations: recs.slice(0, 4),
          profile: session.profile,
          selectedScheme: recs[0]
        };
      }
    } else {
      if (session) {
        session.interviewMode = false;
        session.lastOffer = null;
      }
      const politeDecline = {
        te: "సరేనండి. మీకు ఇతర ప్రభుత్వ పథకాలు లేదా సేవల గురించి ఏదైనా సమాచారం కావాలంటే అడగవచ్చు.",
        hi: "ठीक है जी। यदि आपको किसी अन्य सरकारी योजना या सेवा के बारे में जानकारी चाहिए, तो कृपया पूछें।",
        ta: "சரிங்க. வேறு ஏதேனும் அரசு திட்டம் அல்லது சேவை பற்றி தகவல் தேவைப்பட்டால் கேளுங்கள்.",
        en: "Sure. Please let me know if you need help with any other government scheme or service."
      };
      finalResponse = {
        text: politeDecline[detectedShortLang] || politeDecline.en,
        language: activeTelephonyLang,
        isEndCall: false,
        intent: "negation"
      };
    }
  }

  // 18. Conversational Eligibility Interview & Dynamic Profile Questioning
  if (!finalResponse) {
    if (session) {
      session.profile = extractProfileFromText(cleanSpeech, session.profile || {});
    }

    if (session && (intent === "eligibility_check" || (session.interviewMode && !["certificates", "housing", "health"].includes(intent)))) {
      const nextQ = getNextEligibilityQuestion(session.profile, detectedShortLang);
      if (nextQ) {
        session.profile.lastQuestionAsked = nextQ.field;
        session.interviewMode = true;
        session.lastOffer = null;
        finalResponse = {
          text: nextQ.text,
          language: activeTelephonyLang,
          isEndCall: false,
          intent: "eligibility_interview",
          profile: session.profile
        };
      } else {
        session.profile.interviewComplete = true;
        session.interviewMode = false;
        const recs = recommendSchemes(session.profile, SCHEMES);
        session.recommendations = recs;
        session.selectedScheme = recs[0];
        session.lastOffer = "documents_offer";
        const spokenText = formatSpokenRecommendation(recs, detectedShortLang);
        finalResponse = {
          text: spokenText,
          language: activeTelephonyLang,
          isEndCall: false,
          intent: "recommendation",
          recommendations: recs.slice(0, 4),
          profile: session.profile,
          selectedScheme: recs[0]
        };
      }
    }
  }

  // 19. Try LLM response (Groq/OpenAI) if available
  if (!finalResponse) {
    const llmResponse = await callLLMConversation(cleanSpeech, activeTelephonyLang, session);
    if (llmResponse) {
      finalResponse = {
        text: llmResponse,
        language: activeTelephonyLang,
        isEndCall: false,
        intent,
        slowPaced: false
      };
    }
  }

  // 20. Deterministic local scheme intelligence fallback
  if (!finalResponse) {
    const localRes = generateLocalPhoneResponse(intent, category, cleanSpeech, activeTelephonyLang, session);
    finalResponse = {
      text: localRes.text,
      language: activeTelephonyLang,
      isEndCall: false,
      intent,
      slowPaced: false,
      selectedScheme: localRes.selectedScheme || (session && session.selectedScheme) || null,
      recommendations: localRes.recommendations || (session && session.recommendations) || null
    };
  }

  // 21. GUARD AGAINST IDENTICAL CONSECUTIVE ASSISTANT RESPONSES
  let responseText = finalResponse.text;
  if (session && session.lastResponse && session.lastResponse.trim() === responseText.trim()) {
    const clarificationReplies = {
      te: "క్షమించండి, మీ ప్రశ్న సరిగ్గా అర్థం కాలేదు. మీరు పెన్షన్, రైతు పథకాలు, అవసరమైన డాక్యుమెంట్లు లేదా దరఖాస్తు విధానం గురించి అడగవచ్చు. మీకు ఏ సమాచారం కావాలి?",
      hi: "क्षमा करें, आपका प्रश्न ठीक से समझ नहीं आया। आप पेंशन, किसान योजना, दस्तावेज या आवेदन प्रक्रिया के बारे में पूछ सकते हैं। आपको क्या जानकारी चाहिए?",
      ta: "மன்னிக்கவும், உங்கள் கேள்வி தெளிவாக புரியவில்லை. ஓய்வூதியம், விவசாய திட்டம், ஆவணங்கள் அல்லது விண்ணப்ப முறை பற்றி நீங்கள் கேட்கலாம். என்ன உதவி வேண்டும்?",
      en: "I apologize, I didn't catch that clearly. You can ask about pensions, farmer schemes, required documents, or application steps. How can I help you?"
    };
    responseText = clarificationReplies[detectedShortLang] || clarificationReplies.en;
    finalResponse.text = responseText;
    session.lastOffer = "scheme_offer";
  }

  // 22. Save response into session memory
  if (session) {
    session.lastResponse = responseText;
  }

  return finalResponse;
}

export default {
  GREETINGS,
  identifyIntent,
  processPhoneSpeechTurn,
  generateLocalPhoneResponse
};
