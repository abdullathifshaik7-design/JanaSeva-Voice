// Telephony Provider Abstraction for JanaSeva Voice Phone Integration
// Supports Twilio (TwiML), Exotel (Indian telephony), and Generic/Mock for local testing

import crypto from "crypto";

/**
 * Base abstract phone provider interface
 */
export class PhoneProvider {
  constructor(name) {
    this.name = name;
  }

  parseIncomingCall(body) {
    throw new Error("Method not implemented");
  }

  parseSpeechResult(body) {
    throw new Error("Method not implemented");
  }

  generateGreetingResponse(callId, greetingText, actionUrl, options = {}) {
    throw new Error("Method not implemented");
  }

  generatePlayAndGatherResponse(callId, speakText, actionUrl, options = {}) {
    throw new Error("Method not implemented");
  }

  generateEndCallResponse(callId, farewellText, options = {}) {
    throw new Error("Method not implemented");
  }

  verifyWebhookSignature(req, secret) {
    return true; // Default permissive in mock mode
  }
}

/**
 * Twilio Phone Provider (Standards-compliant TwiML output)
 */
export class TwilioPhoneProvider extends PhoneProvider {
  constructor() {
    super("twilio");
  }

  parseIncomingCall(body = {}) {
    return {
      callId: body.CallSid || body.callId || `tw_${Date.now()}`,
      from: body.From || body.from || "Anonymous",
      to: body.To || body.to || "",
      digits: body.Digits || "",
      speechResult: body.SpeechResult || body.speechResult || "",
      confidence: parseFloat(body.Confidence || "1.0"),
      status: body.CallStatus || "in-progress"
    };
  }

  parseSpeechResult(body = {}) {
    return {
      callId: body.CallSid || body.callId || "",
      speechResult: (body.SpeechResult || body.speechResult || body.text || "").trim(),
      confidence: parseFloat(body.Confidence || "1.0"),
      from: body.From || body.from || ""
    };
  }

