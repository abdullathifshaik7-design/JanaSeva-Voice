// JanaSeva Voice - Conversational Eligibility Engine & Recommendation System
// Features: Natural Language & Code-Mixed Entity Extraction, Smart Question Flow,
// 3-Tier Rule Evaluation (Eligible / Possibly Eligible / Not Eligible),
// Profile Match Scoring, and Grounded Scheme Recommendations.

import { SCHEMES } from '../../src/data/db.js';

/**
 * Creates a blank or initialized temporary user profile
 */
export function createEmptyProfile(initial = {}) {
  return {
    age: initial.age ?? null,
    ageApproximate: Boolean(initial.ageApproximate),
    state: initial.state ?? null,
    occupation: initial.occupation ?? null, // 'farmer', 'student', 'senior_citizen', 'worker', 'employee', 'other'
    annualIncome: initial.annualIncome ?? null,
    category: initial.category ?? null, // 'general', 'sc', 'st', 'obc', 'minority'
    landOwner: initial.landOwner ?? null,
    houseOwner: initial.houseOwner ?? null,
    gender: initial.gender ?? null,
    interviewStarted: initial.interviewStarted ?? false,
    interviewComplete: initial.interviewComplete ?? false,
    lastQuestionAsked: initial.lastQuestionAsked ?? null
  };
}

/**
 * Extract entities from natural, code-mixed user utterances (Telugu, Hindi, English, Tanglish/Hinglish)
 */
export function extractProfileFromText(text, currentProfile = {}) {
  const profile = { ...createEmptyProfile(currentProfile) };
  if (!text || typeof text !== 'string') return profile;

  const lower = text.toLowerCase().trim();

  // 1. AGE EXTRACTION
  // Check for approximate signals
  if (/around|approx|maybe|దాదాపు|సుమారు|దగ్గర|लगभग|करीब/.test(lower)) {
    profile.ageApproximate = true;
  }

  // Look for age numbers: e.g. "65 years", "age 60", "60 years old", "65", "వయసు 60"
  const ageMatch = lower.match(/(?:age|వయస్సు|వయసు|ఉమ్ర|उम्र|age is|i am)?\s*(\d{1,3})\s*(?:years?|yrs?|ఏళ్లు|సంవత్సరాలు|साल|years old)?/);
  if (ageMatch && ageMatch[1]) {
    const parsedAge = parseInt(ageMatch[1], 10);
    // Sanity check for human age
    if (parsedAge >= 5 && parsedAge <= 115) {
      profile.age = parsedAge;
      if (parsedAge >= 60 && !profile.occupation) {
        profile.occupation = 'senior_citizen';
      }
    }
  }

  // 2. STATE EXTRACTION
  if (/andhra|ap|ఆంధ్ర|ఆంధ్రప్రదేశ్|amaravati|vizag|vijayawada|rayalaseema/.test(lower)) {
    profile.state = 'Andhra Pradesh';
  } else if (/telangana|tg|తెలంగాణ|hyderabad|warangal/.test(lower)) {
    profile.state = 'Telangana';
  } else if (/tamil|tamil nadu|tn|தமிழ்நாடு|chennai/.test(lower)) {
    profile.state = 'Tamil Nadu';
  } else if (/karnataka|bangalore|bengaluru|కర్ణాటక/.test(lower)) {
    profile.state = 'Karnataka';
  } else if (/delhi|दिल्ली/.test(lower)) {
    profile.state = 'Delhi';
  } else if (/uttar pradesh|up|उत्तर प्रदेश/.test(lower)) {
    profile.state = 'Uttar Pradesh';
  }

  // 3. OCCUPATION EXTRACTION
  if (/farmer|farming|rythu|vyavasayam|రైతు|వ్యవసాయం|kisan|kheti|किसान|खेती|விவசாயி|crop|land/.test(lower)) {
    profile.occupation = 'farmer';
  } else if (/student|college|chaduvukuntunna|chaduvu|విద్యార్థి|చదువు|छात्र|पढ़ाई|school|degree|btech|inter/.test(lower)) {
    profile.occupation = 'student';
  } else if (/senior|senior citizen|retired|old age|vruddha|vrudhapyam|వృద్ధాప్యం|వృద్ధులు|బుజుర్గ్|बुजुर्ग|வயதானவர்|pensioner/.test(lower)) {
    profile.occupation = 'senior_citizen';
  } else if (/worker|coolie|daily wage|labor|laborer|కూలీ|ఉపాధి|ఉపాధి హామీ|मजदूर|வேலை|daily work/.test(lower)) {
    profile.occupation = 'worker';
  } else if (/employee|private job|govt job|ఉద్యోగం|नौकरी|salaried|company/.test(lower)) {
    profile.occupation = 'employee';
  }

  // 4. ANNUAL INCOME EXTRACTION
  // Handles: "1 lakh", "100000", "2 lakhs", "50 thousand", "zero income", "rendu lakshalu", "oka laksha"
  if (/zero|nil|no income|leedu|లేదు|లేవు|ఏమీ లేదు|कुछ नहीं|\b0\b/.test(lower) && (profile.lastQuestionAsked === 'income' || /income|aadhayam|ఆదాయం|आय/.test(lower))) {
    profile.annualIncome = 0;
  } else if (/1\.?5\s*lakh|one and half lakh|ఒకటిన్నర లక్ష/.test(lower)) {
    profile.annualIncome = 150000;
  } else if (/1\s*lakh|one lakh|oka laksha|ఒక లక్ష|ek lakh|एक लाख|100000|1,00,000/.test(lower)) {
    profile.annualIncome = 100000;
  } else if (/2\s*lakh|two lakh|rendu lakshalu|రెండు లక్షలు|do lakh|दो लाख|200000|2,00,000/.test(lower)) {
    profile.annualIncome = 200000;
  } else if (/3\s*lakh|three lakh|moodu lakshalu|మూడు లక్షలు|teen lakh|तीन लाख|300000/.test(lower)) {
    profile.annualIncome = 300000;
  } else if (/50\s*thousand|యాభై వేలు|50000|50,000|पचास हजार/.test(lower)) {
    profile.annualIncome = 50000;
  } else if (/75\s*thousand|75000|దెబ్బై ఐదు వేలు/.test(lower)) {
    profile.annualIncome = 75000;
  } else {
    // Check general numeric pattern if asked income
    const numericIncome = lower.match(/(?:income|ఆదాయం|आय)?\s*(\d{4,7})/);
    if (numericIncome && numericIncome[1]) {
      profile.annualIncome = parseInt(numericIncome[1], 10);
    }
  }

  // 5. LAND OWNERSHIP
  if (/sontha bhoomi|own land|భూమి ఉంది|जमीन है|nilam irukku|land owner|pattadar/.test(lower)) {
    profile.landOwner = true;
  } else if (/kaulu|tenant|no land|భూమి లేదు|जमीन नहीं|కౌలు రైతు/.test(lower)) {
    profile.landOwner = false;
  }

  // 6. HOUSE OWNERSHIP
  if (/rented|no house|sontha illu ledu|ఇల్లు లేదు|किराए|झोपड़ी|మట్టి ఇల్లు/.test(lower)) {
    profile.houseOwner = false;
  } else if (/own house|pakka house|సొంత ఇల్లు ఉంది|पक्का मकान/.test(lower)) {
    profile.houseOwner = true;
  }

  return profile;
}

