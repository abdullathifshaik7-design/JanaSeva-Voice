// Scalable Multilingual database for schemes, services, certificates, and centers

export const STATES = [
  "National / Central",
  "Andhra Pradesh",
  "Telangana",
  "Tamil Nadu",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Delhi",
  "Gujarat",
  "Uttar Pradesh"
];

export const CATEGORIES = [
  { id: "identity", label: "Identity & Documents", emoji: "🪪", desc: "Aadhaar, PAN, Voter Card, Birth/Caste certificates" },
  { id: "food", label: "Food & Essential Services", emoji: "🌾", desc: "Ration Card, Food Security, PDS correction" },
  { id: "pension", label: "Pension & Senior Citizens", emoji: "👵", desc: "Old age pension, Widow pension, Disability benefits" },
  { id: "farmers", label: "Farmers & Agriculture", emoji: "🌱", desc: "Agricultural subsidies, Crop insurance, PM-KISAN" },
  { id: "education", label: "Education & Scholarships", emoji: "🎓", desc: "Scholarships, Hostel fees, Student schemes" },
  { id: "health", label: "Health & Medical", emoji: "🏥", desc: "Ayushman Bharat, Maternal health, Health cards" },
  { id: "housing", label: "Housing & Land", emoji: "🏠", desc: "Housing assistance, PMAY Rural/Urban" },
  { id: "employment", label: "Employment & Skills", emoji: "💼", desc: "MGNREGA, Skill training, Registration" },
  { id: "women", label: "Women & Children", emoji: "👩", desc: "Maternal assistance, Girl-child welfare, nutrition" },
  { id: "welfare", label: "Financial & Social Welfare", emoji: "💰", desc: "Direct benefit transfer (DBT), financial aid" },
  { id: "transport", label: "Transport & Driving", emoji: "🚗", desc: "Driving License, Vehicle services, Bus passes" },
  { id: "problems", label: "Problem Reports & Complaints", emoji: "📢", desc: "Public complaints, civic tracking, escalation" }
];

