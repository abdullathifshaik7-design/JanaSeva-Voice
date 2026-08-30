import { useCallback, useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  VOICE_STATES,
  processVoiceRequest,
  speakText,
  processLocationResults,
  resetConversationContext,
  SpeechToTextAPI
} from "../services/voiceService";
import { LANGUAGES_REGISTRY } from "../data/translations";

export function useVoiceAssistant() {
  const { language, setLanguage } = useApp();
  const [state, setState] = useState(VOICE_STATES.READY);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [locationResults, setLocationResults] = useState([]);

  // MediaRecorder refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStartTimeRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const silenceDetectionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);

  // Refs to bypass stale closures in event listeners
  const isListeningRef = useRef(false);
  const transcriptRef = useRef("");
  const languageRef = useRef(language);

  // Sync language ref
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const reset = useCallback(() => {
    console.log("VOICE DEBUG: reset called");
    
    // Clear timeouts
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (silenceDetectionRef.current) {
      cancelAnimationFrame(silenceDetectionRef.current);
      silenceDetectionRef.current = null;
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    isListeningRef.current = false;
    transcriptRef.current = "";
    setState(VOICE_STATES.READY);
    setTranscript("");
    setResponse("");
    setError(null);
    setLocationResults([]);
    resetConversationContext();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear timeouts
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (silenceDetectionRef.current) {
        cancelAnimationFrame(silenceDetectionRef.current);
      }
      
      // Clean up audio context
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {}
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const handleLocationSearch = useCallback((langKey) => {
    setState(VOICE_STATES.FINDING_LOCATION);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setState(VOICE_STATES.READY);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const res = processLocationResults(latitude, longitude, langKey);
        setResponse(res.response);
        setLocationResults(res.results);
        setState(VOICE_STATES.RESPONSE);
        await speakText(res.response, langKey);
      },
      async (err) => {
        console.warn("Geolocation permission denied/failed. Falling back to default center locations.");
        const fallbackLat = 16.3067;
        const fallbackLng = 80.4365;
        const res = processLocationResults(fallbackLat, fallbackLng, langKey);
        setResponse(`${res.response} (Note: Showing fallback coordinates as location permission was denied)`);
        setLocationResults(res.results);
        setState(VOICE_STATES.RESPONSE);
        await speakText(res.response, langKey);
      },
      { timeout: 8000 }
    );
  }, []);

  // Process the final collected transcript
  const handleFinalSpeechText = async (text, activeLang) => {
    console.log("VOICE DEBUG: submitting transcript to assistant:", text);
    setState(VOICE_STATES.PROCESSING);
    try {
      const result = await processVoiceRequest(text, activeLang);
      const outputLang = result.detectedLanguage || activeLang;
      
      console.log("VOICE DEBUG: assistant response received. Detected lang:", result.detectedLanguage, "requiresLoc:", result.requiresLocation);
      if (result.detectedLanguage && result.detectedLanguage !== activeLang) {
        setLanguage(result.detectedLanguage);
      }

      if (result.requiresLocation) {
        handleLocationSearch(outputLang);
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
  };

  const activate = useCallback(async () => {
    console.log("VOICE DEBUG: activate triggered. Current state:", state, "isListeningRef:", isListeningRef.current);
    
    // Stop any active SpeechSynthesis output to avoid microphone feedback/deafness
    try {
      if (window.speechSynthesis) {
        console.log("VOICE DEBUG: cancelling existing SpeechSynthesis");
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn("VOICE DEBUG: failed to cancel speech synthesis:", e);
    }

    // Toggle Off if active
    if (isListeningRef.current) {
      console.log("VOICE DEBUG: toggling off active listening session");
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        return; // stop callback handles processing
      }

      isListeningRef.current = false;
      setState(VOICE_STATES.READY);
      return;
    }

    if (state === VOICE_STATES.PROCESSING || state === VOICE_STATES.FINDING_LOCATION) {
      console.log("VOICE DEBUG: ignored activate, currently processing or locating");
      return;
    }

    setError(null);
    setTranscript("");
    setResponse("");
    setLocationResults([]);
    transcriptRef.current = "";

    const reg = LANGUAGES_REGISTRY.find(item => item.code === languageRef.current);
    const langCode = reg ? reg.speechRecognitionCode : "en-IN";

    // MediaRecorder primary pipeline
    try {
      console.log("VOICE DEBUG: Starting MediaRecorder primary pipeline. Lang:", langCode);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();
      
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else {
          mimeType = "audio/ogg";
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("VOICE DEBUG: MediaRecorder stopped. Processing audio content...");
        
        isListeningRef.current = false;

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          try {
            const base64Audio = reader.result.split(",")[1];
            setState(VOICE_STATES.PROCESSING);
            setTranscript("Understanding your speech...");

            const transcriptText = await SpeechToTextAPI(base64Audio, langCode);
            console.log("VOICE DEBUG: Backend STT returned transcript:", transcriptText);
            
            if (!transcriptText || !transcriptText.trim()) {
              setError("I couldn't hear anything. Please try speaking again.");
              setState(VOICE_STATES.READY);
              return;
            }

            setTranscript(transcriptText);
            transcriptRef.current = transcriptText;
            await handleFinalSpeechText(transcriptText, languageRef.current);
          } catch (err) {
            console.error("VOICE DEBUG: Backend STT failed:", err);
            setError("Cloud speech recognition failed. Please try again.");
            setState(VOICE_STATES.READY);
          }
        };

        // Release mic stream track locks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      isListeningRef.current = true;
      setState(VOICE_STATES.LISTENING);
      
      console.log("VOICE DEBUG: MediaRecorder active as primary STT.");
    } catch (err) {
      console.error("VOICE DEBUG: MediaRecorder setup failed:", err);
      setError("Microphone permission denied or no audio input device found.");
      setState(VOICE_STATES.READY);
    }
  }, [state, handleLocationSearch, setLanguage]);

  const repeatResponse = useCallback(async () => {
    if (response) {
      await speakText(response, languageRef.current);
    }
  }, [response]);

  return {
    state,
    transcript,
    response,
    error,
    locationResults,
    activate,
    reset,
    repeatResponse,
    isListening: state === VOICE_STATES.LISTENING,
    isProcessing: state === VOICE_STATES.PROCESSING,
    isFindingLocation: state === VOICE_STATES.FINDING_LOCATION,
    hasResponse: state === VOICE_STATES.RESPONSE,
  };
}
