// Central Phone Voice Orchestration Service for JanaSeva
// Connects Provider Abstraction, Session Memory, AI Engine, STT, and TTS

import { getPhoneProvider } from "./phoneProvider.js";
import { phoneSessionManager } from "./phoneSessionManager.js";
import { GREETINGS, processPhoneSpeechTurn } from "./aiConversationService.js";
import { transcribeAudio } from "./speechService.js";
import { synthesizeSpeech } from "./textToSpeechService.js";
import { toTelephonyLanguageCode, fromTelephonyLanguageCode } from "./languageService.js";

/**
 * Handle incoming phone call webhook
 * @param {object} params
 * @param {object} params.body Request body
 * @param {string} params.webhookUrl Full URL for the next webhook step
 * @param {string} params.provider Optional provider name
 */
export async function handleIncomingCall({ body, webhookUrl, provider }) {
  const phoneProvider = getPhoneProvider(provider);
  const incoming = phoneProvider.parseIncomingCall(body);

  // Initialize session
  const session = phoneSessionManager.getOrCreateSession(incoming.callId, {
    callerNumber: incoming.from,
    language: "te-IN",
    currentLanguageCode: "te"
  });

  // Determine initial greeting (multilingual welcoming prompt)
  const initialGreeting = GREETINGS.te;

  // Record initial assistant turn
  session.lastResponse = initialGreeting;
  session.conversationHistory.push({
    role: "assistant",
    text: initialGreeting,
    timestamp: new Date().toISOString(),
    language: "te-IN"
  });

  const actionUrl = webhookUrl || "/api/voice/process";
  return phoneProvider.generateGreetingResponse(session.callId, initialGreeting, actionUrl, {
    language: "te-IN"
  });
}

/**
 * Handle speech processing callback from telephony provider
 * @param {object} params
 * @param {object} params.body Request body
 * @param {string} params.webhookUrl Webhook URL for next turn
 * @param {string} params.provider Optional provider name
 */
export async function handleProcessSpeech({ body, webhookUrl, provider }) {
  const phoneProvider = getPhoneProvider(provider);
  const speechData = phoneProvider.parseSpeechResult(body);
  const callId = speechData.callId || body.callId || "default";

  // Retrieve session
  const session = phoneSessionManager.getOrCreateSession(callId, {
    callerNumber: speechData.from
  });

  let userTranscript = speechData.speechResult;

  // If audio is provided instead of pre-transcribed speech, transcribe it
  if (!userTranscript && body.audioContent) {
    userTranscript = await transcribeAudio(body.audioContent, session.language);
  }

  // Check if caller said nothing (silence or empty speech)
  const isSilence = !userTranscript || body.silence === "true" || body.retry === "true";
  const speechToProcess = isSilence ? "" : userTranscript;

  // Process the conversational turn through AI engine
  const aiResult = await processPhoneSpeechTurn(speechToProcess, session);

  // Record dialogue turn in session memory
  phoneSessionManager.recordTurn(callId, {
    userSpeech: speechToProcess,
    botResponse: aiResult.text,
    language: aiResult.language,
    intent: aiResult.intent
  });

  const actionUrl = webhookUrl || "/api/voice/process";

  // If call ended by user or system
  if (aiResult.isEndCall) {
    phoneSessionManager.endSession(callId);
    return phoneProvider.generateEndCallResponse(callId, aiResult.text, {
      language: aiResult.language
    });
  }

  // Otherwise, play response and gather next speech input (voice loop continuation)
  return phoneProvider.generatePlayAndGatherResponse(callId, aiResult.text, actionUrl, {
    language: aiResult.language,
    timeout: 6
  });
}

/**
 * Handle call termination event
 * @param {string} callId
 */
export function handleEndCall(callId) {
  return phoneSessionManager.endSession(callId);
}

/**
 * Local simulator turn execution (used by /api/voice/test and in-browser simulator)
 * @param {object} params
 * @param {string} params.callId
 * @param {string} params.text
 * @param {string} params.language
 */
export async function handleSimulationTurn({ callId, text, language }) {
  const id = callId || `sim_${Date.now()}`;
  const initialLang = toTelephonyLanguageCode(language || "te-IN");

  const session = phoneSessionManager.getOrCreateSession(id, {
    callerNumber: "+919876543210",
    language: initialLang,
    currentLanguageCode: fromTelephonyLanguageCode(initialLang)
  });

  const aiResult = await processPhoneSpeechTurn(text, session);

  phoneSessionManager.recordTurn(id, {
    userSpeech: text,
    botResponse: aiResult.text,
    language: aiResult.language,
    intent: aiResult.intent
  });

  if (aiResult.isEndCall) {
    phoneSessionManager.endSession(id);
  }

  // Synthesize TTS audio preview if Google API key is configured
  const ttsResult = await synthesizeSpeech(aiResult.text, aiResult.language);

  return {
    status: "success",
    callId: id,
    userInput: text,
    response: aiResult.text,
    detectedLanguage: aiResult.language,
    shortLanguage: fromTelephonyLanguageCode(aiResult.language),
    intent: aiResult.intent,
    isEndCall: aiResult.isEndCall,
    slowPaced: aiResult.slowPaced || false,
    audioContent: ttsResult.audioContent,
    session: {
      turnCount: session.turnCount,
      lastIntent: session.lastIntent,
      historyLength: session.conversationHistory.length
    },
    analytics: phoneSessionManager.getAnalytics()
  };
}

export default {
  handleIncomingCall,
  handleProcessSpeech,
  handleEndCall,
  handleSimulationTurn
};