export const SCHEMES = [
  {
    id: "pm-kisan",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    alternateNames: ["PM Kisan", "రైతు భరోసా", "पीएम किसान", "किसान सम्मान निधि"],
    department: "Ministry of Agriculture and Farmers Welfare",
    governmentLevel: "Central",
    state: null,
    category: "farmers",
    targetGroups: ["Farmers", "Landowners"],
    description: "An initiative by the government of India that provides up to ₹6,000 per year in three equal installments to small and marginal farmer families.",
    benefits: "₹6,000 per year, direct bank transfer in three equal installments of ₹2,000 every 4 months.",
    eligibility: "Landholding farmer families with cultivable landholding in their names. Excludes institutional land holders, government employees, and income tax payers.",
    ageCriteria: { min: 18, max: 100 },
    incomeCriteria: { max: 200000 },
    requiredDocuments: ["Aadhaar Card", "Land Ownership Documents (Pattadar Passbook)", "Bank Account Details", "Mobile Number linked with Aadhaar"],
    applicationSteps: [
      "Open the official PM-KISAN portal (pmkisan.gov.in).",
      "Click on 'New Farmer Registration' under the Farmers Corner.",
      "Enter Aadhaar number and select state, then fill the registration form.",
      "Upload land records and bank details.",
      "Submit application and note down the temporary registration ID."
    ],
    applicationMode: "Both",
    officialWebsite: "https://pmkisan.gov.in",
    applicationUrl: "https://pmkisan.gov.in",
    officialSource: "Ministry of Agriculture and Farmers Welfare, Govt of India",
    helpline: "155261 / 1800115526",
    lastVerified: "2026-06-15",
    languages: ["en", "te", "hi", "ta"],
    status: "Active",
    eligibilityRules: {
      minAge: 18,
      maxAge: null,
      occupations: ["farmer"],
      maxIncome: 200000,
      requiresLand: true,
      states: null
    },
    simpleExplanation: {
      en: "The government will send ₹2,000 directly to your bank account every four months (total ₹6,000 a year) to help you buy seeds, fertilizers, and farm needs. You must own farming land to apply.",
      te: "ప్రభుత్వం మీకు ప్రతి నాలుగు నెలలకు ₹2,000 చొప్పున (సంవత్సరానికి ₹6,000) నేరుగా బ్యాంకు ఖాతాలో వేస్తుంది. విత్తనాలు, ఎరువుల కొనుగోలుకు ఇది సహాయపడుతుంది. సొంత వ్యవసాయ భూమి ఉన్నవారు అర్హులు.",
      hi: "सरकार हर चार महीने में ₹2,000 (सालाना ₹6,000) सीधे आपके बैंक खाते में भेजेगी ताकि आप खाद-बीज खरीद सकें। आपके नाम खेती की जमीन होनी चाहिए।",
      ta: "அரசு நான்கு மாதங்களுக்கு ஒருமுறை ₹2,000 (வருடத்திற்கு ₹6,000) நேரடியாக உங்கள் வங்கி கணக்கில் செலுத்தும். சொந்த விவசாய நிலம் வைத்திருப்பவர்கள் விண்ணப்பிக்கலாம்."
    }
  },
  {
    id: "ap-rythu-bharosa",
    name: "YSR Rythu Bharosa",
    alternateNames: ["Rythu Bharosa AP", "రైతు భరోసా", "రాష్ట్ర రైతు సహాయం"],
    department: "Department of Agriculture, Andhra Pradesh",
    governmentLevel: "State",
    state: "Andhra Pradesh",
    category: "farmers",
    targetGroups: ["Farmers", "Tenant Farmers"],
    description: "Financial assistance program for farmers in Andhra Pradesh, combining state support with PM-KISAN to maximize credit support.",
    benefits: "Financial assistance of ₹13,500 per year per farmer family, including tenant farmers.",
    eligibility: "Farmers owning land in Andhra Pradesh, or registered SC/ST/OBC/Minority tenant farmers.",
    ageCriteria: { min: 18, max: 100 },
    incomeCriteria: null,
    requiredDocuments: ["Aadhaar Card", "Pattadar Passbook / Tenant Agreement", "Bank Account Passbook", "Caste Certificate (for tenant farmers)"],
    applicationSteps: [
      "Visit the local Rythu Bharosa Kendra (RBK) or Ward/Village Sachivalayam.",
      "Submit land details and bank account confirmation.",
      "Agriculture officer verifies details via land registry (Mee Bhoomi).",
      "Approved beneficiaries receive payment directly to bank."
    ],
    applicationMode: "Offline",
    officialWebsite: "https://ysrrythubharosa.ap.gov.in",
    applicationUrl: "https://ysrrythubharosa.ap.gov.in",
    officialSource: "Government of Andhra Pradesh",
    helpline: "1902",
    lastVerified: "2026-05-10",
    languages: ["en", "te"],
    status: "Active",
    eligibilityRules: {
      minAge: 18,
      maxAge: null,
      occupations: ["farmer", "tenant_farmer"],
      maxIncome: null,
      requiresLand: false,
      states: ["Andhra Pradesh", "AP"]
    },
    simpleExplanation: {
      en: "Andhra Pradesh farmers receive ₹13,500 every year in three installments for crop investment. Even tenant farmers are eligible if registered properly.",
      te: "ఆంధ్రప్రదేశ్ రైతులకు పంట పెట్టుబడి కోసం ప్రతి సంవత్సరం మూడు విడతలలో ₹13,500 ఇస్తారు. కౌలు రైతులు కూడా దీనికి అర్హులు.",
      hi: "आंध्र प्रदेश के किसानों को फसल निवेश के लिए हर साल ₹13,500 तीन किश्तों में दिए जाते हैं। पट्टेदार किसान भी इसके पात्र हैं।",
      ta: "ஆந்திரப் பிரதேச விவசாயிகளுக்கு பயிர் முதலீட்டிற்காக ஒவ்வொரு ஆண்டும் மூன்று தவணைகளில் ₹13,500 வழங்கப்படுகிறது."
    }
  },
  {
    id: "old-age-pension-national",
    name: "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
    alternateNames: ["Old Age Pension", "వృద్ధాప్య పెన్షన్", "वृद्धावस्था पेंशन", "முதியோர் ஓய்வூதியம்"],
    department: "Ministry of Rural Development",
    governmentLevel: "Central",
    state: null,
    category: "pension",
    targetGroups: ["Senior Citizens", "BPL Families"],
    description: "National pension scheme providing monthly financial aid to elderly citizens belonging to Below Poverty Line (BPL) households.",
    benefits: "Monthly pension of ₹200 to ₹500 depending on age (state contributions are added on top of this).",
    eligibility: "Age must be 60 years or above. Applicant must belong to a BPL household.",
    ageCriteria: { min: 60, max: 120 },
    incomeCriteria: { max: 120000 },
    requiredDocuments: ["Age Proof (Aadhaar/School Certificate)", "BPL Ration Card", "Bank Account Details", "Passport Photograph"],
    applicationSteps: [
      "Obtain application form from local Gram Panchayat or Municipality office.",
      "Fill details and attach BPL card copy & age proof.",
      "Submit application to Block Development Officer (BDO) or Social Welfare Officer.",
      "Verification officer reviews applicant status at residence."
    ],
    applicationMode: "Both",
    officialWebsite: "https://nsap.nic.in",
    applicationUrl: "https://nsap.nic.in",
    officialSource: "National Social Assistance Programme",
    helpline: "1800-11-1902",
    lastVerified: "2026-07-01",
    languages: ["en", "te", "hi", "ta"],
    status: "Active",
    eligibilityRules: {
      minAge: 60,
      maxAge: 120,
      occupations: ["senior_citizen", "retired", "any"],
      maxIncome: 120000,
      states: null
    },
    simpleExplanation: {
      en: "Senior citizens aged 60+ from BPL households receive a monthly cash pension directly in their accounts to help pay for medicines and personal needs.",
      te: "దారిద్ర్య రేఖకు దిగువన ఉన్న 60 సంవత్సరాలు పైబడిన వృద్ధులకు ప్రతి నెలా కొంత ఆర్థిక సహాయం లభిస్తుంది. మందులు మరియు ఇతర అవసరాలకు ఇది ఉపయోగపడుతుంది.",
      hi: "60 वर्ष से अधिक आयु के गरीब बुजुर्गों को हर महीने एक निश्चित पेंशन राशि दी जाती है, जिससे वे अपनी दवाइयों और अन्य जरूरतों का खर्च उठा सकें।",
      ta: "வறுமைக் கோட்டிற்கு கீழ் உள்ள 60 வயதுக்கு மேற்பட்ட முதியவர்களுக்கு மாதாந்திர ஓய்வூதியம் வழங்கப்படுகிறது."
    }
  },
  {
    id: "ybr-ntr-pension-ap",
    name: "NTR Bharosa Pension Scheme (AP)",
    alternateNames: ["NTR Bharosa", "AP Old Age Pension", "ఆంధ్రప్రదేశ్ వృద్ధాప్య పెన్షన్"],
    department: "Society for Elimination of Rural Poverty, AP",
    governmentLevel: "State",
    state: "Andhra Pradesh",
    category: "pension",
    targetGroups: ["Senior Citizens", "Widows", "Disabled Citizens"],
    description: "State social security pension scheme providing robust monthly support to elderly citizens, widows, single women, weavers, and disabled individuals.",
    benefits: "₹4,000 per month for Senior Citizens and Widows. Up to ₹6,000 per month for disabled individuals.",
    eligibility: "Resident of Andhra Pradesh. Age 60+ for Old Age Pension. White Ration Card holder.",
    ageCriteria: { min: 60, max: 120 },
    incomeCriteria: { max: 144000 },
    requiredDocuments: ["Aadhaar Card", "White Ration Card", "Bank Account Copy", "Age Proof (Voter ID/Birth Certificate)"],
    applicationSteps: [
      "Apply through Village/Ward Sachivalayam or online on Gram Ward Sachivalayam portal.",
      "Submit Aadhaar, age proof, and white ration card.",
      "The Welfare and Education Assistant verifies details at your home.",
      "Pension is approved by Municipal Commissioner or MPDO.",
      "Volunteer delivers pension directly to home on the 1st of every month."
    ],
    applicationMode: "Both",
    officialWebsite: "https://sspensions.ap.gov.in",
    applicationUrl: "https://sspensions.ap.gov.in",
    officialSource: "Government of Andhra Pradesh",
    helpline: "1902",
    lastVerified: "2026-08-01",
    languages: ["en", "te"],
    status: "Active",
    eligibilityRules: {
      minAge: 60,
      maxAge: 120,
      occupations: ["senior_citizen", "retired", "any"],
      maxIncome: 144000,
      states: ["Andhra Pradesh", "AP"]
    },
    simpleExplanation: {
      en: "Elderly people in Andhra Pradesh receive ₹4,000 every month delivered straight to their doorstep by village volunteers. White ration card is mandatory.",
      te: "ఆంధ్రప్రదేశ్‌లోని వృద్ధులకు ప్రభుత్వం నెలకు ₹4,000 పెన్షన్ ఇస్తుంది. వాలంటీర్ ప్రతి నెలా ఒకటో తేదీన నేరుగా మీ ఇంటికే వచ్చి ఈ డబ్బు అందజేస్తారు.",
      hi: "आंध्र प्रदेश में बुजुर्गों को हर महीने ₹4,000 की पेंशन दी जाती है, जो सीधे उनके घर तक पहुंचाई जाती है। सफेद राशन कार्ड होना आवश्यक है।",
      ta: "ஆந்திரப் பிரதேசத்தில் முதியவர்களுக்கு மாதம் ₹4,000 ஓய்வூதியம் வழங்கப்படுகிறது."
    }
  },
  {
    id: "post-matric-scholarship",
    name: "Post Matric Scholarship Scheme",
    alternateNames: ["Student Scholarship", "విద్యార్థి స్కాలర్షిప్", "छात्रवृत्ति", "கல்வி உதவித்தொகை"],
    department: "Ministry of Social Justice and Empowerment",
    governmentLevel: "Central",
    state: null,
    category: "education",
    targetGroups: ["Students", "SC", "ST", "OBC"],
    description: "Financial assistance to students belonging to scheduled castes, tribes, and other backward classes to pursue higher education after Grade 10.",
    benefits: "100% tuition fees reimbursement and monthly maintenance allowance up to ₹1,200 depending on course.",
    eligibility: "SC/ST/OBC students enrolled in recognized colleges. Family annual income must be below ₹2.5 Lakhs.",
    ageCriteria: { min: 15, max: 30 },
    incomeCriteria: { max: 250000 },
    requiredDocuments: ["Caste Certificate", "Income Certificate (issued by Tehsildar)", "Previous Class Marksheet", "Aadhaar Card", "Fee Receipt / Admission Letter"],
    applicationSteps: [
      "Register on National Scholarship Portal (scholarships.gov.in).",
      "Login, fill out demographic profile, and choose the Post-Matric scheme.",
      "Upload certificate copies, marksheets, and bank details.",
      "Submit application and forward it to college node for institute verification."
    ],
    applicationMode: "Online",
    officialWebsite: "https://scholarships.gov.in",
    applicationUrl: "https://scholarships.gov.in",
    officialSource: "Govt of India Scholarship Portal",
    helpline: "0120-6619540",
    lastVerified: "2026-08-10",
    languages: ["en", "te", "hi", "ta"],
    status: "Active",
    eligibilityRules: {
      minAge: 15,
      maxAge: 30,
      occupations: ["student"],
      maxIncome: 250000,
      states: null
    },
    simpleExplanation: {
      en: "This pays for your college tuition fees and gives you a monthly allowance for books/hostel if your family income is low and you belong to SC/ST/OBC/EWS.",
      te: "పదవ తరగతి పూర్తి చేసి పై చదువులు చదివే పేద విద్యార్థులకు కాలేజీ ఫీజు రియంబర్స్‌మెంట్ లభిస్తుంది మరియు పుస్తకాల కొనుగోలుకు నెలవారీ అలవెన్స్ లభిస్తుంది.",
      hi: "कक्षा 10वीं के बाद कॉलेज की पढ़ाई के लिए सरकार आपकी फीस माफ करेगी और हॉस्टल/किताबों का खर्च देगी, बशर्ते परिवार की सालाना आय 2.5 लाख से कम हो।",
      ta: "பத்தாம் வகுப்பு முடித்து உயர்கல்வி படிக்கும் மாணவர்களுக்கு கல்லூரி கல்வி கட்டணத்தை அரசு திருப்பி அளிக்கிறது."
    }
  },
  {
    id: "ayushman-bharat-pmjay",
    name: "Ayushman Bharat - PMJAY",
    alternateNames: ["PMJAY Health Card", "ఆరోగ్య కార్డ్", "आयुष्मान भारत", "ஹெல்த் கார்டு"],
    department: "National Health Authority",
    governmentLevel: "Central",
    state: null,
    category: "health",
    targetGroups: ["All Poor Families", "Rural & Urban Workers"],
    description: "The world's largest government-funded healthcare scheme, providing cashless medical treatment to poor and vulnerable families.",
    benefits: "Free health coverage of up to ₹5,000,000 per family per year for secondary and tertiary hospitalization.",
    eligibility: "Listed in SECC 2011 database, holding an active PMJAY letter or golden card, or identified under local state criteria.",
    ageCriteria: null,
    incomeCriteria: null,
    requiredDocuments: ["Aadhaar Card", "Ration Card", "PMJAY Letter/Card ID"],
    applicationSteps: [
      "Check eligibility on mera.pmjay.gov.in using your mobile number/ration card.",
      "Visit nearby government hospital or Ayushman Mitra kiosk.",
      "Submit Aadhaar card and Ration card for biometric verification.",
      "Receive Golden Card (Ayushman Card) which can be shown at any empanelled hospital."
    ],
    applicationMode: "Offline",
    officialWebsite: "https://pmjay.gov.in",
    applicationUrl: "https://pmjay.gov.in",
    officialSource: "National Health Authority, Govt of India",
    helpline: "14555",
    lastVerified: "2026-07-20",
    languages: ["en", "te", "hi", "ta"],
    status: "Active",
    eligibilityRules: {
      minAge: 0,
      maxAge: null,
      occupations: ["any"],
      maxIncome: 250000,
      states: null
    },
    simpleExplanation: {
      en: "This health card gives you and your family free treatment up to ₹5 Lakhs per year in government and private hospitals for serious illnesses and operations.",
      te: "ఈ కార్డు ఉన్న కుటుంబానికి ప్రతి సంవత్సరం ₹5 లక్షల వరకు ప్రభుత్వ మరియు ప్రైవేట్ ఆసుపత్రులలో ఉచిత వైద్యం లభిస్తుంది. ఆపరేషన్లకు కూడా ఇది వర్తిస్తుంది.",
      hi: "इस कार्ड से आपके परिवार को गंभीर बीमारियों और ऑपरेशनों के लिए अस्पतालों में ₹5 लाख तक का सालाना इलाज बिल्कुल मुफ्त मिलता है।",
      ta: "இந்த அட்டை மூலம் உங்கள் குடும்பத்திற்கு அரசு மற்றும் தனியார் மருத்துவமனைகளில் ₹5 லட்சம் வரை இலவச சிகிச்சை கிடைக்கும்."
    }
  },
  {
    id: "pm-awas-yojana",
    name: "Pradhan Mantri Awas Yojana (PMAY)",
    alternateNames: ["PMAY Housing", "ఇళ్ల స్థలాలు", "पीएम आवास योजना", "வீட்டு வசதி திட்டம்"],
    department: "Ministry of Housing and Urban Affairs",
    governmentLevel: "Central",
    state: null,
    category: "housing",
    targetGroups: ["Homeless", "EWS", "LIG"],
    description: "Central government scheme aimed at providing affordable housing to all urban and rural poor by subsidizing home construction.",
    benefits: "Subsidy of ₹1.2 Lakh to ₹2.67 Lakh depending on category, or direct assistance for constructing a house.",
    eligibility: "The beneficiary family must not own a brick-and-mortar house in any part of India. Income limits apply based on group (EWS/LIG).",
    ageCriteria: { min: 18, max: 99 },
    incomeCriteria: { max: 600000 },
    requiredDocuments: ["Aadhaar Card", "Income Certificate / BPL Card", "Land papers (if constructing)", "Bank Account Details", "Affidavit stating no other house is owned"],
    applicationSteps: [
      "Visit pmaymis.gov.in (for Urban) or contact Gram Panchayat (for Rural).",
      "Fill citizen assessment application using Aadhaar details.",
      "Select category (EWS, LIG) and enter household/income details.",
      "Submit form and print acknowledgement receipt with application reference."
    ],
    applicationMode: "Both",
    officialWebsite: "https://pmaymis.gov.in",
    applicationUrl: "https://pmaymis.gov.in",
    officialSource: "Ministry of Housing & Urban Affairs",
    helpline: "1800-11-3377 / 1800-11-6117",
    lastVerified: "2026-08-05",
    languages: ["en", "te", "hi", "ta"],
    status: "Active",
    eligibilityRules: {
      minAge: 18,
      maxAge: null,
      occupations: ["any"],
      maxIncome: 600000,
      requiresHouseOwner: false,
      states: null
    },
    simpleExplanation: {
      en: "Get financial support from the government to build your own brick house or get a low-interest bank loan subsidy if you don't own any other home.",
      te: "మీకు సొంత ఇల్లు లేనట్లయితే, పక్కా ఇల్లు నిర్మించుకోవడానికి ప్రభుత్వం నుండి డబ్బులు లభిస్తాయి లేదా తక్కువ వడ్డీతో గృహ రుణం లభిస్తుంది.",
      hi: "यदि आपके पास अपना पक्का मकान नहीं है, तो सरकार नया घर बनाने के लिए सीधे पैसे देगी या होम लोन पर ब्याज में छूट देगी।",
      ta: "உங்களுக்கு சொந்த வீடு இல்லை என்றால், புதிய வீடு கட்டுவதற்கு அரசு நிதி உதவி வழங்குகிறது."
    }
  },
  {
    id: "mgnrega-jobseeker",
    name: "MGNREGA Job Card",
    alternateNames: ["100 Days Work", "ఉపాధి హామీ కార్డు", "मनरेगा", "100 நாள் வேலை"],
    department: "Ministry of Rural Development",
    governmentLevel: "Central",
    state: null,
    category: "employment",
    targetGroups: ["Rural Adults", "Manual Laborers"],
    description: "Guarantees at least 100 days of wage employment in a financial year to rural households whose adult members volunteer to do unskilled manual work.",
    benefits: "Guaranteed 100 days of paid manual work per year. Wages are paid directly to the bank account weekly.",
    eligibility: "Rural resident, adult member (18+) of the family, willing to do unskilled manual labor.",
    ageCriteria: { min: 18, max: 99 },
    incomeCriteria: null,
    requiredDocuments: ["Aadhaar Card", "Ration Card", "Bank Account Details", "Passport Size Photo"],
    applicationSteps: [
      "Go to the local Gram Panchayat office.",
      "Submit oral or written request for Job Card registration.",
      "Provide household details, age proofs, and photographs.",
      "Panchayat verifies details and issues the Job Card within 15 days of application."
    ],
    applicationMode: "Offline",
    officialWebsite: "https://nrega.nic.in",
    applicationUrl: "https://nrega.nic.in",
    officialSource: "Ministry of Rural Development",
    helpline: "1800-11-1555",
    lastVerified: "2026-05-30",
    languages: ["en", "te", "hi", "ta"],
    status: "Active",
    eligibilityRules: {
      minAge: 18,
      maxAge: null,
      occupations: ["laborer", "worker", "farmer", "unemployed", "rural_worker"],
      maxIncome: null,
      states: null
    },
    simpleExplanation: {
      en: "Rural households get a guaranteed 100 days of physical labor work near their village with wages paid directly to their bank account every week.",
      te: "గ్రామీణ ప్రాంతాల్లో నివసించే వారికి ప్రతి సంవత్సరం 100 రోజుల పాటు ఉపాధి పనులు లభిస్తాయి. కూలి డబ్బులు ప్రతి వారం నేరుగా బ్యాంకు ఖాతాలో పడతాయి.",
      hi: "ग्रामीण परिवारों को साल में कम से कम 100 दिन के काम की गारंटी मिलती है। मजदूरी का पैसा हर हफ्ते सीधे बैंक खाते में भेजा जाता है।",
      ta: "கிராமப்புறங்களில் வசிப்பவர்களுக்கு வருடத்திற்கு 100 நாட்கள் வேலை உத்தரவாதம் மற்றும் வாராந்திர கூலி வழங்கப்படுகிறது."
    }
  },
  {
    id: "sukanya-samriddhi",
    name: "Sukanya Samriddhi Yojana (SSY)",
    alternateNames: ["Girl Child Scheme", "సుకన్య సమృద్ధి", "सुकन्या समृद्धि योजना", "செல்வமகள் சேமிப்பு"],
    department: "Department of Posts / Ministry of Finance",
    governmentLevel: "Central",
    state: null,
    category: "women",
    targetGroups: ["Girl Children", "Parents"],
    description: "A small deposit savings scheme promoted by the government for the welfare of girl children, providing excellent interest rates and tax exemptions.",
    benefits: "High compound interest rate (8.2%+), tax benefits under Section 80C, maturity amount paid when the girl reaches 21 years of age.",
    eligibility: "Can be opened by a parent/guardian for a girl child aged below 10 years. Maximum two accounts per family.",
    ageCriteria: { min: 0, max: 10 },
    incomeCriteria: null,
    requiredDocuments: ["Girl Child's Birth Certificate", "Parent/Guardian ID & Address Proof (Aadhaar, PAN)", "Passport size photo of parent"],
    applicationSteps: [
      "Visit any nearby Post Office or authorized commercial bank branch.",
      "Fill out the SSY account opening form.",
      "Submit the birth certificate of the girl child along with parent's ID proof.",
      "Deposit the initial opening amount (minimum ₹250)."
    ],
    applicationMode: "Offline",
    officialWebsite: "https://www.indiapost.gov.in",
    applicationUrl: "https://www.indiapost.gov.in",
    officialSource: "Post Office India / Ministry of Finance",
    helpline: "1800-266-6868",
    lastVerified: "2026-07-15",
    languages: ["en", "te", "hi", "ta"],
    status: "Active",
    eligibilityRules: {
      minAge: 0,
      maxAge: 10,
      targetGender: "female",
      occupations: ["child", "student", "any"],
      maxIncome: null,
      states: null
    },
    simpleExplanation: {
      en: "Save money for your daughter's future education and marriage in this post office scheme. The government gives high interest and tax savings.",
      te: "మీ కూతురి భవిష్యత్తు చదువు మరియు వివాహ ఖర్చుల కోసం పోస్టాఫీసులో పొదుపు పథకం. ప్రభుత్వం అధిక వడ్డీ మరియు పన్ను మినహాయింపు ఇస్తుంది.",
      hi: "अपनी बेटी की पढ़ाई और शादी के लिए पोस्ट ऑफिस में बचत खाता खोलें। सरकार इस पर सबसे अधिक ब्याज और टैक्स छूट देती है।",
      ta: "உங்கள் மகளின் எதிர்கால கல்வி மற்றும் திருமணத்திற்காக அஞ்சலகத்தில் சேமிப்பு கணக்கு தொடங்கும் திட்டம்."
    }
  }
];