/**
 * Smart Question Flow: dynamically determines the next question to ask
 * Only asks what is essential to evaluate government welfare schemes.
 */
export function getNextEligibilityQuestion(profile, langCode = 'te') {
  const lang = langCode?.startsWith('hi') ? 'hi' : langCode?.startsWith('en') ? 'en' : 'te';

  // 1. If Age is missing
  if (profile.age === null) {
    const questions = {
      te: 'నమస్కారం! మీ కోసం సరిపోయే ప్రభుత్వ పథకాలు తెలుసుకుందాం. మీ వయస్సు ఎంత?',
      hi: 'नमस्ते! आपके लिए उपयुक्त सरकारी योजनाएँ जानने के लिए, आपकी उम्र कितनी है?',
      en: 'Namaskaram! Let us find suitable government schemes for you. What is your age?'
    };
    return {
      field: 'age',
      text: questions[lang] || questions.en
    };
  }

  // 2. If State is missing
  if (profile.state === null) {
    const questions = {
      te: 'మీది ఏ రాష్ట్రం? ఉదాహరణకు ఆంధ్రప్రదేశ్ లేదా తెలంగాణ?',
      hi: 'आपका राज्य कौन सा है? जैसे आंध्र प्रदेश या अन्य?',
      en: 'Which state do you reside in, for example Andhra Pradesh or Telangana?'
    };
    return {
      field: 'state',
      text: questions[lang] || questions.en
    };
  }

  // 3. If Occupation is missing
  if (profile.occupation === null) {
    const questions = {
      te: 'మీరు రైతు, విద్యార్థి, వృద్ధులు లేక ఇతర పనులు చేస్తున్నారా?',
      hi: 'क्या आप किसान, छात्र, वरिष्ठ नागरिक या कोई अन्य कार्य करते हैं?',
      en: 'Are you a farmer, student, senior citizen, or working in another field?'
    };
    return {
      field: 'occupation',
      text: questions[lang] || questions.en
    };
  }

  // 4. If Income is missing
  if (profile.annualIncome === null) {
    const questions = {
      te: 'మీ కుటుంబ వార్షిక ఆదాయం సుమారుగా ఎంత?',
      hi: 'आपकी पारिवारिक वार्षिक आय लगभग कितनी है?',
      en: 'Approximately what is your annual household income?'
    };
    return {
      field: 'income',
      text: questions[lang] || questions.en
    };
  }

  // 5. Contextual follow-up only if relevant:
  // If farmer and land ownership is unknown
  if (profile.occupation === 'farmer' && profile.landOwner === null) {
    const questions = {
      te: 'మీకు సొంత వ్యవసాయ భూమి ఉందా లేదా కౌలు రైతుగా చేస్తున్నారా?',
      hi: 'क्या आपके पास अपनी खेती की जमीन है या आप पट्टेदार किसान हैं?',
      en: 'Do you own cultivable agricultural land, or are you a tenant farmer?'
    };
    return {
      field: 'landOwner',
      text: questions[lang] || questions.en
    };
  }

  // All primary questions answered
  return null;
}

