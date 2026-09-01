import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";
import { getConversationContext, speakText } from "../services/voiceService";
import VoiceButton from "../components/VoiceButton";
import VoiceWaveform from "../components/VoiceWaveform";
import { VOICE_STATES } from "../services/voiceService";
import { 
  Volume2, RefreshCw, MapPin, PhoneCall, PhoneOff, Check, 
  AlertCircle, Link, Upload, Eye, Mic, MicOff, HelpCircle, RotateCcw,
  ExternalLink, FileText, CheckCircle, ChevronDown, ChevronUp, ShieldCheck
} from "lucide-react";
import DemoNote from "../components/DemoNote";
import Logo from "../components/Logo";

const CALL_LANG_MAP = {
  "te-IN": { code: "te", name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  "hi-IN": { code: "hi", name: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  "ta-IN": { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  "en-IN": { code: "en", name: "English", native: "English", flag: "🇬🇧" }
};

const SILENCE_PROMPTS = {
  "te-IN": "మీరు ఏమీ చెప్పలేదు. దయచేసి మళ్లీ చెప్పండి.",
  "hi-IN": "आपने कुछ नहीं कहा। कृपया दोबारा बोलें।",
  "ta-IN": "நீங்கள் எதுவும் பேசவில்லை. தயவுசெய்து மீண்டும் பேசுங்கள்.",
  "en-IN": "I didn't hear anything. Please speak again."
};

const WELCOME_GREETINGS = {
  "te-IN": "నమస్కారం! జనసేవ వాయిస్ హెల్ప్‌లైన్‌కు స్వాగతం. మీకు ఏ ప్రభుత్వ పథకం లేదా సమస్య గురించి సమాచారం కావాలి? మీరు తెలుగు, హిందీ, తమిళం లేదా ఇంగ్లీషులో మాట్లాడవచ్చు.",
  "hi-IN": "नमस्ते! जनसेवा वॉयस हेल्पलाइन में आपका स्वागत है। आपको किस सरकारी योजना या शिकायत के बारे में जानकारी चाहिए? आप हिंदी, तेलुगु, तमिल या अंग्रेजी में बोल सकते हैं।",
  "ta-IN": "வணக்கம்! ஜனசேவா குரல் உதவி மையத்திற்கு உங்களை வரவேற்கிறோம். உங்களுக்கு எந்த அரசு திட்டம் அல்லது புகார் குறித்து உதவி தேவை? நீங்கள் தமிழ், தெலுங்கு, இந்தி அல்லது ஆங்கிலத்தில் பேசலாம்.",
  "en-IN": "Hello and welcome to JanaSeva Voice Helpline! How can I assist you with government schemes or grievances today? You can speak naturally in Telugu, Hindi, Tamil, or English."
};

function toCallLocale(lang) {
  if (!lang) return "te-IN";
  if (lang.startsWith("te")) return "te-IN";
  if (lang.startsWith("hi")) return "hi-IN";
  if (lang.startsWith("ta")) return "ta-IN";
  return "en-IN";
}

export default function VoicePage() {
  const { language, t, addFeedback, addApplication, user, voiceTab, setVoiceTab } = useApp();
  const voice = useVoiceAssistant();
  const context = getConversationContext();

  const [activeTab, setActiveTab] = useState(voiceTab || "assistant"); // 'assistant' or 'phone_call'

  useEffect(() => {
    if (voiceTab) {
      setActiveTab(voiceTab);
    }
  }, [voiceTab]);

  // Feedback states
  const [feedbackPromptOpen, setFeedbackPromptOpen] = useState(true);
  const [rateFormOpen, setRateFormOpen] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [commentVal, setCommentVal] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Phone Call Simulator States (Voice-First Engine)
  const [callActive, setCallActive] = useState(false);
  const [callState, setCallState] = useState("idle"); // 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'waiting_input' | 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const [callLogs, setCallLogs] = useState([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("te-IN");
  const [micPermissionNotice, setMicPermissionNotice] = useState("");
  const [customCallInput, setCustomCallInput] = useState("");
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [expandedSchemeId, setExpandedSchemeId] = useState(null);

  // Handshake / scanner modal state
  const [callStage, setCallStage] = useState(1);
  const [phoneAppScannerOpen, setPhoneAppScannerOpen] = useState(false);
  const [phoneScanFile, setPhoneScanFile] = useState(null);
  const [phoneFileDetected, setPhoneFileDetected] = useState("");
  const [phoneFieldVal, setPhoneFieldVal] = useState("");

  // Refs for tracking telephony state & avoiding race conditions
  const isCallActiveRef = useRef(false);
  const callSessionIdRef = useRef(`call_${Date.now()}`);
  const activeCallLangRef = useRef("te-IN");
  const recognitionRef = useRef(null);
  const recognitionRunningRef = useRef(false);
  const isTtsSpeakingRef = useRef(false);
  const hasSubmittedTurnRef = useRef(false);
  const capturedFinalRef = useRef("");
  const chatFeedRef = useRef(null);

  // Chat message feed logs state (for assistant tab)
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (voice.transcript) {
      setMessages(prev => {
        const copy = [...prev];
        if (copy.length > 0 && copy[copy.length - 1].sender === "user") {
          copy[copy.length - 1].text = voice.transcript;
          return copy;
        } else {
          return [...copy, { sender: "user", text: voice.transcript }];
        }
      });
    }
  }, [voice.transcript]);

  useEffect(() => {
    if (voice.response) {
      setMessages(prev => {
        if (prev.length > 0 && prev[prev.length - 1].sender === "assistant" && prev[prev.length - 1].text === voice.response) {
          return prev;
        }
        return [...prev, { sender: "assistant", text: voice.response }];
      });
    }
  }, [voice.response]);

  // Auto-scroll call conversation turns
  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [callLogs, liveTranscript, callState]);

  // Timer for active calls
  useEffect(() => {
    let interval = null;
    if (callActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callActive]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      isCallActiveRef.current = false;
      if (recognitionRef.current && recognitionRunningRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRunningRef.current = false;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        isTtsSpeakingRef.current = false;
      }
    };
  }, []);

  // Direct Browser SpeechSynthesis with queue cancellation and explicit language mapping
  const speakWithBrowserTTS = (text, langCode) => {
    return new Promise((resolve) => {
      if (!text || typeof text !== "string" || !text.trim()) {
        return resolve({ spoken: false });
      }

      if (!window.speechSynthesis) {
        console.warn("[JanaSeva Voice ERROR] speechSynthesis not available");
        return resolve({ spoken: false });
      }

      // 1. Cancel any existing TTS to avoid queue blocking
      window.speechSynthesis.cancel();

      isTtsSpeakingRef.current = true;
      setCallState("speaking");

      const utterance = new SpeechSynthesisUtterance(text.trim());

      let targetLang = "en-IN";
      if (langCode?.startsWith("te")) targetLang = "te-IN";
      else if (langCode?.startsWith("hi")) targetLang = "hi-IN";
      else if (langCode?.startsWith("ta")) targetLang = "ta-IN";
      else if (langCode?.startsWith("en")) targetLang = "en-IN";

      utterance.lang = targetLang;
      utterance.rate = 0.9;
      console.log("[JanaSeva Voice] TTS language:", targetLang);

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        isTtsSpeakingRef.current = false;
        console.log("[JanaSeva Voice] TTS ended");
        resolve({ spoken: true });
      };

      utterance.onend = () => {
        finish();
      };

      utterance.onerror = (e) => {
        console.warn("[JanaSeva Voice ERROR] TTS error:", e.error);
        finish();
      };

      // Safety timer in case browser TTS stalls
      const words = text.trim().split(/\s+/).length;
      const maxTimeout = Math.max(6000, words * 600);
      setTimeout(() => {
        if (!finished) {
          try { window.speechSynthesis.cancel(); } catch (e) {}
          finish();
        }
      }, maxTimeout);

      window.speechSynthesis.speak(utterance);
    });
  };

  const endPhoneCall = () => {
    isCallActiveRef.current = false;
    setCallActive(false);
    setCallState("ended");
    setLiveTranscript("");
    hasSubmittedTurnRef.current = false;
    capturedFinalRef.current = "";

    if (recognitionRef.current && recognitionRunningRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRunningRef.current = false;
    }
    recognitionRef.current = null;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      isTtsSpeakingRef.current = false;
    }

    fetch("/api/voice/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId: callSessionIdRef.current })
    }).catch(() => {});
  };

  const startListeningTurn = () => {
    if (!isCallActiveRef.current) return;
    if (isTtsSpeakingRef.current) return;
    if (recognitionRunningRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicPermissionNotice("Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      setCallState("waiting_input");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      // Requirement 3: continuous = false, interimResults = true
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = activeCallLangRef.current || "te-IN";
      recognitionRef.current = recognition;

      capturedFinalRef.current = "";
      hasSubmittedTurnRef.current = false;
      setLiveTranscript("");

      recognition.onstart = () => {
        recognitionRunningRef.current = true;
        setCallState("listening");
        console.log("[JanaSeva Voice] Recognition started");
      };

      recognition.onresult = (event) => {
        let interim = "";
        let final = "";

        // Requirement 4: Iterate through all relevant results
        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (!res || !res[0]) continue;
          const seg = res[0].transcript || "";
          if (res.isFinal) {
            final += (final ? " " : "") + seg;
          } else {
            interim += (interim ? " " : "") + seg;
          }
        }

        const candidate = (final ? final + (interim ? " " : "") + interim : interim).trim();
        capturedFinalRef.current = (final || candidate).trim();
        console.log("[JanaSeva Voice] Raw result:", candidate);

        if (candidate) {
          setLiveTranscript(candidate);
        }
      };

      recognition.onerror = (event) => {
        console.error("[JanaSeva Voice ERROR] recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setMicPermissionNotice("Microphone permission is required for voice conversation. Please allow microphone access or use the text input.");
          setCallState("waiting_input");
        }
      };

      recognition.onend = () => {
        recognitionRunningRef.current = false;
        if (!isCallActiveRef.current) return;
        // Requirement 5: Prevent duplicate submissions
        if (hasSubmittedTurnRef.current) return;

        const finalSpeech = (capturedFinalRef.current || "").replace(/\s+/g, " ").trim();
        setLiveTranscript("");

        if (finalSpeech.length > 0) {
          hasSubmittedTurnRef.current = true;
          console.log("[JanaSeva Voice] Final transcript:", finalSpeech);
          processUserSpeechTurn(finalSpeech);
        } else {
          console.log("[JanaSeva Voice] Empty transcript received");
          const silenceMsg = activeCallLangRef.current.startsWith("hi")
            ? "क्षमा करें, आपकी बात समझ नहीं आई। कृपया दोबारा कहें।"
            : activeCallLangRef.current.startsWith("ta")
            ? "மன்னிக்கவும், உங்கள் பேச்சு தெளிவாக புரியவில்லை. மீண்டும் சொல்லுங்கள்."
            : activeCallLangRef.current.startsWith("en")
            ? "Sorry, I couldn't understand that. Please say it again."
            : "Sorry, mee maatlu sarigga ardham kaaledu. Mallee konchem clear ga cheppandi.";
          setMicPermissionNotice(silenceMsg);
          setCallState("waiting_input");
        }
      };

      recognition.start();
    } catch (err) {
      recognitionRunningRef.current = false;
      console.error("[JanaSeva Voice ERROR] recognition error:", err);
      if (err.name !== "InvalidStateError") {
        setCallState("waiting_input");
      }
    }
  };

  const processUserSpeechTurn = async (userText) => {
    if (!userText || !userText.trim()) return;
    const cleanText = userText.replace(/\s+/g, " ").trim();

    setCallLogs(prev => [
      ...prev,
      {
        sender: "user",
        text: cleanText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setLiveTranscript("");
    setMicPermissionNotice("");
    setCallState("processing");

    console.log("[JanaSeva Voice] AI request:", cleanText);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch("/api/voice/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callId: callSessionIdRef.current,
          text: cleanText,
          language: activeCallLangRef.current
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI API returned HTTP status ${response.status}`);
      }

      const data = await response.json();
      console.log("[JanaSeva Voice] AI response:", data.response);

      if (data && data.response) {
        if (data.detectedLanguage) {
          activeCallLangRef.current = data.detectedLanguage;
          setDetectedLanguage(data.detectedLanguage);
          console.log("[JanaSeva Voice] Detected language:", data.detectedLanguage);
        }

        if (data.recommendations && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
          setRecommendedSchemes(data.recommendations);
          setExpandedSchemeId(prev => prev || data.recommendations[0]?.schemeId || data.recommendations[0]?.id);
        }
        if (data.profile) {
          setUserProfile(data.profile);
        }

        setCallLogs(prev => [
          ...prev,
          {
            sender: "agent",
            text: data.response,
            lang: data.detectedLanguage || activeCallLangRef.current,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);

        await speakWithBrowserTTS(data.response, data.detectedLanguage || activeCallLangRef.current);

        if (data.isEndCall) {
          endPhoneCall();
        } else if (isCallActiveRef.current) {
          startListeningTurn();
        }
      } else {
        throw new Error("No response field received from AI service");
      }
    } catch (err) {
      console.error("[JanaSeva Voice ERROR] AI request error:", err);
      const fallbackMsg = activeCallLangRef.current.startsWith("hi")
        ? "क्षमा करें, आपकी बात समझ नहीं आई। कृपया दोबारा कहें।"
        : activeCallLangRef.current.startsWith("ta")
        ? "மன்னிக்கவும், உங்கள் பேச்சு தெளிவாக புரியவில்லை. மீண்டும் சொல்லுங்கள்."
        : activeCallLangRef.current.startsWith("en")
        ? "Sorry, I couldn't understand that. Please say it again."
        : "Sorry, mee maatlu sarigga ardham kaaledu. Mallee konchem clear ga cheppandi.";

      setCallLogs(prev => [
        ...prev,
        {
          sender: "agent",
          text: fallbackMsg,
          lang: activeCallLangRef.current,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      await speakWithBrowserTTS(fallbackMsg, activeCallLangRef.current);
      if (isCallActiveRef.current) {
        startListeningTurn();
      }
    }
  };

  const handleSimulateUserSpeech = async (userSays) => {
    if (!userSays || !userSays.trim()) return;
    const cleanText = userSays.trim();
    setCustomCallInput("");

    if (recognitionRef.current && recognitionRunningRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRunningRef.current = false;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      isTtsSpeakingRef.current = false;
    }

    if (!isCallActiveRef.current) {
      isCallActiveRef.current = true;
      setCallActive(true);
      callSessionIdRef.current = `call_${Date.now()}`;
      setCallLogs([]);
      setCallDuration(0);
      const initialLang = toCallLocale(language);
      activeCallLangRef.current = initialLang;
      setDetectedLanguage(initialLang);
    }

    await processUserSpeechTurn(cleanText);
  };

  const startPhoneCall = async () => {
    console.debug("[JanaSeva Diagnostic] MIC REQUESTED");
    isCallActiveRef.current = true;
    setCallActive(true);
    setCallState("connecting");
    setCallLogs([]);
    setLiveTranscript("");
    setMicPermissionNotice("");
    hasSubmittedTurnRef.current = false;
    capturedFinalRef.current = "";
    callSessionIdRef.current = `call_${Date.now()}`;

    const initialLang = toCallLocale(language);
    activeCallLangRef.current = initialLang;
    setDetectedLanguage(initialLang);

    let micGranted = true;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        console.debug("[JanaSeva Diagnostic] MIC PERMISSION RESULT: granted");
      }
    } catch (err) {
      console.warn("[JanaSeva Diagnostic] MIC PERMISSION RESULT: denied/unavailable", err);
      micGranted = false;
      setMicPermissionNotice("Microphone permission is required for voice conversation. Please allow microphone access or use the text input.");
    }

    const greeting = WELCOME_GREETINGS[initialLang] || WELCOME_GREETINGS["te-IN"];
    setCallLogs([
      {
        sender: "agent",
        text: greeting,
        lang: initialLang,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);

    await speakWithBrowserTTS(greeting, initialLang);

    if (isCallActiveRef.current) {
      if (micGranted) {
        startListeningTurn();
      } else {
        setCallState("waiting_input");
      }
    }
  };

  const handlePhoneFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhoneScanFile(file);
    setTimeout(() => {
      setPhoneFileDetected("Aadhaar Card");
      setCallStage(3);
      speakWithBrowserTTS("I see your Aadhaar card is uploaded successfully. Now look at the 12-digit number at the front and fill it in the box on your screen, then tell me when you are done.", "en-IN");
    }, 1500);
  };

  const getTitle = () => {
    switch (voice.state) {
      case VOICE_STATES.LISTENING:
        return t("listening");
      case VOICE_STATES.PROCESSING:
        return t("processing");
      case VOICE_STATES.FINDING_LOCATION:
        return `📍 ${t("findingLocationTitle")}`;
      case VOICE_STATES.RESPONSE:
        return t("response");
      default:
        return `🎤 ${t("appName")}`;
    }
  };

  const getDesc = () => {
    switch (voice.state) {
      case VOICE_STATES.LISTENING:
        return t("listeningDesc");
      case VOICE_STATES.PROCESSING:
        return t("processingDesc");
      case VOICE_STATES.FINDING_LOCATION:
        return t("findingLocationDesc");
      case VOICE_STATES.RESPONSE:
        return t("responseDesc");
      default:
        return t("askPrompt");
    }
  };

  const langLabels = {
    en: "English", te: "తెలుగు", hi: "हिंदी", ta: "தமிழ்", kn: "ಕನ್ನಡ", ml: "മലയാളം", mr: "मराठी", bn: "বাংলা", gu: "ગુજરાતી", pa: "ਪੰਜਾਬੀ", or: "ଓଡ଼ିଆ", as: "অসমীয়া", ur: "اردو"
  };

  const handleHelpfulness = (val) => {
    addFeedback({
      type: "scheme",
      schemeName: context.category ? `${context.category} Inquiry` : "General Voice Inquiry",
      helpfulness: val
    });
    alert(t("thankYouFeedback") || "Thank you for your feedback!");
    setFeedbackPromptOpen(false);
  };

  const handleAppFeedback = (e) => {
    e.preventDefault();
    addFeedback({
      type: "app",
      rating: ratingVal,
      comment: commentVal
    });
    setRateFormOpen(false);
    setFeedbackSubmitted(true);
    alert(t("thankYouExperience") || "Thank you for sharing your experience!");
  };

  return (
    <div dir={language === "ur" ? "rtl" : "ltr"}>
      <div className="page-title">
        <h1>🎙️ Voice Helpline</h1>
        <p>Talk directly with the JanaSeva Voice AI assistant or simulate a telephone agent phone call experience.</p>
      </div>

      {/* Tabs segment */}
      <div style={{ display: "flex", gap: "5px", background: "#f1f5f9", padding: "4px", borderRadius: "8px", marginBottom: "20px" }}>
        <button
          type="button"
          className="text-btn"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            background: activeTab === "assistant" ? "#ffffff" : "transparent",
            color: activeTab === "assistant" ? "#0ea5e9" : "#64748b",
            fontWeight: "700"
          }}
          onClick={() => { setActiveTab("assistant"); setVoiceTab("assistant"); endPhoneCall(); }}
        >
          🗣️ Web Voice Assistant
        </button>
        <button
          type="button"
          className="text-btn"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            background: activeTab === "phone_call" ? "#ffffff" : "transparent",
            color: activeTab === "phone_call" ? "#0ea5e9" : "#64748b",
            fontWeight: "700"
          }}
          onClick={() => { setActiveTab("phone_call"); setVoiceTab("phone_call"); }}
        >
          📞 Call JanaSeva (Phone Simulator)
        </button>
      </div>

      {/* TAB 1: Voice Assistant */}
      {activeTab === "assistant" && (
        <div className="card voice-page-card text-center">
          <div className="voice-header-meta">
            <span className="badge">{t("activeLangLabel")}: {langLabels[language] || "English"}</span>
          </div>

          <h2 className="voice-state-title mt-2">{getTitle()}</h2>
          <p className="voice-state-desc">{getDesc()}</p>

          <VoiceWaveform active={voice.isListening || voice.isProcessing || voice.isFindingLocation} />

          <VoiceButton
            listening={voice.isListening}
            processing={voice.isProcessing || voice.isFindingLocation}
            onClick={voice.activate}
            label={
              voice.isListening 
                ? `${t("listening") || "Listening..."} ("మీరు మాట్లాడండి...")`
                : voice.isProcessing || voice.isFindingLocation
                  ? `${t("processing") || "Understanding..."}`
                  : `${t("tapToSpeak") || "Tap to Speak"}`
            }
          />

          {/* Clean scrolling chat conversation list */}
          <div className="chat-messages-container" style={{
            margin: "20px 0",
            padding: "15px",
            background: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            minHeight: "200px",
            maxHeight: "350px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            {messages.length === 0 && (
              <div style={{ color: "#64748b", margin: "auto", fontSize: "14px" }}>
                🎤 Tap the microphone button above and start speaking to search schemes.
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                textAlign: "left"
              }}>
                <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "3px" }}>
                  {msg.sender === "user" ? `🗣️ ${t("you") || "You"}` : `🤖 ${t("assistant") || "Assistant"}`}
                </span>
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: msg.sender === "user" ? "#0ea5e9" : "#ffffff",
                  color: msg.sender === "user" ? "#ffffff" : "#1e293b",
                  border: msg.sender === "user" ? "none" : "1px solid #e2e8f0",
                  whiteSpace: "pre-wrap",
                  fontSize: "15px"
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {voice.locationResults && voice.locationResults.length > 0 && (
            <div className="location-results-box mt-4 text-left card p-3" style={{ background: "#f8fafc" }}>
              <h4 style={{ display: "flex", gap: "8px", alignItems: "center", margin: "0 0 10px 0" }}>
                <MapPin size={18} className="text-primary" />
                <span>{t("nearbyCenters")}</span>
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {voice.locationResults.map((center, idx) => (
                  <div key={idx} className="card p-3 bg-white border">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <strong>{center.name} ({center.distance.toFixed(1)} km away)</strong>
                      <span className="badge">{center.type}</span>
                    </div>
                    <p className="small text-secondary mb-1" style={{ margin: "5px 0" }}>{center.address}</p>
                    <p className="small text-success mb-2" style={{ margin: "0 0 8px 0" }}>{t("openHours")}</p>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ' + center.address)}`}
                      target="_blank" rel="noreferrer" className="text-btn text-success" style={{ fontWeight: "700", textDecoration: "none" }}
                    >
                      📍 {t("directions")}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

              {feedbackPromptOpen && (
                <div className="card mt-3 p-3 bg-light border-warning text-left animate-slide-up">
                  <h4 style={{ margin: "0 0 8px 0" }}>💬 {t("wasHelpful")}</h4>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <button type="button" className="secondary-btn" onClick={() => handleHelpfulness("helpful")}>{t("helpful")}</button>
                    <button type="button" className="secondary-btn" onClick={() => handleHelpfulness("somewhat")}>{t("somewhat")}</button>
                    <button type="button" className="secondary-btn" onClick={() => handleHelpfulness("notHelpful")}>{t("notHelpful")}</button>
                  </div>
                  <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: "8px" }}>
                    <p className="small mb-2">{t("askFeedback")}</p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="button" className="primary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => setRateFormOpen(true)}>{t("giveFeedbackBtn")}</button>
                      <button type="button" className="secondary-btn" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => setFeedbackPromptOpen(false)}>{t("skipBtn")}</button>
                    </div>
                  </div>
                </div>
              )}

              {rateFormOpen && (
                <div className="card mt-3 p-3 text-left animate-slide-up">
                  <h3>💬 {t("appFeedbackTitle")}</h3>
                  <form onSubmit={handleAppFeedback} className="admin-form mt-2">
                    <div>
                      <label>{t("ratingLabel")}</label>
                      <select value={ratingVal} onChange={(e) => setRatingVal(parseInt(e.target.value))}>
                        <option value="5">⭐⭐⭐⭐⭐ ({t("excellent")})</option>
                        <option value="4">⭐⭐⭐⭐ ({t("good")})</option>
                        <option value="3">⭐⭐⭐ ({t("average")})</option>
                        <option value="2">⭐⭐ ({t("poor")})</option>
                        <option value="1">⭐ ({t("veryBad")})</option>
                      </select>
                    </div>
                    <div>
                      <label>{t("commentLabel")}</label>
                      <textarea value={commentVal} onChange={(e) => setCommentVal(e.target.value)} placeholder={t("commentPlaceholder")} rows="2" />
                    </div>
                    <div style={{ display: "flex", gap: "8px" }} className="mt-2">
                      <button type="submit" className="primary">{t("submitFeedback")}</button>
                      <button type="button" className="secondary-btn" onClick={() => setRateFormOpen(false)}>{t("cancelBtn")}</button>
                    </div>
                  </form>
                </div>
              )}


          {voice.error && <div className="demo-note error-note mt-3">{voice.error}</div>}

          <div className="context-visualizer card mt-4 text-left">
            <h3>🧠 {t("contextTitle")}</h3>
            <p className="text-secondary small">{t("contextSub")}</p>
            <div className="context-grid mt-2">
              <div className="context-chip"><strong>{t("contextState")}:</strong> <span>{context.state || t("notSpecified")}</span></div>
              <div className="context-chip"><strong>{t("contextAge")}:</strong> <span>{context.age || t("notSpecified")}</span></div>
              <div className="context-chip"><strong>{t("contextOccupation")}:</strong> <span>{context.occupation || t("notSpecified")}</span></div>
              <div className="context-chip"><strong>{t("contextCategory")}:</strong> <span>{context.category || t("notSpecified")}</span></div>
            </div>
          </div>
          <DemoNote>{t("demoMicDisclaimer")}</DemoNote>
        </div>
      )}

      {/* TAB 2: Helpline Phone Call Mode */}
      {activeTab === "phone_call" && (
        <div className="card text-center p-4">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
            <Logo size={28} showText={false} />
            <h2 style={{ margin: 0, fontSize: "22px", color: "#0f172a" }}>JanaSeva AI</h2>
          </div>
          <hr style={{ margin: "15px 0", borderColor: "#e2e8f0" }} />

          {!callActive ? (
            <div className="py-4">
              <div style={{ maxWidth: "420px", margin: "0 auto", textAlign: "center" }}>
                <div style={{ display: "inline-block", padding: "16px", borderRadius: "50%", background: "#f0fdf4", marginBottom: "14px" }}>
                  <PhoneCall size={52} className="text-success" />
                </div>
                <p className="text-secondary small mb-4" style={{ fontSize: "15px" }}>
                  Connect to JanaSeva Voice AI helpline using your microphone.
                </p>

                {micPermissionNotice && (
                  <div className="card p-3 mb-3 border-warning text-left" style={{ background: "#fffbeb", borderLeft: "4px solid #f59e0b" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <AlertCircle size={18} className="text-warning" />
                      <span style={{ fontSize: "13px", color: "#92400e", fontWeight: "600" }}>{micPermissionNotice}</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="primary"
                  style={{
                    padding: "12px 32px",
                    fontSize: "18px",
                    borderRadius: "10px",
                    background: "#16a34a",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 4px 14px rgba(22, 163, 74, 0.25)",
                    cursor: "pointer"
                  }}
                  onClick={startPhoneCall}
                >
                  <PhoneCall size={20} /> <b>Start Phone Call</b>
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in text-left">
              {/* Call HUD Card */}
              <div style={{
                background: "#ffffff",
                padding: "16px 20px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                marginBottom: "16px"
              }}>
                {/* Top Row: Title, Connected Pill, Duration, End Call */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Logo size={24} showText={false} />
                    <strong style={{ fontSize: "16px", color: "#0f172a" }}>JanaSeva AI</strong>
                    <span className="badge" style={{ background: "#dcfce7", color: "#166534", fontSize: "11px", fontWeight: "700" }}>
                      ● AI Connected
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: "14px", color: "#64748b" }}>
                      Call Duration: <strong style={{ color: "#0f172a" }}>{Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, "0")}</strong>
                    </div>
                    <button
                      type="button"
                      className="secondary-btn"
                      style={{
                        background: "#fee2e2",
                        borderColor: "#f87171",
                        color: "#b91c1c",
                        fontWeight: "700",
                        padding: "6px 14px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        borderRadius: "8px"
                      }}
                      onClick={() => endPhoneCall()}
                    >
                      <PhoneOff size={16} /> 🔴 End Call
                    </button>
                  </div>
                </div>

                {/* Sub Row: Voice Status Badge & Detected Language */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="small text-secondary">Status:</span>
                    {callState === "connecting" && (
                      <span className="badge" style={{ background: "#fef3c7", color: "#92400e" }}>⏳ Connecting...</span>
                    )}
                    {callState === "listening" && (
                      <span className="badge animate-pulse" style={{ background: "#dcfce7", color: "#15803d", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Mic size={14} /> 🎙️ Listening... Speak naturally
                      </span>
                    )}
                    {callState === "processing" && (
                      <span className="badge animate-pulse" style={{ background: "#fef3c7", color: "#92400e", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        🧠 Understanding...
                      </span>
                    )}
                    {callState === "speaking" && (
                      <span className="badge animate-pulse" style={{ background: "#e0f2fe", color: "#0369a1", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Volume2 size={14} /> 🔊 JanaSeva AI is speaking...
                      </span>
                    )}
                    {callState === "waiting_input" && (
                      <span className="badge" style={{ background: "#f1f5f9", color: "#475569" }}>
                        ⏸️ Waiting for input
                      </span>
                    )}
                    {callState === "ended" && (
                      <span className="badge" style={{ background: "#fee2e2", color: "#b91c1c" }}>
                        🔴 Call Ended
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="small text-secondary">Detected Language:</span>
                    <span className="badge" style={{ background: "#f3e8ff", color: "#7e22ce", fontWeight: "700" }}>
                      {CALL_LANG_MAP[detectedLanguage]?.flag || "🌐"} {CALL_LANG_MAP[detectedLanguage]?.name} ({CALL_LANG_MAP[detectedLanguage]?.native})
                    </span>
                  </div>
                </div>
              </div>

              {/* Permission notice if mic was blocked */}
              {micPermissionNotice && (
                <div className="card p-3 mb-3 border-warning text-left" style={{ background: "#fffbeb", borderLeft: "4px solid #f59e0b" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={18} className="text-warning" />
                    <span style={{ fontSize: "13px", color: "#92400e", fontWeight: "600" }}>
                      {micPermissionNotice}
                    </span>
                  </div>
                </div>
              )}

              {/* Live User Speech Indicator Box */}
              {callState === "listening" && (
                <div style={{
                  background: "#f0fdf4",
                  border: "2px solid #86efac",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  marginBottom: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <strong style={{ color: "#166534", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Mic size={16} className="animate-pulse" /> 🗣️ You (speaking now):
                    </strong>
                    <span style={{ fontSize: "12px", color: "#15803d", fontStyle: "italic" }}>
                      Pause speaking for ~1.8s to submit automatically
                    </span>
                  </div>
                  <div style={{ fontSize: "17px", color: "#14532d", fontWeight: "600", minHeight: "24px" }}>
                    {liveTranscript ? `"${liveTranscript}"` : <span style={{ color: "#86efac", fontWeight: "normal" }}>Say something in Telugu, Hindi, Tamil, or English...</span>}
                  </div>
                </div>
              )}

              {/* Conversation Feed */}
              <div
                ref={chatFeedRef}
                style={{
                  margin: "12px 0 16px 0",
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  maxHeight: "320px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                {callLogs.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: log.sender === "agent" ? "flex-start" : "flex-end"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: log.sender === "agent" ? "#0284c7" : "#0f766e", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {log.sender === "agent" ? (
                          <>
                            <Logo size={15} showText={false} /> JanaSeva AI:
                          </>
                        ) : (
                          "🗣️ You:"
                        )}
                      </span>
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>{log.time}</span>
                    </div>
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "12px",
                        background: log.sender === "agent" ? "#ffffff" : "#0284c7",
                        color: log.sender === "agent" ? "#1e293b" : "#ffffff",
                        maxWidth: "85%",
                        fontSize: "15px",
                        lineHeight: "1.5",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        border: log.sender === "agent" ? "1px solid #e2e8f0" : "none"
                      }}
                    >
                      {log.text}
                    </div>
                  </div>
                ))}

                {callState === "processing" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#92400e", fontSize: "13px", padding: "8px" }}>
                    <div className="animate-spin" style={{ width: "16px", height: "16px", border: "2px solid #d97706", borderTopColor: "transparent", borderRadius: "50%" }} />
                    <span>🧠 JanaSeva AI is searching government welfare records...</span>
                  </div>
                )}
              </div>

              {/* Recommended Government Schemes Card (JanaSeva Profile Match) */}
              {recommendedSchemes && recommendedSchemes.length > 0 && (
                <div style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "2px solid #0284c7",
                  padding: "18px 20px",
                  marginBottom: "16px",
                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.12)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "20px" }}>🎯</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "17px", color: "#0f172a", fontWeight: "700" }}>
                          Recommended Government Schemes
                        </h3>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          JanaSeva Profile Match — Based on your spoken profile details
                        </span>
                      </div>
                    </div>
                    <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1", fontWeight: "700", fontSize: "12px" }}>
                      {recommendedSchemes.length} Scheme{recommendedSchemes.length > 1 ? "s" : ""} Evaluated
                    </span>
                  </div>

                  {userProfile && (userProfile.age || userProfile.occupation || userProfile.state) && (
                    <div style={{
                      background: "#f8fafc",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      marginBottom: "12px",
                      fontSize: "13px",
                      color: "#475569",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                      alignItems: "center"
                    }}>
                      <strong style={{ color: "#1e293b" }}>Profile Identified:</strong>
                      {userProfile.age && <span>Age: <b>{userProfile.age} yrs{userProfile.ageApproximate ? " (approx)" : ""}</b></span>}
                      {userProfile.state && <span>State: <b>{userProfile.state}</b></span>}
                      {userProfile.occupation && <span>Occupation: <b style={{ textTransform: "capitalize" }}>{userProfile.occupation.replace("_", " ")}</b></span>}
                      {userProfile.annualIncome !== null && userProfile.annualIncome !== undefined && (
                        <span>Income: <b>₹{userProfile.annualIncome.toLocaleString("en-IN")}/yr</b></span>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {recommendedSchemes.map((item, idx) => {
                      const sId = item.schemeId || item.id || `rec_${idx}`;
                      const isExpanded = expandedSchemeId === sId;
                      const isEligible = item.status === "eligible";
                      const isPossible = item.status === "possibly_eligible";

                      return (
                        <div
                          key={sId}
                          style={{
                            border: isEligible ? "1px solid #86efac" : isPossible ? "1px solid #fde047" : "1px solid #e2e8f0",
                            borderRadius: "10px",
                            background: isEligible ? "#f0fdf4" : isPossible ? "#fffbeb" : "#f8fafc",
                            padding: "14px",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                            <div style={{ flex: "1 1 280px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                                <span
                                  className="badge"
                                  style={{
                                    background: isEligible ? "#dcfce7" : isPossible ? "#fef3c7" : "#fee2e2",
                                    color: isEligible ? "#15803d" : isPossible ? "#92400e" : "#b91c1c",
                                    fontWeight: "700",
                                    fontSize: "12px"
                                  }}
                                >
                                  {item.statusLabel || (isEligible ? "✅ Eligible" : isPossible ? "⚠️ Possibly eligible" : "❌ Not eligible")}
                                </span>
                                <span className="badge" style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", fontSize: "11px", fontWeight: "600" }}>
                                  JanaSeva Match Score: {item.matchScore || 85}%
                                </span>
                              </div>
                              <h4 style={{ margin: "4px 0", fontSize: "16px", color: "#0f172a", fontWeight: "700" }}>
                                {item.schemeName || item.name}
                              </h4>
                              <p style={{ margin: "4px 0", fontSize: "14px", color: "#334155", lineHeight: "1.4" }}>
                                <b>Benefits:</b> {item.benefits}
                              </p>
                              {item.eligibility && (
                                <p style={{ margin: "4px 0", fontSize: "13px", color: "#475569", lineHeight: "1.4" }}>
                                  <b>Eligibility Criteria:</b> {item.eligibility}
                                </p>
                              )}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                              {item.applicationUrl && (
                                <a
                                  href={item.applicationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    background: "#0284c7",
                                    color: "#ffffff",
                                    padding: "7px 14px",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)"
                                  }}
                                >
                                  <ExternalLink size={14} /> Official Website (.gov.in)
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => setExpandedSchemeId(isExpanded ? null : sId)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#0369a1",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "4px 6px"
                                }}
                              >
                                {isExpanded ? <><ChevronUp size={15} /> Less Details</> : <><ChevronDown size={15} /> View Documents & Steps</>}
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div style={{
                              marginTop: "12px",
                              paddingTop: "12px",
                              borderTop: "1px solid rgba(0,0,0,0.08)",
                              fontSize: "13px",
                              color: "#334155"
                            }}>
                              {item.requiredDocuments && item.requiredDocuments.length > 0 && (
                                <div style={{ marginBottom: "10px" }}>
                                  <strong style={{ color: "#0f172a", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                    <FileText size={14} className="text-primary" /> Required Documents:
                                  </strong>
                                  <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
                                    {item.requiredDocuments.map((doc, dIdx) => (
                                      <li key={dIdx} style={{ margin: "2px 0" }}>{doc}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {item.applicationSteps && item.applicationSteps.length > 0 && (
                                <div style={{ marginBottom: "10px" }}>
                                  <strong style={{ color: "#0f172a" }}>🚶 How to Apply:</strong>
                                  <ol style={{ margin: "4px 0 0 18px", padding: 0 }}>
                                    {item.applicationSteps.map((step, sIdx) => (
                                      <li key={sIdx} style={{ margin: "2px 0" }}>{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}

                              <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "8px",
                                fontSize: "12px",
                                color: "#64748b",
                                marginTop: "8px",
                                paddingTop: "8px",
                                borderTop: "1px dashed #cbd5e1"
                              }}>
                                <span>🏛️ <b>Official Source:</b> {item.officialSource || "Govt Department"}</span>
                                <span>📅 <b>Last Verified:</b> {item.lastVerified || "2026-08"}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{
                    marginTop: "14px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "#f1f5f9",
                    fontSize: "12px",
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <ShieldCheck size={16} className="text-primary" style={{ flexShrink: 0 }} />
                    <span>
                      <b>Official Notice:</b> Based on the information provided, you appear eligible. The respective government department is the final authority for scheme approval and disbursement.
                    </span>
                  </div>
                </div>
              )}

              {/* Senior Citizen Quick Action Controls */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                {(callState === "waiting_input" || callState === "ended") && (
                  <button
                    type="button"
                    className="primary"
                    style={{ padding: "10px 18px", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "8px", background: "#16a34a" }}
                    onClick={() => startListeningTurn()}
                  >
                    <Mic size={18} /> <b>🎙️ Speak Now</b>
                  </button>
                )}
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ padding: "10px 16px", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={() => handleSimulateUserSpeech("మళ్లీ చెప్పు")}
                >
                  <RotateCcw size={16} /> <b>🔁 Repeat</b> ("మళ్లీ చెప్పు")
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ padding: "10px 16px", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={() => handleSimulateUserSpeech("స్లోగా చెప్పు")}
                >
                  🐢 <b>Slow</b> ("స్లోగా చెప్పు")
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ padding: "10px 16px", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={() => handleSimulateUserSpeech("సహాయం కావాలి")}
                >
                  <HelpCircle size={16} /> <b>❓ Help</b> ("సహాయం")
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ padding: "10px 16px", fontSize: "14px", background: "#fee2e2", borderColor: "#f87171", color: "#b91c1c", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={() => endPhoneCall()}
                >
                  <PhoneOff size={16} /> <b>🔴 End Call</b> ("కాల్ ఎండ్ చెయ్యి")
                </button>
              </div>

              {/* Fallback Testing Section */}
              <div className="card p-3 bg-light border-info text-left">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", color: "#0369a1" }}>⌨️ Type to test without microphone</h4>
                  <span className="small text-secondary">Fallback / Testing option</span>
                </div>
                <p className="small text-secondary mb-3">
                  Click any sample inquiry or type text below to test multilingual conversation without speaking:
                </p>

                {/* Quick Utterance Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  <button type="button" className="secondary-btn" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleSimulateUserSpeech("Farmer ki em schemes unnayi?")}>
                    🌾 <b>Code-Mixed:</b> Farmer ki em schemes unnayi?
                  </button>
                  <button type="button" className="secondary-btn" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleSimulateUserSpeech("Age 65, Andhra Pradesh, senior citizen, pension schemes kavali.")}>
                    👵 <b>Senior Profile:</b> Age 65, AP Pension
                  </button>
                  <button type="button" className="secondary-btn" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleSimulateUserSpeech("Student ni, college chaduvutunna, income 1 lakh, scholarship kavali.")}>
                    🎓 <b>Student:</b> Scholarship Eligibility
                  </button>
                  <button type="button" className="secondary-btn" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleSimulateUserSpeech("PM Kisan ki apply ela cheyyali?")}>
                    📋 <b>Apply:</b> PM Kisan apply ela cheyyali?
                  </button>
                  <button type="button" className="secondary-btn" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleSimulateUserSpeech("PM Kisan documents enti?")}>
                    📄 <b>Docs:</b> PM Kisan documents enti?
                  </button>
                  <button type="button" className="secondary-btn" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleSimulateUserSpeech("Na pension status check cheyyali.")}>
                    🔍 <b>Pension Status:</b> స్టేటస్ చెక్
                  </button>
                  <button type="button" className="secondary-btn" style={{ fontSize: "12px", padding: "6px 12px", background: "#fef2f2", borderColor: "#fca5a5" }} onClick={() => handleSimulateUserSpeech("Na pension issue undi complaint ivvali.")}>
                    📢 <b>Grievance:</b> ఫిర్యాదు నమోదు
                  </button>
                  <button type="button" className="secondary-btn" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleSimulateUserSpeech("మళ్లీ చెప్పు")}>
                    🔁 <b>Repeat:</b> మళ్లీ చెప్పు
                  </button>
                  <button type="button" className="secondary-btn" style={{ fontSize: "12px", padding: "6px 12px", background: "#fee2e2", borderColor: "#f87171", color: "#b91c1c" }} onClick={() => handleSimulateUserSpeech("కాల్ ఎండ్ చెయ్యి")}>
                    🚪 <b>End:</b> కాల్ ఎండ్ చెయ్యి
                  </button>
                </div>

                {/* Custom Speech Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customCallInput.trim()) {
                      handleSimulateUserSpeech(customCallInput.trim());
                    }
                  }}
                  style={{ display: "flex", gap: "8px" }}
                >
                  <input
                    type="text"
                    value={customCallInput}
                    onChange={(e) => setCustomCallInput(e.target.value)}
                    placeholder="Type any inquiry in Telugu, Hindi, Tamil, or English..."
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                  <button type="submit" className="primary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                    Send Inquiry
                  </button>
                </form>
              </div>

              {/* Handshake / Secure Scan Window helper preserved */}
              {phoneAppScannerOpen && callStage < 5 && (
                <div className="card mt-3 p-3 border text-left bg-white">
                  <h3>📷 Camera / Gallery Document Scan</h3>
                  <p className="small text-secondary mb-3">Secure verification link: <code>https://janaseva.gov.in/verify/handshake</code></p>
                  
                  {!phoneScanFile ? (
                    <div style={{ position: "relative" }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="call-file-upload" 
                        style={{ display: "none" }}
                        onChange={handlePhoneFileUpload} 
                      />
                      <label 
                        htmlFor="call-file-upload"
                        style={{ display: "flex", flexDirection: "column", gap: "8px", border: "2px dashed #cbd5e1", borderRadius: "8px", padding: "20px", cursor: "pointer", textAlign: "center" }}
                      >
                        <Upload size={24} className="mx-auto text-secondary" />
                        <span>Choose Aadhaar Card Photo</span>
                      </label>
                    </div>
                  ) : (
                    <div className="demo-note success-note" style={{ background: "#f0fdf4", color: "#166534" }}>
                      <strong>✓ Document detected: {phoneFileDetected}</strong>
                      <p className="small">Information has been successfully bridged to the call agent session.</p>
                    </div>
                  )}
                </div>
              )}

              {callStage === 5 && (
                <div className="demo-note success-note text-left mt-3" style={{ background: "#f0fdf4", color: "#166534" }}>
                  <strong>✓ Call Finished & Application Submitted!</strong>
                  <p className="small">The agent has successfully submitted your registration. You can track this in your profile history.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