export const GOVERNMENT_SERVICES = [
  {
    id: "aadhaar-service",
    name: "Aadhaar Services (Enrollment, Update & Verify)",
    alternateNames: ["Aadhaar card", "ఆధార్ కార్డు", "आधार कार्ड", "ஆதார் கார்டு"],
    department: "UIDAI (Unique Identification Authority of India)",
    governmentLevel: "Central",
    category: "identity",
    description: "Complete guidance for getting a new Aadhaar card, updating address, correcting name/date of birth, or linking mobile number.",
    benefits: "Official biometric identity card valid across India for all government scheme benefits.",
    eligibility: "All residents of India (citizens, children, infants).",
    requiredDocuments: ["Proof of Identity (Passport, Voter ID, PAN)", "Proof of Address (Utility bill, bank statement)", "Proof of Date of Birth"],
    applicationSteps: [
      "Book an online appointment on uidai.gov.in or visit a local Aadhaar Seva Kendra.",
      "Fill the enrollment/correction form.",
      "Submit biometric data (fingerprints, iris scan) and verify physical documents.",
      "Note the Enrollment ID (EID) on the acknowledgment slip to track status online."
    ],
    officialWebsite: "https://uidai.gov.in",
    helpline: "1947",
    lastVerified: "2026-08-15"
  },
  {
    id: "ration-card-service",
    name: "Ration Card - New / Correction / Member Add",
    alternateNames: ["Food Security Card", "రేషన్ కార్డు సేవలు", "राशन कार्ड संशोधन", "ரேஷன் கார்டு"],
    department: "Department of Consumer Affairs, Food and Civil Supplies",
    governmentLevel: "State",
    category: "food",
    description: "Guidance on applying for a new Ration Card, correcting details, adding a child, removing deceased members, or updating address.",
    benefits: "Access to subsidized grains (rice, wheat, sugar) under the Public Distribution System (PDS) and welfare schemes eligibility.",
    eligibility: "Family head must be a resident of the state. Must meet BPL or APL income brackets defined by the state.",
    requiredDocuments: ["Aadhaar Cards of all family members", "Income Certificate", "Electricity bill or Address proof", "Affidavit from local leader/corporator"],
    applicationSteps: [
      "Log into state civil supplies portal or go to MeeSeva/Sachivalayam center.",
      "Fill the application form for ration card correction/addition.",
      "Upload Aadhaar cards and family head photo.",
      "Pay application fee (₹30-₹45) and collect acknowledgement receipt.",
      "Verification officer will visit your house for physical check."
    ],
    officialWebsite: "https://epds.ap.gov.in",
    helpline: "1967",
    lastVerified: "2026-06-25"
  },
  {
    id: "income-cert-service",
    name: "Income Certificate Issuance",
    alternateNames: ["Income proof", "ఆదాయ ధృవీకరణ పత్రం", "आय प्रमाण पत्र", "வருமான சான்றிதழ்"],
    department: "Revenue Department",
    governmentLevel: "State",
    category: "identity",
    description: "An official document certifying the annual family income from all sources. Essential for educational scholarships and welfare eligibility.",
    benefits: "Proof of income required to receive scholarships, fee reimbursements, housing benefits, and bank loans.",
    eligibility: "All citizens residing in the state earning an income.",
    requiredDocuments: ["Aadhaar Card", "Salary Certificate or Employer declaration", "Income Tax Returns (if applicable)", "Ration Card copy", "Self Declaration Form"],
    applicationSteps: [
      "Go to local citizen center (MeeSeva / Sachivalayam / MahaOnline / Bangalore One) or state online portal.",
      "Fill the Income Certificate form with salary/revenue details.",
      "Upload identity and income proof docs.",
      "Pay processing fee. Application is routed to Revenue Inspector / Tehsildar.",
      "Certificate is generated and signed digitally within 7 to 15 days."
    ],
    officialWebsite: "https://meeseva.ap.gov.in",
    helpline: "1100 / 1902",
    lastVerified: "2026-08-20"
  },
  {
    id: "driving-licence-service",
    name: "Driving Licence (Learner & Permanent)",
    alternateNames: ["Driving License", "డ్రైవింగ్ లైసెన్స్", "ड्राइविंग लाइसेंस", "ஓட்டுநர் உரிமம்"],
    department: "Transport Department (RTA)",
    governmentLevel: "State",
    category: "transport",
    description: "Guidance on applying for a Learner's Licence (LL), booking slots for driving tests, and getting a permanent driving licence.",
    benefits: "Authorized card to drive motor vehicles in public roads across India.",
    eligibility: "Age 16+ for gearless vehicle (up to 50cc). Age 18+ for light motor vehicle with gear.",
    requiredDocuments: ["Age Proof (Aadhaar, School Marksheet)", "Address Proof (Ration card, utility bill)", "Form 1 and 1A Physical Fitness Certificate"],
    applicationSteps: [
      "Apply online on Sarathi Parivahan portal (sarathi.parivahan.gov.in).",
      "Select your state, click 'Apply for Learner License', and fill forms.",
      "Pay application fees and book Learner Test slot.",
      "After passing Learner Test, wait 30 days and apply for Permanent Licence.",
      "Book slot, attend the physical driving test, and receive licence by speed post."
    ],
    officialWebsite: "https://sarathi.parivahan.gov.in",
    helpline: "0120-4925505",
    lastVerified: "2026-05-15"
  },
  {
    id: "problem-spandana-ap",
    name: "Public Report a Problem Redressal (Spandana / CPGRAMS)",
    alternateNames: ["Complaints", "ఫిర్యాదు", "शिकायत दर्ज करें", "புகார்"],
    department: "General Administration Department",
    governmentLevel: "State",
    category: "problems",
    description: "Submit complaints regarding civic amenities, government employees, delays in service delivery, or illegal actions, and track redressal.",
    benefits: "Official trackable complaints sent directly to responsible officers with time-bound resolution.",
    eligibility: "All citizens.",
    requiredDocuments: ["Written problem detailing the issue", "Supporting photo/document evidence", "Aadhaar Card"],
    applicationSteps: [
      "Register on state problem portal (e.g. Spandana for AP, Prajavani for TS, CPGRAMS for Central).",
      "Login, click 'Register Report a Problem', choose department and subject.",
      "Describe complaints in detail and upload evidence.",
      "Get a Report a Problem Reference Number to track status. Officer must resolve within 15-30 days."
    ],
    officialWebsite: "https://www.spandana.ap.gov.in",
    helpline: "1902",
    lastVerified: "2026-08-25"
  }
];