/**
 * Check eligibility for a single scheme against user profile
 */
export function evaluateSchemeEligibility(scheme, profile) {
  const rules = scheme.eligibilityRules || {};
  let conflicts = 0;
  let missingCriteria = 0;
  let positiveMatches = 0;
  const reasons = [];

  // 1. AGE CHECK
  if (rules.minAge !== undefined && rules.minAge !== null) {
    if (profile.age !== null) {
      if (profile.age < rules.minAge) {
        conflicts++;
        reasons.push(`Minimum age required is ${rules.minAge} years (provided: ${profile.age})`);
      } else {
        positiveMatches++;
      }
    } else {
      missingCriteria++;
    }
  }

  if (rules.maxAge !== undefined && rules.maxAge !== null) {
    if (profile.age !== null) {
      if (profile.age > rules.maxAge) {
        conflicts++;
        reasons.push(`Maximum age limit is ${rules.maxAge} years (provided: ${profile.age})`);
      } else {
        positiveMatches++;
      }
    } else {
      missingCriteria++;
    }
  }

  // 2. STATE CHECK
  if (rules.states && Array.isArray(rules.states)) {
    if (profile.state !== null) {
      const stateMatch = rules.states.some(s => 
        s.toLowerCase() === profile.state.toLowerCase() ||
        (profile.state.toLowerCase().includes('andhra') && s === 'AP')
      );
      if (!stateMatch) {
        conflicts++;
        reasons.push(`Scheme is specific to ${rules.states.join(', ')} (provided: ${profile.state})`);
      } else {
        positiveMatches++;
      }
    } else {
      missingCriteria++;
    }
  }

  // 3. OCCUPATION CHECK
  if (rules.occupations && Array.isArray(rules.occupations)) {
    if (!rules.occupations.includes('any')) {
      if (profile.occupation !== null) {
        let occMatch = rules.occupations.includes(profile.occupation);
        // Senior citizen can be matched with old age pension
        if (profile.occupation === 'senior_citizen' && (rules.occupations.includes('senior_citizen') || (rules.minAge && rules.minAge >= 60))) {
          occMatch = true;
        }
        if (!occMatch) {
          conflicts++;
          reasons.push(`Targeted for ${rules.occupations.join(', ')} (provided: ${profile.occupation})`);
        } else {
          positiveMatches++;
        }
      } else {
        missingCriteria++;
      }
    } else {
      positiveMatches++;
    }
  }

  // 4. INCOME CHECK
  if (rules.maxIncome !== undefined && rules.maxIncome !== null) {
    if (profile.annualIncome !== null) {
      if (profile.annualIncome > rules.maxIncome) {
        conflicts++;
        reasons.push(`Annual income must be below ₹${rules.maxIncome.toLocaleString('en-IN')} (provided: ₹${profile.annualIncome.toLocaleString('en-IN')})`);
      } else {
        positiveMatches++;
      }
    } else {
      missingCriteria++;
    }
  }

  // 5. LAND OWNERSHIP CHECK (e.g. PM-KISAN requires land)
  if (rules.requiresLand === true) {
    if (profile.landOwner === false) {
      conflicts++;
      reasons.push('Requires cultivable agricultural land ownership in applicant name');
    } else if (profile.landOwner === true) {
      positiveMatches++;
    } else {
      missingCriteria++;
    }
  }

  // 6. HOUSE OWNERSHIP (e.g. PMAY requires no other pucca house)
  if (rules.requiresHouseOwner === false) {
    if (profile.houseOwner === true) {
      conflicts++;
      reasons.push('Requires applicant family to not own an existing pucca house');
    } else if (profile.houseOwner === false) {
      positiveMatches++;
    } else {
      missingCriteria++;
    }
  }

  // 7. GENDER CHECK (e.g. Sukanya Samriddhi)
  if (rules.targetGender) {
    if (profile.gender && profile.gender !== rules.targetGender) {
      conflicts++;
      reasons.push(`Targeted for ${rules.targetGender} beneficiaries`);
    }
  }

  // DECISION & MATCH SCORE CALCULATION
  let status = 'possibly_eligible';
  let statusLabel = '⚠️ Possibly eligible';
  let matchScore = 65;

  if (conflicts > 0) {
    status = 'not_eligible';
    statusLabel = '❌ Not eligible';
    matchScore = Math.max(15, Math.round(30 - conflicts * 10));
  } else if ((missingCriteria === 0 && positiveMatches > 0) || (positiveMatches >= 2 && missingCriteria <= 1)) {
    status = 'eligible';
    statusLabel = '✅ Eligible';
    // Score based on how many criteria matched strongly
    matchScore = Math.min(98, 84 + positiveMatches * 3);
  } else {
    // Missing some details, but no conflicts
    status = 'possibly_eligible';
    statusLabel = '⚠️ Possibly eligible';
    matchScore = Math.min(78, 55 + positiveMatches * 5);
  }

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    category: scheme.category,
    status,
    statusLabel,
    matchScore,
    scoreLabel: `${matchScore}% — ${status === 'eligible' ? 'Strong match' : status === 'possibly_eligible' ? 'Possible match' : 'Low match'}`,
    reasons,
    officialWebsite: scheme.officialWebsite || scheme.applicationUrl || 'Official source not verified.',
    officialSource: scheme.officialSource || 'Official source not verified.',
    lastVerified: scheme.lastVerified ? `Verification date: ${scheme.lastVerified}` : 'Verification date not available.',
    applicationUrl: scheme.applicationUrl || scheme.officialWebsite || null,
    benefits: scheme.benefits,
    eligibility: scheme.eligibility,
    requiredDocuments: scheme.requiredDocuments || [],
    applicationSteps: scheme.applicationSteps || []
  };
}

