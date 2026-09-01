import { useCallback, useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  VOICE_STATES,
  processVoiceRequest,
  speakText,
  processLocationResults,
  resetConversationContext
} from "../services/voiceService";
import { LANGUAGES_REGISTRY } from "../data/translations";

export function useVoiceAssistant() {
  const { language, setLanguage } = useApp();
  const [state, setState] = useState(VOICE_STATES.READY);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [locationResults, setLocationResults] = useState([]);

  // Refs for tracking SpeechRecognition state
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const accumulatedTranscriptRef = useRef("");
  const latestTranscriptRef = useRef("");
  const languageRef = useRef(language);

  // Timers for silence and safety checks
  const silenceTimerRef = useRef(null);
  const safetyTimerRef = useRef(null);
  const speechDetectedRef = useRef(false);

  // Sync language ref to prevent stale closures
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Process final text
  const handleFinalSpeechText = useCallback(async (text, activeLang) => {
    console.log("VOICE DEBUG: submitting transcript to assistant:", text);
    setState(VOICE_STATES.PROCESSING);
    try {
      const result = await processVoiceRequest(text, activeLang);
      const outputLang = activeLang; // Force responses to use the selected language directly
      
      console.log("VOICE DEBUG: assistant response received. Detected lang:", result.detectedLanguage, "requiresLoc:", result.requiresLocation);
      
      if (result.requiresLocation) {
        setState(VOICE_STATES.FINDING_LOCATION);
        if (!navigator.geolocation) {
          setError("Geolocation is not supported by your browser.");
          setState(VOICE_STATES.READY);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const res = processLocationResults(latitude, longitude, outputLang);
            setResponse(res.response);
            setLocationResults(res.results);
            setState(VOICE_STATES.RESPONSE);
            await speakText(res.response, outputLang);
          },
          async (err) => {
            console.warn("Geolocation permission denied/failed. Falling back to default center locations.");
            const fallbackLat = 16.3067;
            const fallbackLng = 80.4365;
            const res = processLocationResults(fallbackLat, fallbackLng, outputLang);
            setResponse(`${res.response} (Note: Showing fallback coordinates as location permission was denied)`);
            setLocationResults(res.results);
            setState(VOICE_STATES.RESPONSE);
            await speakText(res.response, outputLang);
          },
          { timeout: 8000 }
        );
      } else {
        setResponse(result.response);
        setState(VOICE_STATES.RESPONSE);
        await speakText(result.response, outputLang);
      }
    } catch (err) {
      console.error("VOICE DEBUG: error processing voice request:", err);
      setError("Voice input had a temporary problem. Please try again.");
      setState(VOICE_STATES.READY);
    }
  }, []);

  // Clean stop/cleanup helper
  const cleanupRecognition = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        console.log("Recognition stopped");
      } catch (e) {
        console.warn("Error during recognition stop/cleanup:", e);
      }
      recognitionRef.current = null;
    }
    isListeningRef.current = false;
  }, []);

  const reset = useCallback(() => {
    console.log("VOICE DEBUG: reset called");
    cleanupRecognition();
    setState(VOICE_STATES.READY);
    setTranscript("");
    setResponse("");
    setError(null);
    setLocationResults([]);
    resetConversationContext();
  }, [cleanupRecognition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecognition();
    };
  }, [cleanupRecognition]);

  const activate = useCallback(async () => {
    console.log("VOICE DEBUG: activate clicked. isListening:", isListeningRef.current);

    // Cancel existing TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Toggle off if listening
    if (isListeningRef.current) {
      cleanupRecognition();
      setState(VOICE_STATES.READY);
      return;
    }

    if (state === VOICE_STATES.PROCESSING || state === VOICE_STATES.FINDING_LOCATION) {
      console.log("VOICE DEBUG: ignore activate, processing active");
      return;
    }

    // Reset status flags and timers
    setError(null);
    setTranscript("");
    setResponse("");
    setLocationResults([]);
    accumulatedTranscriptRef.current = "";
    speechDetectedRef.current = false;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);

    const reg = LANGUAGES_REGISTRY.find(item => item.code === languageRef.current);
    const langCode = reg ? reg.speechRecognitionCode : "en-IN";

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = langCode;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setState(VOICE_STATES.LISTENING);
        console.log(`[VOICE] Started: ${langCode}`);
      };

      recognition.onerror = (event) => {
        console.error(`Recognition error: ${event.error}`);
        if (event.error === "not-allowed") {
          setError("Microphone permission blocked. Please check browser settings.");
        } else {
          setError(`Speech recognition failed: ${event.error}`);
        }
        cleanupRecognition();
        setState(VOICE_STATES.READY);
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptSegment;
          } else {
            interimTranscript += transcriptSegment;
          }
        }

        const currentFull = (accumulatedTranscriptRef.current + finalTranscript).trim();
        const display = currentFull + (interimTranscript ? " " + interimTranscript : "");
        
        if (display) {
          latestTranscriptRef.current = display;
          setTranscript(display);
          console.log(`[VOICE] Result: ${display}`);

          if (!speechDetectedRef.current && display.trim().length > 0) {
            speechDetectedRef.current = true;
            console.log(`[VOICE] Speech detected`);
          }

          // Restart silence timer if speech has started
          if (speechDetectedRef.current) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              console.log(`[VOICE] Silence detected — stopping`);
              recognition.stop();
            }, 1800); // Stop after 1.8 seconds of silence after speaking has started
          }
        }

        if (finalTranscript) {
          accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? " " : "") + finalTranscript;
        }
      };

      recognition.onend = async () => {
        console.log("Recognition ended callback");
        const finalResult = (accumulatedTranscriptRef.current || latestTranscriptRef.current || "").trim();
        
        cleanupRecognition();
        
        console.log(`[VOICE] Final transcript: ${finalResult}`);
        console.log(`[VOICE] Response language: ${languageRef.current}`);

        if (!finalResult) {
          setState(VOICE_STATES.READY);
          return;
        }

        await handleFinalSpeechText(finalResult, languageRef.current);
      };

      // Set a maximum safety timeout of 15 seconds
      safetyTimerRef.current = setTimeout(() => {
        console.log("VOICE DEBUG: Max safety timeout (15s) reached — stopping");
        recognition.stop();
      }, 15000);

      recognition.start();
    } catch (err) {
      console.error("VOICE DEBUG: SpeechRecognition start threw error:", err);
      setError("Failed to start speech recognition.");
      setState(VOICE_STATES.READY);
    }
  }, [state, handleFinalSpeechText, cleanupRecognition]);

  return {
    state,
    transcript,
    response,
    error,
    locationResults,
    activate,
    reset,
    repeatResponse: useCallback(async () => {
      if (response) {
        await speakText(response, languageRef.current);
      }
    }, [response]),
    isListening: state === VOICE_STATES.LISTENING,
    isProcessing: state === VOICE_STATES.PROCESSING,
    isFindingLocation: state === VOICE_STATES.FINDING_LOCATION,
    hasResponse: state === VOICE_STATES.RESPONSE,
  };
}
