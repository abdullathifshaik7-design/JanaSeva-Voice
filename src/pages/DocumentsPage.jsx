import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { speakText } from "../services/voiceService";
import { 
  Camera, Image as ImageIcon, FolderOpen, FileText, HelpCircle, 
  Volume2, X, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight
} from "lucide-react";
import DemoNote from "../components/DemoNote";

// Complete local translation matrices for Document AI assistant
const DOC_TRANSLATIONS = {
  en: {
    detected: "🔍 Document detected",
    needed: "ℹ️ Information needed",
    where: "📍 Where to find that information",
    whichField: "✍️ Which form field needs it",
    steps: "📋 Step-by-step instructions",
    aadhaar: "Aadhaar Card",
    pan: "PAN Card",
    income: "Income Certificate",
    caste: "Caste Certificate",
    bank: "Bank Passbook",
    ration: "Ration Card",
    voter: "Voter ID",
    land: "Land/Property document",
    pension: "Pension document",
    education: "Education certificate",
    other: "Other government document",
    guideTitle: "Form Assistant Guide",
    listenBtn: "Listen Guide",
    stopBtn: "Stop",
    confirmBtn: "Confirm Field / Done",
    backBtn: "Go Back",
    finishBtn: "Finish Form Guide",
    scanTitle: "Scan or Upload Document",
    scanDesc: "Attach Aadhaar, PAN, Income/Caste Certificates or Bank Passbooks. Supports JPG, PNG, PDF.",
    takePhoto: "Scan Document",
    gallery: "Upload from Gallery",
    uploadFile: "Upload File",
    analyzing: "🤖 Reading and classifying document layout...",
    uploaded: "Uploaded",
    recognized: "Document Recognized",
    unrecognized: "Document Not Recognized",
    unrecognizedDesc: "Please upload a valid identity card.",
    unclear: "Image Unclear",
    unclearDesc: "Image is blurry or too dark. Retake with good lighting.",
    mismatch: "Document Type Mismatch",
    mismatchDesc: "Uploaded card does not match the active service requirement.",
    howToFill: "How do I fill this form?"
  },
  te: {
    detected: "🔍 గుర్తించిన పత్రం",
    needed: "ℹ️ కావలసిన సమాచారం",
    where: "📍 సమాచారం ఎక్కడ ఉంటుంది",
    whichField: "✍️ ఏ ఫారమ్ ఫీల్డ్ నింపాలి",
    steps: "📋 దశల వారీ మార్గదర్శకం",
    aadhaar: "ఆధార్ కార్డు",
    pan: "పాన్ కార్డు",
    income: "ఆదాయ ధృవీకరణ పత్రం",
    caste: "కులం ధృవీకరణ పత్రం",
    bank: "బ్యాంక్ పాస్‌బుక్",
    ration: "రేషన్ కార్డు",
    voter: "ఓటరు గుర్తింపు కార్డు",
    land: "భూమి పత్రాలు",
    pension: "పెన్షన్ పత్రం",
    education: "విద్యా ధృవీకరణ పత్రం",
    other: "ఇతర ప్రభుత్వ పత్రం",
    guideTitle: "ఫారమ్ అసిస్టెంట్ గైడ్",
    listenBtn: "వివరణ వినండి",
    stopBtn: "ఆపండి",
    confirmBtn: "ఫీల్డ్ నిర్ధారించండి / పూర్తి",
    backBtn: "వెనక్కి వెళ్ళండి",
    finishBtn: "ఫారమ్ గైడ్ పూర్తి చేయండి",
    scanTitle: "పత్రాన్ని స్కాన్ చేయండి లేదా అప్‌లోడ్ చేయండి",
    scanDesc: "ఆధార్, పాన్, ఆదాయ/కులం ధృవీకరణ పత్రాలు లేదా బ్యాంక్ పాస్‌బుక్‌లను జత చేయండి. JPG, PNG, PDF లను అనుమతిస్తుంది.",
    takePhoto: "పత్రాన్ని స్కాన్ చేయి",
    gallery: "గ్యాలరీ నుండి అప్‌లోడ్ చేయి",
    uploadFile: "ఫైల్‌ను అప్‌లోడ్ చేయి",
    analyzing: "🤖 పత్రం రకాన్ని విశ్లేషిస్తున్నాము...",
    uploaded: "అప్‌లోడ్ చేయబడింది",
    recognized: "పత్రం విజయవంతంగా గుర్తించబడింది",
    unrecognized: "పత్రం గుర్తించబడలేదు",
    unrecognizedDesc: "దయచేసి సరైన గుర్తింపు కార్డును అప్‌లోడ్ చేయండి.",
    unclear: "చిత్రం స్పష్టంగా లేదు",
    unclearDesc: "చిత్రం అస్పష్టంగా లేదా చాలా చీకటిగా ఉంది. మంచి వెలుతురులో మళ్ళీ ఫోటో తీయండి.",
    mismatch: "పత్రం రకం సరిపోలడం లేదు",
    mismatchDesc: "అప్‌లోడ్ చేసిన కార్డు అవసరమైన సేవకు సరిపోలడం లేదు.",
    howToFill: "ఈ ఫారమ్ ఎలా నింపాలి?"
  },
  hi: {
    detected: "🔍 पहचाना गया दस्तावेज़",
    needed: "ℹ️ आवश्यक जानकारी",
    where: "📍 जानकारी कहाँ मिलेगी",
    whichField: "✍️ कौन सा फ़ील्ड भरना है",
    steps: "📋 चरण-दर-चरण निर्देश",
    aadhaar: "आधार कार्ड",
    pan: "पैन कार्ड",
    income: "आय प्रमाण पत्र",
    caste: "जाति प्रमाण पत्र",
    bank: "बैंक पासबुक",
    ration: "राशन कार्ड",
    voter: "वोटर आईडी",
    land: "भूमि दस्तावेज",
    pension: "पेंशन दस्तावेज",
    education: "शैक्षणिक प्रमाण पत्र",
    other: "अन्य सरकारी दस्तावेज",
    guideTitle: "फॉर्म सहायक गाइड",
    listenBtn: "मार्गदर्शिका सुनें",
    stopBtn: "रोकें",
    confirmBtn: "पुष्टि करें / हो गया",
    backBtn: "पीछे जाएं",
    finishBtn: "फॉर्म गाइड समाप्त करें",
    scanTitle: "दस्तावेज़ स्कैन या अपलोड करें",
    scanDesc: "आधार, पैन, आय/जाति प्रमाण पत्र या बैंक पासबुक संलग्न करें। JPG, PNG, PDF का समर्थन करता है।",
    takePhoto: "दस्तावेज़ स्कैन करें",
    gallery: "गैलरी से अपलोड करें",
    uploadFile: "फ़ाइल अपलोड करें",
    analyzing: "🤖 दस्तावेज़ का विश्लेषण और वर्गीकरण किया जा रहा है...",
    uploaded: "अपलोड किया गया",
    recognized: "दस्तावेज़ पहचाना गया",
    unrecognized: "दस्तावेज़ नहीं पहचाना गया",
    unrecognizedDesc: "कृपया एक वैध पहचान पत्र अपलोड करें।",
    unclear: "चित्र स्पष्ट नहीं है",
    unclearDesc: "चित्र धुंधला या बहुत गहरा है। अच्छी रोशनी में दोबारा फोटो लें।",
    mismatch: "दस्तावेज़ प्रकार बेमेल",
    mismatchDesc: "अपलोड किया गया कार्ड सक्रिय सेवा आवश्यकता से मेल नहीं खाता है.",
    howToFill: "मैं इस फॉर्म को कैसे भरूं?"
  },
  ta: {
    detected: "🔍 கண்டறியப்பட்ட ஆவணம்",
    needed: "ℹ️ தேவைப்படும் தகவல்",
    where: "📍 தகவல் எங்கு இருக்கும்",
    whichField: "✍️ எந்த படிவத்தை நிரப்ப வேண்டும்",
    steps: "📋 படி வாரியான வழிமுறைகள்",
    aadhaar: "ஆதார் அட்டை",
    pan: "பான் அட்டை",
    income: "வருமான சான்றிதழ்",
    caste: "சாதி சான்றிதழ்",
    bank: "வங்கி கணக்கு புத்தகம்",
    ration: "குடும்ப அட்டை",
    voter: "வாக்காளர் அடையாள அட்டை",
    land: "நில ஆவணம்",
    pension: "ஓய்வூதிய ஆவணம்",
    education: "கல்வி சான்றிதழ்",
    other: "இதர அரசு ஆவணம்",
    guideTitle: "படிவ உதவி வழிகாட்டி",
    listenBtn: "வழிகாட்டி கேள்",
    stopBtn: "நிறுத்து",
    confirmBtn: "உறுதிசெய் / முடிந்தது",
    backBtn: "பின்செல்",
    finishBtn: "படிவ வழிகாட்டியை முடி",
    scanTitle: "ஆவணத்தை ஸ்கேன் செய்யவும்",
    scanDesc: "ஆதார், பான், வருமானம்/சாதி சான்றிதழ்கள் அல்லது வங்கி கணக்கு புத்தகங்களை இணைக்கவும். JPG, PNG, PDF ஐ ஆதரிக்கிறது.",
    takePhoto: "ஆவணத்தை ஸ்கேன் செய்",
    gallery: "கேலரியில் இருந்து பதிவேற்று",
    uploadFile: "கோப்பை பதிவேற்று",
    analyzing: "🤖 ஆவணத்தின் அமைப்பை பகுப்பாய்வு செய்கிறது...",
    uploaded: "பதிவேற்றப்பட்டது",
    recognized: "ஆவணம் அங்கீகரிக்கப்பட்டது",
    unrecognized: "ஆவணம் அங்கீகரிக்கப்படவில்லை",
    unrecognizedDesc: "தயவுசெய்து சரியான அடையாள அட்டையை பதிவேற்றவும்.",
    unclear: "படம் தெளிவாக இல்லை",
    unclearDesc: "படம் மங்கலாக அல்லது மிகவும் இருட்டாக உள்ளது. நல்ல வெளிச்சத்தில் மீண்டும் புகைப்படம் எடுக்கவும்.",
    mismatch: "ஆவண வகை பொருந்தவில்லை",
    mismatchDesc: "பதிவேற்றப்பட்ட அட்டை செயலில் உள்ள சேவை தேவைக்கு பொருந்தவில்லை.",
    howToFill: "இந்த படிவத்தை நான் எவ்வாறு நிரப்புவது?"
  },
  kn: {
    detected: "🔍 ಗುರುತಿಸಲಾದ ಡಾಕ್ಯುಮೆಂಟ್",
    needed: "ℹ️ ಅಗತ್ಯವಿರುವ ಮಾಹಿತಿ",
    where: "📍 ಮಾಹಿತಿ ಎಲ್ಲಿ ಕಂಡುಬರುತ್ತದೆ",
    whichField: "✍️ ಯಾವ ಫಾರ್ಮ್ ತುಂಬಬೇಕು",
    steps: "📋 ಹಂತ-ಹಂತದ ಸೂಚನೆಗಳು",
    aadhaar: "ಆಧಾರ್ ಕಾರ್ಡ್",
    pan: "ಪ್ಯಾನ್ ಕಾರ್ಡ್",
    income: "ಆದಾಯ ಪ್ರಮಾಣ ಪತ್ರ",
    caste: "ಜಾತಿ ಪ್ರಮಾಣ ಪತ್ರ",
    bank: "ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್",
    ration: "ರೇಷನ್ ಕಾರ್ಡ್",
    voter: "ವೋಟರ್ ಐಡಿ",
    land: "ಭೂಮಿ ದಾಖಲೆಗಳು",
    pension: "ಪಿಂಚಣಿ ದಾಖಲೆ",
    education: "ಶೈಕ್ಷಣಿಕ ಪ್ರಮಾಣಪತ್ರ",
    other: "ಇತರ ಸರ್ಕಾರಿ ದಾಖಲೆ",
    guideTitle: "ಫಾರ್ಮ್ ಸಹಾಯ ಮಾರ್ಗದರ್ಶಿ",
    listenBtn: "ಕೇಳಿ",
    stopBtn: "ನಿಲ್ಲಿಸಿ",
    confirmBtn: "ದೃಢೀಕರಿಸಿ / ಮುಗಿಯಿತು",
    backBtn: "ಹಿಂದಕ್ಕೆ ಹೋಗಿ",
    finishBtn: "ಮಾರ್ಗದರ್ಶಿ ಮುಗಿಸಿ",
    scanTitle: "ಡಾಕ್ಯುಮೆಂಟ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    scanDesc: "ಆಧಾರ್, ಪ್ಯಾನ್, ಆದಾಯ/ಜಾತಿ ಪ್ರಮಾಣಪತ್ರಗಳು ಅಥವಾ ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್‌ಗಳನ್ನು ಲಗತ್ತಿಸಿ. JPG, PNG, PDF ಅನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ.",
    takePhoto: "ಡಾಕ್ಯುಮೆಂಟ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    gallery: "ಗ್ಯಾಲರಿಯಿಂದ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    uploadFile: "ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    analyzing: "🤖 ಡಾಕ್ಯುಮೆಂಟ್ ವರ್ಗೀಕರಿಸಲಾಗುತ್ತಿದೆ...",
    uploaded: "ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ",
    recognized: "ಡಾಕ್ಯುಮೆಂಟ್ ಗುರುತಿಸಲಾಗಿದೆ",
    unrecognized: "ಡಾಕ್ಯುಮೆಂಟ್ ಗುರುತಿಸಲಾಗಿಲ್ಲ",
    unrecognizedDesc: "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಗುರುತಿನ ಚೀಟಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    unclear: "ಚಿತ್ರವು ಸ್ಪಷ್ಟವಾಗಿಲ್ಲ",
    unclearDesc: "ಚಿತ್ರವು ಮಸುಕಾಗಿದೆ ಅಥವಾ ತುಂಬಾ ಕತ್ತಲೆಯಾಗಿದೆ. ಉತ್ತಮ ಬೆಳಕಿನಲ್ಲಿ ಮತ್ತೆ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ.",
    mismatch: "ಡಾಕ್ಯುಮೆಂಟ್ ಪ್ರಕಾರ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ",
    mismatchDesc: "ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಕಾರ್ಡ್ ಅಗತ್ಯವಿರುವ ಸೇವೆಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.",
    howToFill: "ಈ ಫಾರ್ಮ್ ಅನ್ನು ನಾನು ಹೇಗೆ ತುಂಬಲಿ?"
  },
  ml: {
    detected: "🔍 തിരിച്ചറിഞ്ഞ രേഖ",
    needed: "ℹ️ ആവശ്യമായ വിവരങ്ങൾ",
    where: "📍 വിവരങ്ങൾ എവിടെ കാണാം",
    whichField: "✍️ ഏത് ഫീൽഡ് പൂരിപ്പിക്കണം",
    steps: "📋 ഘട്ടം ഘട്ടമായുള്ള നിർദ്ദേശങ്ങൾ",
    aadhaar: "ആധാർ കാർഡ്",
    pan: "പാൻ കാർഡ്",
    income: "വരുമാന സർട്ടിഫിക്കറ്റ്",
    caste: "ജാതി സർട്ടിഫിക്കറ്റ്",
    bank: "ബാങ്ക് പാസ്ബുക്ക്",
    ration: "റേഷൻ കാർഡ്",
    voter: "വോട്ടർ ഐഡി",
    land: "ഭൂമി രേഖകൾ",
    pension: "പെൻഷൻ രേഖ",
    education: "വിദ്യാഭ്യാസ സർട്ടിഫിക്കറ്റ്",
    other: "മറ്റ് സർക്കാർ രേഖ",
    guideTitle: "ഫോം അസിസ്റ്റന്റ് ഗൈഡ്",
    listenBtn: "ശ്രദ്ധിക്കുക",
    stopBtn: "നിർത്തുക",
    confirmBtn: "സ്ഥിരീകരിക്കുക / കഴിഞ്ഞു",
    backBtn: "പിന്നിലേക്ക് പോവുക",
    finishBtn: "ഫോം ഗൈഡ് പൂർത്തിയാക്കുക",
    scanTitle: "രേഖ സ്കാൻ ചെയ്യുക അല്ലെങ്കിൽ അപ്‌ലോഡ് ചെയ്യുക",
    scanDesc: "ആധാർ, പാൻ, വരുമാനം/ജാതി സർട്ടിഫിക്കറ്റുകൾ അല്ലെങ്കിൽ ബാങ്ക് പാസ്ബുക്കുകൾ അറ്റാച്ചുചെയ്യുക. JPG, PNG, PDF പിന്തുണയ്ക്കുന്നു.",
    takePhoto: "രേഖ സ്കാൻ ചെയ്യുക",
    gallery: "ഗാലറിയിൽ നിന്ന് അപ്‌ലോഡ് ചെയ്യുക",
    uploadFile: "ഫയൽ അപ്‌ലോഡ് ചെയ്യുക",
    analyzing: "🤖 ഡോക്യുമെന്റ് തരം വിശകലനം ചെയ്യുന്നു...",
    uploaded: "അപ്‌ലോഡ് ചെയ്തു",
    recognized: "രേഖ തിരിച്ചറിഞ്ഞു",
    unrecognized: "രേഖ തിരിച്ചറിയാൻ കഴിഞ്ഞില്ല",
    unrecognizedDesc: "ദയവായി സാധുവായ ഒരു തിരിച്ചറിയൽ കാർഡ് അപ്‌ലോഡ് ചെയ്യുക.",
    unclear: "ചിത്രം വ്യക്തമല്ല",
    unclearDesc: "ചിത്രം മങ്ങിയതോ ഇരുണ്ടതോ ആണ്. നല്ല വെളിച്ചത്തിൽ വീണ്ടും ഫോട്ടോ എടുക്കുക.",
    mismatch: "രേഖാ തരം പൊരുത്തക്കേട്",
    mismatchDesc: "അപ്‌ലോഡ് ചെയ്ത കാർഡ് ആവശ്യമായ സേവനവുമായി പൊരുത്തപ്പെടുന്നില്ല.",
    howToFill: "ഞാൻ ഈ ഫോം എങ്ങനെ പൂരിപ്പിക്കും?"
  }
};