/**
 * Recommend and rank schemes based on user profile
 */
export function recommendSchemes(profile, schemesList = SCHEMES) {
  const evaluations = schemesList.map(scheme => ({
    ...evaluateSchemeEligibility(scheme, profile),
    rawScheme: scheme
  }));

  // Rank: eligible first (descending score), then possibly_eligible (descending score), then not_eligible
  evaluations.sort((a, b) => {
    const statusWeight = { eligible: 3, possibly_eligible: 2, not_eligible: 1 };
    if (statusWeight[b.status] !== statusWeight[a.status]) {
      return statusWeight[b.status] - statusWeight[a.status];
    }
    return b.matchScore - a.matchScore;
  });

  return evaluations;
}

/**
 * Generate natural localized voice output summarizing recommended schemes
 */
export function formatSpokenRecommendation(topSchemes, langCode = 'te') {
  const lang = langCode?.startsWith('hi') ? 'hi' : langCode?.startsWith('en') ? 'en' : 'te';
  if (!topSchemes || topSchemes.length === 0) {
    const emptyMsg = {
      te: 'మీ సమాచారానికి తగిన పథకాలు ప్రస్తుతానికి అందుబాటులో లేవు.',
      hi: 'आपकी जानकारी के अनुसार अभी कोई योजना उपलब्ध नहीं है।',
      en: 'No matching schemes found for this profile at the moment.'
    };
    return emptyMsg[lang] || emptyMsg.en;
  }

  const eligibleOnes = topSchemes.filter(s => s.status === 'eligible');
  const possibleOnes = topSchemes.filter(s => s.status === 'possibly_eligible');
  const primaryOnes = (eligibleOnes.length > 0 ? eligibleOnes : possibleOnes).slice(0, 2);

  if (lang === 'te') {
    const names = primaryOnes.map(s => s.schemeName).join(', ');
    return `జనసేవ ప్రొఫైల్ మ్యాచ్ ప్రకారం మీకు ముఖ్యమైన పథకాలు: ${names}. మీరు అర్హులుగా కనిపిస్తున్నారు. పూర్తి వివరాలు, అవసరమైన డాక్యుమెంట్లు మరియు దరఖాస్తు లింక్ స్క్రీన్ మీద చూడవచ్చు. తుది అర్హతను ప్రభుత్వ శాఖ నిర్ణయిస్తుంది. దేని వివరాలు కావాలి?`;
  } else if (lang === 'hi') {
    const names = primaryOnes.map(s => s.schemeName).join(', ');
    return `जनसेवा प्रोफाइल मैच के अनुसार आपके लिए मुख्य योजनाएं हैं: ${names}। आप पात्र प्रतीत होते हैं। आवश्यक दस्तावेज और आवेदन प्रक्रिया स्क्रीन पर दिखाई दे रही है। अंतिम पात्रता सरकारी विभाग द्वारा निर्धारित की जाएगी। आप किस योजना की जानकारी चाहते हैं?`;
  } else {
    const names = primaryOnes.map(s => s.schemeName).join(', ');
    return `Based on your JanaSeva profile match, top recommended schemes are: ${names}. You appear eligible. Required documents and official application links are displayed on your screen. Final approval is determined by the official department. Which scheme details would you like to hear?`;
  }
}