export const SERVICE_CENTERS = {
  "Andhra Pradesh": [
    { name: "Village Sachivalayam Center", type: "Ward/Village Office", address: "Guntur Municipal Ward 4, Amaravati Road, Guntur", phone: "1902" },
    { name: "MeeSeva Center AP-042", type: "Citizen Center", address: "Main Bazaar Road, Near Bus Stand, Vijayawada", phone: "0866-2432242" }
  ],
  "Telangana": [
    { name: "MeeSeva Center TS-109", type: "Citizen Center", address: "KPHB Colony Phase 3, Near Metro Station, Hyderabad", phone: "040-23456789" },
    { name: "Prajavani Helpdesk", type: "District Collector Office", address: "Collectorate Complex, Hanamkonda, Warangal", phone: "1800-425-1111" }
  ],
  "Tamil Nadu": [
    { name: "e-Sevai Center TN-015", type: "Citizen Service", address: "Anna Salai Road, opposite LIC Building, Chennai", phone: "1800-425-6000" },
    { name: "TNeGA Helpdesk", type: "Municipal Center", address: "Gandhi Road, Near Railway Station, Madurai", phone: "1100" }
  ],
  "Karnataka": [
    { name: "Bangalore One Center", type: "Citizen Center", address: "Jayanagar 4th Block, next to Post Office, Bengaluru", phone: "080-22445566" },
    { name: "Karnataka One Center", type: "Citizen Center", address: "Court Road, Hubli, Dharwad District", phone: "0836-223344" }
  ],
  "Kerala": [
    { name: "Akshaya Center KL-08", type: "Citizen Service Desk", address: "MG Road, Near Secretariat, Thiruvananthapuram", phone: "0471-2334455" },
    { name: "Akshaya Center KL-92", type: "Citizen Service Desk", address: "Marine Drive Road, Kochi", phone: "0484-2233445" }
  ],
  "Maharashtra": [
    { name: "Aaple Sarkar Seva Kendra", type: "Citizen Center", address: "Dadabhai Naoroji Road, Fort, Mumbai", phone: "1800-120-8040" },
    { name: "MahaOnline Citizen Kiosk", type: "Citizen Service Desk", address: "Shivaji Nagar Road, Pune", phone: "020-25678901" }
  ]
};