export default function DocumentsPage() {
  const { t, language } = useApp();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Document AI States
  const [detectedType, setDetectedType] = useState("");
  const [recognitionStatus, setRecognitionStatus] = useState(""); // 'Recognized', 'Not Recognized', 'Image Unclear', 'Type Mismatch'
  const [showHelper, setShowHelper] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sync active language pack
  const dTrans = DOC_TRANSLATIONS[language] || DOC_TRANSLATIONS.en;

  const translateDocType = (typeKey) => {
    switch (typeKey) {
      case "Aadhaar Card": return dTrans.aadhaar;
      case "PAN Card": return dTrans.pan;
      case "Income Certificate": return dTrans.income;
      case "Caste Certificate": return dTrans.caste;
      case "Bank Passbook": return dTrans.bank;
      case "Ration Card": return dTrans.ration;
      case "Voter ID": return dTrans.voter;
      case "Land/Property document": return dTrans.land;
      case "Pension document": return dTrans.pension;
      case "Education certificate": return dTrans.education;
      case "Other government document": return dTrans.other;
      default: return typeKey;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setSelectedFile(file);
    setShowHelper(false);
    setCurrentStep(1);

    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }

    setTimeout(() => {
      const name = file.name.toLowerCase();
      let status = "Recognized";
      let type = "";

      if (name.includes("blur") || name.includes("unclear") || name.includes("dark")) {
        status = "Image Unclear";
      } else if (name.includes("wrong") || name.includes("mismatch")) {
        status = "Document Type Mismatch";
      } else {
        if (name.includes("aadhar") || name.includes("aadhaar")) {
          type = "Aadhaar Card";
        } else if (name.includes("pan")) {
          type = "PAN Card";
        } else if (name.includes("income")) {
          type = "Income Certificate";
        } else if (name.includes("caste")) {
          type = "Caste Certificate";
        } else if (name.includes("bank") || name.includes("passbook")) {
          type = "Bank Passbook";
        } else if (name.includes("ration")) {
          type = "Ration Card";
        } else if (name.includes("voter")) {
          type = "Voter ID";
        } else if (name.includes("land") || name.includes("property") || name.includes("patta")) {
          type = "Land/Property document";
        } else if (name.includes("pension")) {
          type = "Pension document";
        } else if (name.includes("education") || name.includes("marksheet") || name.includes("degree")) {
          type = "Education certificate";
        } else if (name.includes("gov") || name.includes("government")) {
          type = "Other government document";
        } else {
          status = "Not Recognized";
        }
      }

      setDetectedType(type);
      setRecognitionStatus(status);
      setIsProcessing(false);
    }, 1500);
  };

  const handleCameraCapture = () => {
    document.getElementById("camera-capture-input").click();
  };

  const handleGalleryUpload = () => {
    document.getElementById("gallery-upload-input").click();
  };

  // Form Steps schema mapping
  const formSteps = {
    "Aadhaar Card": [
      {
        field: "Aadhaar Card Number (12 Digits)",
        location: "Located at the bottom center of the front side in XXXX XXXX XXXX layout.",
        instruction: "Carefully enter the 12-digit number. Avoid spaces or letters.",
        visual: "aadhaar_number",
        guides: {
          en: "Step 1. Fill Aadhaar Card Number. Look at the bottom center. Copy the 12 digits.",
          te: "దశ 1. ఆధార్ కార్డు సంఖ్య నింపండి. కింద మధ్య భాగంలో చూడండి. 12 అంకెలను కాపీ చేయండి.",
          hi: "चरण 1. आधार कार्ड नंबर भरें। नीचे बीच में देखें। 12 अंकों को कॉपी करें।",
          ta: "படி 1. ஆதார் அட்டை எண். கீழ் நடுவில் உள்ள 12 இலக்கங்களை நகலெடுக்கவும்.",
          kn: "ಹಂತ 1. ಆಧಾರ್ ಕಾರ್ಡ್ ಸಂಖ್ಯೆ. ಕೆಳಭಾಗದ ಮಧ್ಯದಲ್ಲಿರುವ 12 ಅಂಕೆಗಳನ್ನು ನಕಲಿಸಿ.",
          ml: "ഘട്ടം 1. ആധാർ കാർഡ് നമ്പർ. താഴെ മധ്യഭാഗത്തുള്ള 12 അക്കങ്ങൾ പൂരിപ്പിക്കുക."
        }
      },
      {
        field: "Full Legal Name",
        location: "Located at the center of the card just above the gender info.",
        instruction: "Ensure the spelling exactly matches the document layout.",
        visual: "aadhaar_name",
        guides: {
          en: "Step 2. Fill Full Legal Name. Located at the center above gender.",
          te: "దశ 2. పూర్తి పేరు నింపండి. లింగం వివరాల పైన మధ్యలో ఉంటుంది.",
          hi: "चरण 2. पूरा कानूनी नाम भरें। लिंग विवरण के ऊपर बीच में स्थित है।",
          ta: "படி 2. முழு பெயர். பாலின விவரத்திற்கு மேலே உள்ளது.",
          kn: "ಹಂತ 2. ಪೂರ್ಣ ಹೆಸರು. ಲಿಂಗ ವಿವರದ ಮೇಲೆ ಮಧ್ಯದಲ್ಲಿದೆ.",
          ml: "ഘട്ടം 2. മുഴുവൻ പേര്. ലിംഗ വിവരത്തിന് മുകളിൽ കാണാം."
        }
      },
      {
        field: "Date of Birth (DOB)",
        location: "Located right next to your Name row on the front side.",
        instruction: "Enter in DD/MM/YYYY format exactly as printed.",
        visual: "aadhaar_dob",
        guides: {
          en: "Step 3. Fill Date of Birth. Format DD/MM/YYYY next to Name.",
          te: "దశ 3. పుట్టిన తేదీ నింపండి. పేరు పక్కన రోజు, నెల, సంవత్సరం ఫార్మాట్‌లో ఉంటుంది.",
          hi: "चरण 3. जन्म तिथि भरें। नाम के पास दिन, महीना, वर्ष प्रारूप में है।",
          ta: "படி 3. பிறந்த தேதி. பெயருக்கு பக்கத்தில் இருக்கும்.",
          kn: "ಹಂತ 3. ಜನ್ಮ ದಿನಾಂಕ. ಹೆಸರಿನ ಪಕ್ಕದಲ್ಲಿರುತ್ತದೆ.",
          ml: "ഘട്ടം 3. ജനന തീയതി. പേരിന് അടുത്തായി കാണാം."
        }
      }
    ],
    "PAN Card": [
      {
        field: "Permanent Account Number (PAN)",
        location: "Located in the middle center in alphanumeric format (e.g., ABCDE1234F).",
        instruction: "Enter all letters in CAPITAL case.",
        visual: "pan_number",
        guides: {
          en: "Step 1. Fill PAN Number. Located in the middle. CAPITAL letters only.",
          te: "దశ 1. పాన్ నంబర్ నింపండి. కార్డు మధ్యలో ఉంటుంది. కేవలం పెద్ద అక్షరాలే వ్రాయండి.",
          hi: "चरण 1. पैन नंबर दर्ज करें। कार्ड के बीच में स्थित है। केवल बड़े अक्षर लिखें।",
          ta: "படி 1. பான் எண். நடுவில் இருக்கும். பெரிய எழுத்துக்களை மட்டும் பயன்படுத்தவும்.",
          kn: "ಹಂತ 1. ಪ್ಯಾನ್ ಸಂಖ್ಯೆ. ಮಧ್ಯಭಾಗದಲ್ಲಿರುತ್ತದೆ. ದೊಡ್ಡ ಅಕ್ಷರಗಳಲ್ಲೇ ಬರೆಯಿರಿ.",
          ml: "ഘട്ടം 1. പാൻ നമ്പർ. നടുവിലായി കാണാം. വലിയ അക്ഷരങ്ങളിൽ പൂരിപ്പിക്കുക."
        }
      },
      {
        field: "Father's Name",
        location: "Located right under your Full Name on the card.",
        instruction: "Type the full name including initials or middle name.",
        visual: "pan_father",
        guides: {
          en: "Step 2. Fill Father's Name. Located under your full name.",
          te: "దశ 2. తండ్రి పేరు నింపండి. మీ పూర్తి పేరు కింద ఉంటుంది.",
          hi: "चरण 2. पिता का नाम भरें। आपके नाम के ठीक नीचे है।",
          ta: "படி 2. தந்தை பெயர். உங்கள் பெயருக்கு கீழ் இருக்கும்.",
          kn: "ಹಂತ 2. ತಂದೆಯ ಹೆಸರು. ನಿಮ್ಮ ಹೆಸರಿನ ಕೆಳಗೆ ಇರುತ್ತದೆ.",
          ml: "ഘട്ടം 2. പിതാവിന്റെ പേര്. നിങ്ങളുടെ പേരിന് താഴെ കാണാം."
        }
      }
    ]
  };

  const defaultSteps = [
    {
      field: "Certificate Reference ID",
      location: "Located at the top-right corner of the official sheet.",
      instruction: "Copy the reference code exactly as printed.",
      visual: "gen_ref",
      guides: {
        en: "Step 1. Fill Certificate Reference ID at the top right.",
        te: "దశ 1. పైన కుడి వైపున ఉన్న సర్టిఫికేట్ రిఫరెన్స్ ఐడి నింపండి.",
        hi: "चरण 1. ऊपर दाईं ओर स्थित प्रमाणपत्र संदर्भ आईडी भरें।",
        ta: "படி 1. சான்றிதழ் குறிப்பு எண்.",
        kn: "ಹಂತ 1. ಪ್ರಮಾಣಪತ್ರದ ರೆಫರೆನ್ಸ್ ಐಡಿ.",
        ml: "ഘട്ടം 1. സർട്ടിഫിക്കറ്റ് റഫറൻസ് ഐഡി."
      }
    }
  ];

  const activeSteps = formSteps[detectedType] || defaultSteps;
  const currentStepData = activeSteps[currentStep - 1] || activeSteps[0];

  const handlePlayVoice = async () => {
    if (isSpeaking) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    // Use user preferred language guide if mapped, else fallback to dynamic text translation
    const speechStr = currentStepData.guides?.[language] || currentStepData.guides?.en || `Step ${currentStep}. ${currentStepData.field}. ${currentStepData.instruction}`;

    await speakText(speechStr, language);
    setIsSpeaking(false);
  };

  const handleVoiceCommand = (cmd) => {
    if (cmd === "done" || cmd === "next") {
      if (currentStep < activeSteps.length) {
        setCurrentStep(prev => prev + 1);
      }
    } else if (cmd === "back") {
      if (currentStep > 1) {
        setCurrentStep(prev => prev - 1);
      }
    }
  };

  return (
    <div dir={language === "ur" ? "rtl" : "ltr"} className="text-left">
      <div className="page-title">
        <h1>📄 {t("documents") || dTrans.guideTitle}</h1>
        <p>{dTrans.scanDesc}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        
        {/* Main upload options */}
        <div className="card text-center p-4">
          <h3>📷 {dTrans.scanTitle}</h3>
          <p className="small text-secondary mb-4">{dTrans.scanDesc}</p>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            id="camera-capture-input" 
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            id="gallery-upload-input" 
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
            <button type="button" className="secondary-btn p-3" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }} onClick={handleCameraCapture}>
              <Camera size={24} className="text-primary" />
              <span>{dTrans.takePhoto}</span>
            </button>
            <button type="button" className="secondary-btn p-3" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }} onClick={handleGalleryUpload}>
              <ImageIcon size={24} className="text-primary" />
              <span>{dTrans.gallery}</span>
            </button>
            <button type="button" className="secondary-btn p-3" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }} onClick={handleGalleryUpload}>
              <FolderOpen size={24} className="text-primary" />
              <span>{dTrans.uploadFile}</span>
            </button>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="card text-center p-4">
            <div className="spinner mx-auto mb-2"></div>
            <p className="animate-pulse text-primary font-bold">{dTrans.analyzing}</p>
          </div>
        )}

        {/* Document Preview & Recognition HUD */}
        {selectedFile && !isProcessing && (
          <div className="card p-3 border">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4>{dTrans.uploaded}: {selectedFile.name}</h4>
              <button 
                type="button" 
                className="icon-btn text-danger" 
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); setShowHelper(false); }}
              >
                <X size={18} />
              </button>
            </div>
            
            {previewUrl ? (
              <div style={{ margin: "15px 0", textAlign: "center" }}>
                <img src={previewUrl} alt="Preview" style={{ maxHeight: "250px", maxWidth: "100%", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
              </div>
            ) : (
              <div style={{ padding: "30px", background: "#f1f5f9", textAlign: "center", borderRadius: "8px", margin: "15px 0" }}>
                <FileText size={48} className="text-secondary mx-auto mb-2" />
                <span>{selectedFile.type || "PDF File"}</span>
              </div>
            )}

            {/* Recognition Status Banners */}
            {recognitionStatus === "Recognized" && (
              <div className="demo-note success-note text-left mb-2" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", display: "flex", gap: "8px", alignItems: "center" }}>
                <CheckCircle size={18} />
                <span><strong>✓ {dTrans.recognized}: {translateDocType(detectedType)}</strong></span>
              </div>
            )}
            
            {recognitionStatus === "Not Recognized" && (
              <div className="demo-note error-note text-left mb-2" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <AlertTriangle size={18} />
                <span><strong>⚠ {dTrans.unrecognized}</strong>. {dTrans.unrecognizedDesc}</span>
              </div>
            )}

            {recognitionStatus === "Image Unclear" && (
              <div className="demo-note error-note text-left mb-2" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <AlertTriangle size={18} />
                <span><strong>⚠ {dTrans.unclear}</strong>. {dTrans.unclearDesc}</span>
              </div>
            )}

            {recognitionStatus === "Document Type Mismatch" && (
              <div className="demo-note error-note text-left mb-2" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <AlertTriangle size={18} />
                <span><strong>⚠ {dTrans.mismatch}</strong>. {dTrans.mismatchDesc}</span>
              </div>
            )}

            {recognitionStatus === "Recognized" && (
              <button 
                type="button" 
                className="primary mt-3 w-full"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                onClick={() => setShowHelper(true)}
              >
                <HelpCircle size={16} /> 🤖 {dTrans.howToFill}
              </button>
            )}
          </div>
        )}

        {/* AI Form Helper Steps HUD */}
        {showHelper && (
          <div className="card p-4 border animate-slide-up" style={{ background: "#fef8e6", borderColor: "#fef3c7" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: "0" }}>🤖 {dTrans.guideTitle}</h3>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" className="secondary-btn" onClick={handlePlayVoice} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Volume2 size={16} /> {isSpeaking ? dTrans.stopBtn : `🔊 ${dTrans.listenBtn}`}
                </button>
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "15px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="badge" style={{ background: "#fef3c7", color: "#b45309", fontWeight: "800" }}>
                  Step {currentStep} of {activeSteps.length}
                </span>
                <span className="small text-secondary">{dTrans.detected}: {translateDocType(detectedType)}</span>
              </div>

              <h4 style={{ marginTop: "10px", color: "#1e3a5f" }}>{currentStepData.field}</h4>
              
              <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr", gap: "10px" }} className="small text-secondary">
                <p>📍 <strong>{dTrans.where}:</strong> {currentStepData.location}</p>
                <p>✍ <strong>{dTrans.whichField}:</strong> {currentStepData.instruction}</p>
              </div>

              {/* STYLISH CSS DOCUMENT MOCK WITH FIELD ANNOTATION HIGHLIGHTS */}
              <div style={{ marginTop: "20px", padding: "15px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", textAlign: "center" }}>
                <div style={{ 
                  width: "100%", 
                  maxWidth: "320px", 
                  height: "180px", 
                  background: "#ffffff", 
                  border: "2px solid #334155", 
                  borderRadius: "10px", 
                  margin: "0 auto", 
                  position: "relative",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ fontSize: "10px", fontWeight: "700", background: "#0ea5e9", color: "white", padding: "4px", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}>
                    {translateDocType(detectedType)} (Sample / Illustrative Reference)
                  </div>
                  
                  {/* Mock Aadhaar Card Illustration */}
                  {detectedType === "Aadhaar Card" && (
                    <div style={{ padding: "10px", fontSize: "11px", textAlign: "left" }}>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{ width: "40px", height: "50px", background: "#e2e8f0", borderRadius: "4px" }}></div>
                        <div>
                          <div style={{ 
                            fontWeight: "bold", 
                            background: currentStepData.visual === "aadhaar_name" ? "#fef3c7" : "transparent",
                            border: currentStepData.visual === "aadhaar_name" ? "1.5px solid #d97706" : "none",
                            padding: "1px 4px",
                            borderRadius: "2px"
                          }}>
                            Ramesh Kumar
                          </div>
                          
                          <div style={{ 
                            fontSize: "9px", 
                            marginTop: "3px",
                            background: currentStepData.visual === "aadhaar_dob" ? "#fef3c7" : "transparent",
                            border: currentStepData.visual === "aadhaar_dob" ? "1.5px solid #d97706" : "none",
                            padding: "1px 4px",
                            borderRadius: "2px"
                          }}>
                            DOB: 15/08/1980
                          </div>
                          <div style={{ fontSize: "8px", color: "#64748b" }}>Gender: MALE</div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        marginTop: "40px", 
                        textAlign: "center", 
                        fontSize: "14px", 
                        fontWeight: "800",
                        background: currentStepData.visual === "aadhaar_number" ? "#fef3c7" : "transparent",
                        border: currentStepData.visual === "aadhaar_number" ? "1.5px solid #d97706" : "none",
                        padding: "2px",
                        borderRadius: "4px"
                      }}>
                        1234 5678 9012
                      </div>
                    </div>
                  )}

                  {/* Mock PAN Card Illustration */}
                  {detectedType === "PAN Card" && (
                    <div style={{ padding: "10px", fontSize: "11px", textAlign: "left" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "8px", fontWeight: "800", color: "#64748b" }}>INCOME TAX DEPARTMENT</span>
                        <div style={{ width: "25px", height: "25px", background: "#fcd34d", borderRadius: "50%" }}></div>
                      </div>
                      
                      <div style={{ 
                        marginTop: "10px", 
                        fontWeight: "800", 
                        fontSize: "13px",
                        background: currentStepData.visual === "pan_number" ? "#fef3c7" : "transparent",
                        border: currentStepData.visual === "pan_number" ? "1.5px solid #d97706" : "none",
                        padding: "2px",
                        borderRadius: "2px",
                        display: "inline-block"
                      }}>
                        ABCDE1234F
                      </div>
                      
                      <div style={{ marginTop: "10px", fontSize: "9px" }}>
                        <div style={{ color: "#64748b" }}>Name</div>
                        <div style={{ fontWeight: "700" }}>RAMESH KUMAR</div>
                        
                        <div style={{ 
                          marginTop: "2px",
                          background: currentStepData.visual === "pan_father" ? "#fef3c7" : "transparent",
                          border: currentStepData.visual === "pan_father" ? "1.5px solid #d97706" : "none",
                          padding: "1px 2px",
                          borderRadius: "2px"
                        }}>
                          <span style={{ color: "#64748b" }}>Father's Name:</span> <strong style={{ fontSize: "9px" }}>SURESH KUMAR</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* General Mock Document Illustration */}
                  {detectedType !== "Aadhaar Card" && detectedType !== "PAN Card" && (
                    <div style={{ padding: "10px", fontSize: "11px", textAlign: "left" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "8px" }}>OFFICIAL REPORT</span>
                        <span style={{ 
                          background: currentStepData.visual === "gen_ref" ? "#fef3c7" : "transparent",
                          border: currentStepData.visual === "gen_ref" ? "1.5px solid #d97706" : "none",
                          padding: "1px 4px",
                          borderRadius: "2px",
                          fontSize: "9px",
                          fontWeight: "800"
                        }}>
                          REF-992-2026
                        </span>
                      </div>
                      
                      <div style={{ marginTop: "40px", height: "30px", background: "#f1f5f9", borderRadius: "4px" }}></div>
                      
                      <div style={{ 
                        marginTop: "20px", 
                        textAlign: "right",
                        background: currentStepData.visual === "gen_auth" ? "#fef3c7" : "transparent",
                        border: currentStepData.visual === "gen_auth" ? "1.5px solid #d97706" : "none",
                        padding: "1px 4px",
                        borderRadius: "2px",
                        display: "inline-block",
                        float: "right"
                      }}>
                        <span style={{ fontSize: "8px", display: "block" }}>Signed Digitally</span>
                        <strong>Tehsildar Office</strong>
                      </div>
                    </div>
                  )}
                </div>
                <span style={{ display: "block", fontSize: "9.5px", color: "#64748b", marginTop: "10px" }}>
                  * Sample / Illustrative Reference card representation. No real person's document data is reproduced.
                </span>
              </div>
            </div>

            {/* Stepper Navigation Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", gap: "10px" }}>
              <button 
                type="button" 
                className="secondary-btn" 
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                {dTrans.backBtn}
              </button>

              {currentStep < activeSteps.length ? (
                <button 
                  type="button" 
                  className="primary" 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                >
                  {dTrans.confirmBtn}
                </button>
              ) : (
                <button 
                  type="button" 
                  className="primary" 
                  style={{ background: "#16a34a", borderColor: "#16a34a" }}
                  onClick={() => { setShowHelper(false); alert("All fields confirmed!"); }}
                >
                  {dTrans.finishBtn}
                </button>
              )}
            </div>

            {/* Voice Assistant Simulation Box */}
            <div style={{ marginTop: "25px", borderTop: "1px solid #fef3c7", paddingTop: "15px" }}>
              <h4 style={{ fontSize: "14px", display: "flex", gap: "5px", alignItems: "center" }}>
                🎙️ Simulate Citizen Voice Feedback Commands
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                <button type="button" className="text-btn bg-white" style={{ fontSize: "12px", border: "1px solid #cbd5e1" }} onClick={() => handleVoiceCommand("done")}>
                  Say: "Done / Next"
                </button>
                <button type="button" className="text-btn bg-white" style={{ fontSize: "12px", border: "1px solid #cbd5e1" }} onClick={() => handleVoiceCommand("back")}>
                  Say: "Go back"
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <DemoNote>Document verification uses local metadata scanning. Recognized statuses do not constitute official government legal authentication.</DemoNote>
    </div>
  );
}