/**
 * Handle voice inquiries regarding specific scheme details (benefits, documents, apply)
 */
export function getSchemeDetailVoice(scheme, detailType = 'summary', langCode = 'te') {
  const lang = langCode?.startsWith('hi') ? 'hi' : langCode?.startsWith('en') ? 'en' : 'te';
  
  if (!scheme) {
    return lang === 'te' 
      ? 'ఆ పథకం వివరాలు లభించలేదు. దయచేసి పథకం పేరు మళ్లీ చెప్పండి.'
      : lang === 'hi'
      ? 'उस योजना का विवरण नहीं मिला। कृपया योजना का नाम दोबारा कहें।'
      : 'Details for that scheme were not found. Please state the scheme name again.';
  }

  if (detailType === 'documents') {
    const docs = scheme.requiredDocuments?.join(', ') || 'Aadhaar Card, Bank Account Details';
    if (lang === 'te') {
      return `${scheme.schemeName || scheme.name} కోసం అవసరమైన డాక్యుమెంట్లు: ${docs}. స్క్రీన్ మీద కూడా ఈ జాబితా కనిపిస్తోంది.`;
    } else if (lang === 'hi') {
      return `${scheme.schemeName || scheme.name} के लिए आवश्यक दस्तावेज हैं: ${docs}। यह सूची आपकी स्क्रीन पर भी है।`;
    } else {
      return `Required documents for ${scheme.schemeName || scheme.name} are: ${docs}. The full list is also displayed on your screen.`;
    }
  }

  if (detailType === 'apply') {
    const steps = scheme.applicationSteps?.slice(0, 2).join(' ') || 'Apply through the official portal or your local Citizen Service Center.';
    const source = scheme.officialWebsite || 'the official portal';
    if (lang === 'te') {
      return `దరఖాస్తు విధానం: ${steps}. మీరు అధికారిక వెబ్‌సైట్ ${source} ద్వారా నేరుగా దరఖాస్తు చేసుకోవచ్చు.`;
    } else if (lang === 'hi') {
      return `आवेदन प्रक्रिया: ${steps}। आप आधिकारिक पोर्टल ${source} पर जाकर आवेदन कर सकते हैं।`;
    } else {
      return `How to apply: ${steps} You can apply directly on the official portal at ${source}.`;
    }
  }

  // Default summary
  const benefits = scheme.benefits || 'Financial assistance and welfare benefits.';
  if (lang === 'te') {
    return `${scheme.schemeName || scheme.name}: ఈ పథకం ద్వారా ${benefits}. అర్హత మరియు దరఖాస్తు వివరాలు స్క్రీన్ మీద చూడవచ్చు.`;
  } else if (lang === 'hi') {
    return `${scheme.schemeName || scheme.name}: इस योजना से ${benefits} मिलता है। पात्रता और आवेदन के विवरण स्क्रीन पर देखे जा सकते हैं।`;
  } else {
    return `${scheme.schemeName || scheme.name}: This scheme provides ${benefits}. Complete eligibility and application steps are shown on your screen.`;
  }
}