export const MOCK_APPLICATIONS = [
  {
    id: "APP-2026-08321",
    type: "Pension Scheme Verification",
    serviceName: "NTR Bharosa Pension",
    status: "Verification in Progress",
    statusColor: "#d97706",
    state: "Andhra Pradesh",
    date: "26 Aug 2026",
    lastUpdate: "27 Aug 2026 - Document verified by Welfare Assistant",
    nextStep: "Home verification by Field Officer",
    timeline: [
      { title: "Application Submitted", done: true, current: false, date: "26 Aug 2026" },
      { title: "Documents Received", done: true, current: false, date: "26 Aug 2026" },
      { title: "Verification", done: false, current: true, date: "In progress" },
      { title: "Approved", done: false, current: false, date: "Pending" },
      { title: "Completed", done: false, current: false, date: "Pending" }
    ],
    voiceSummary: {
      en: "Your pension application is currently in the verification stage. Documents have been verified. Field verification is pending.",
      te: "మీ పెన్షన్ దరఖాస్తు ప్రస్తుతం పరిశీలనలో ఉంది. పత్రాలు ధృవీకరించబడ్డాయి. ఫీల్డ్ వెరిఫికేషన్ చేయాల్సి ఉంది.",
      hi: "आपकी पेंशन अर्जी का सत्यापन चल रहा है। दस्तावेज जांच लिए गए हैं। फील्ड जांच बाकी है।",
      ta: "உங்கள் ஓய்வூதிய விண்ணப்பம் தற்போது சரிபார்ப்பில் உள்ளது. ஆவணங்கள் சரிபார்க்கப்பட்டுள்ளன."
    }
  },
  {
    id: "APP-2026-99402",
    type: "Income Certificate Request",
    serviceName: "Income Certificate Issuance",
    status: "Approved & Issued",
    statusColor: "#16a34a",
    state: "Telangana",
    date: "20 Aug 2026",
    lastUpdate: "23 Aug 2026 - Digitally signed by Tehsildar",
    nextStep: "Download PDF or collect printout",
    timeline: [
      { title: "Application Submitted", done: true, current: false, date: "20 Aug 2026" },
      { title: "Documents Verified", done: true, current: false, date: "21 Aug 2026" },
      { title: "Tehsildar Approval", done: true, current: false, date: "23 Aug 2026" },
      { title: "Issued", done: true, current: true, date: "23 Aug 2026" }
    ],
    voiceSummary: {
      en: "Your income certificate has been approved and issued by the Tehsildar. You can now download it.",
      te: "మీ ఆదాయ ధృవీకరణ పత్రం ఆమోదించబడింది మరియు తహశీల్దార్ జారీ చేశారు. మీరు డౌన్‌లోడ్ చేసుకోవచ్చు.",
      hi: "आपका आय प्रमाण पत्र तहसीलदार द्वारा स्वीकृत और जारी कर दिया गया है। आप इसे डाउनलोड कर सकते हैं।",
      ta: "உங்கள் வருமான சான்றிதழ் தாசில்தாரால் அங்கீகரிக்கப்பட்டு வழங்கப்பட்டுள்ளது."
    }
  }
];