  /**
   * Escape special XML characters for valid TwiML
   */
  escapeXml(unsafe = "") {
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  generateGreetingResponse(callId, greetingText, actionUrl, options = {}) {
    const lang = options.language || "te-IN";
    const escapedText = this.escapeXml(greetingText);
    const escapedUrl = this.escapeXml(actionUrl);

    // TwiML with Gather listening for speech
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="${lang}">${escapedText}</Say>
  <Gather input="speech" action="${escapedUrl}" language="${lang}" speechTimeout="auto" timeout="6">
    <Say language="${lang}">Meeru matladavachu.</Say>
  </Gather>
  <Redirect>${escapedUrl}?retry=true</Redirect>
</Response>`;

    return {
      contentType: "text/xml",
      body: twiml.trim()
    };
  }

  generatePlayAndGatherResponse(callId, speakText, actionUrl, options = {}) {
    const lang = options.language || "te-IN";
    const escapedText = this.escapeXml(speakText);
    const escapedUrl = this.escapeXml(actionUrl);
    const timeout = options.timeout || 5;

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="${lang}">${escapedText}</Say>
  <Gather input="speech" action="${escapedUrl}" language="${lang}" speechTimeout="auto" timeout="${timeout}">
  </Gather>
  <Redirect>${escapedUrl}?silence=true</Redirect>
</Response>`;

    return {
      contentType: "text/xml",
      body: twiml.trim()
    };
  }

  generateEndCallResponse(callId, farewellText, options = {}) {
    const lang = options.language || "te-IN";
    const escapedText = this.escapeXml(farewellText);

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="${lang}">${escapedText}</Say>
  <Hangup/>
</Response>`;

    return {
      contentType: "text/xml",
      body: twiml.trim()
    };
  }

  verifyWebhookSignature(req, secret) {
    if (!secret) return true; // Skip if secret not configured
    try {
      const signature = req.headers["x-twilio-signature"];
      if (!signature) return false;
      const url = req.originalUrl || req.url;
      const data = Object.keys(req.body || {})
        .sort()
        .reduce((acc, key) => acc + key + req.body[key], url);
      const expected = crypto.createHmac("sha1", secret).update(Buffer.from(data, "utf-8")).digest("base64");
      return signature === expected;
    } catch (e) {
      return false;
    }
  }
}

/**
 * Exotel Phone Provider (Indian Telecoms Voice APIs)
 */
export class ExotelPhoneProvider extends PhoneProvider {
  constructor() {
    super("exotel");
  }

  parseIncomingCall(body = {}) {
    return {
      callId: body.CallSid || body.CallUuid || `exo_${Date.now()}`,
      from: body.From || body.Caller || "Anonymous",
      to: body.To || body.DialWhomNumber || "",
      speechResult: body.SpeechResult || body.RecordingUrl || "",
      status: body.Status || "in-progress"
    };
  }

  parseSpeechResult(body = {}) {
    return {
      callId: body.CallSid || body.CallUuid || "",
      speechResult: (body.SpeechResult || body.text || "").trim(),
      from: body.From || body.Caller || ""
    };
  }

  generateGreetingResponse(callId, greetingText, actionUrl, options = {}) {
    return {
      contentType: "application/json",
      body: JSON.stringify({
        action: "play_and_gather",
        text: greetingText,
        language: options.language || "te-IN",
        actionUrl,
        input: "speech",
        timeout: 5
      })
    };
  }

  generatePlayAndGatherResponse(callId, speakText, actionUrl, options = {}) {
    return {
      contentType: "application/json",
      body: JSON.stringify({
        action: "play_and_gather",
        text: speakText,
        language: options.language || "te-IN",
        actionUrl,
        input: "speech",
        timeout: options.timeout || 5
      })
    };
  }

  generateEndCallResponse(callId, farewellText, options = {}) {
    return {
      contentType: "application/json",
      body: JSON.stringify({
        action: "hangup",
        text: farewellText,
        language: options.language || "te-IN"
      })
    };
  }
}

/**
 * Generic / Mock Phone Provider (Used for local test simulation and custom REST VoIP proxies)
 */
export class GenericMockProvider extends PhoneProvider {
  constructor() {
    super("generic");
  }

  parseIncomingCall(body = {}) {
    return {
      callId: body.callId || body.CallSid || `mock_${Date.now()}`,
      from: body.from || body.From || "+919876543210",
      to: body.to || body.To || "1800-200-5262",
      speechResult: body.speechResult || body.SpeechResult || body.text || "",
      confidence: 1.0,
      status: "in-progress"
    };
  }

  parseSpeechResult(body = {}) {
    return {
      callId: body.callId || body.CallSid || "",
      speechResult: (body.speechResult || body.SpeechResult || body.text || "").trim(),
      from: body.from || body.From || "+919876543210"
    };
  }

  generateGreetingResponse(callId, greetingText, actionUrl, options = {}) {
    return {
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        callId,
        action: "gather",
        text: greetingText,
        language: options.language || "te-IN",
        actionUrl,
        isGreeting: true
      })
    };
  }

  generatePlayAndGatherResponse(callId, speakText, actionUrl, options = {}) {
    return {
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        callId,
        action: "gather",
        text: speakText,
        language: options.language || "te-IN",
        actionUrl,
        isEndCall: false
      })
    };
  }

  generateEndCallResponse(callId, farewellText, options = {}) {
    return {
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        callId,
        action: "hangup",
        text: farewellText,
        language: options.language || "te-IN",
        isEndCall: true
      })
    };
  }
}

/**
 * Telephony provider factory
 * @param {string} providerName Optional override (default from env PHONE_PROVIDER)
 * @returns {PhoneProvider}
 */
export function getPhoneProvider(providerName) {
  let selected = (providerName || process.env.PHONE_PROVIDER || "").toLowerCase();

  // Default to mock when no credentials are configured
  if (!selected) {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      selected = "twilio";
    } else if (process.env.EXOTEL_SID && process.env.EXOTEL_TOKEN) {
      selected = "exotel";
    } else {
      selected = "mock";
    }
  }

  switch (selected) {
    case "exotel":
      return new ExotelPhoneProvider();
    case "twilio":
      return new TwilioPhoneProvider();
    case "generic":
    case "mock":
    case "test":
    default:
      return new GenericMockProvider();
  }
}
