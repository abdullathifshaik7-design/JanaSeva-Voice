import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

// Debug: Log which API keys are available at startup
console.log("[STT Debug] Environment variables loaded:");
console.log("[STT Debug] GROQ_API_KEY:", process.env.GROQ_API_KEY ? "CONFIGURED" : "MISSING");
console.log("[STT Debug] OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "CONFIGURED" : "MISSING");
console.log("[STT Debug] GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "CONFIGURED" : "MISSING");

// Custom local API middleware for Vite dev server
const localApiPlugin = () => ({
  name: "local-api-endpoints",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (!url.pathname.startsWith("/api/")) {
        return next();
      }

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");

      let bodyStr = "";
      req.on("data", chunk => { bodyStr += chunk; });
      req.on("end", async () => {
        let body = {};
        try {
          body = bodyStr ? JSON.parse(bodyStr) : {};
        } catch (e) {}

        const apiKey = process.env.GOOGLE_API_KEY;

        if (url.pathname === "/api/translate") {
          const { text, sourceLanguage, targetLanguage } = body;
          if (!text) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "Text is required" }));
          }
          if (!apiKey) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: "Google API Key not configured" }));
          }
          try {
            const googleUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
            const response = await fetch(googleUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                q: text,
                source: sourceLanguage,
                target: targetLanguage,
                format: "text"
              })
            });
            const data = await response.json();
            if (data.error) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: data.error.message }));
            }
            return res.end(JSON.stringify({ translatedText: data.data.translations[0].translatedText }));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        if (url.pathname === "/api/stt") {
          const { audioContent, languageCode, encoding } = body;
          if (!audioContent) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "audioContent is required" }));
          }

          // Diagnostic logging - safe only, no secrets
          console.log("[STT Request] Environment check at request time:");
          console.log("[STT Request] GROQ_API_KEY:", process.env.GROQ_API_KEY ? "EXISTS" : "MISSING");
          console.log("[STT Request] OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "EXISTS" : "MISSING");
          console.log("[STT Request] GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "EXISTS" : "MISSING");

          const groqKey = process.env.GROQ_API_KEY;
          const openaiKey = process.env.OPENAI_API_KEY;
          const googleKey = process.env.GOOGLE_API_KEY;

          // Groq / OpenAI Whisper transcription
          if (groqKey || openaiKey) {
            const activeKey = groqKey || openaiKey;
            const sttUrl = groqKey 
              ? "https://api.groq.com/openai/v1/audio/transcriptions"
              : "https://api.openai.com/v1/audio/transcriptions";
            const modelName = groqKey ? "whisper-large-v3-turbo" : "whisper-1";

            try {
              const audioBuffer = Buffer.from(audioContent, "base64");
              const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
              
              // Map language codes to Whisper ISO-639-1 format
              const languageMap = {
                'te-IN': 'te',
                'te': 'te',
                'hi-IN': 'hi',
                'hi': 'hi', 
                'ta-IN': 'ta',
                'ta': 'ta',
                'en-IN': 'en',
                'en': 'en'
              };
              const whisperLanguage = languageMap[languageCode] || 'en';
              
              console.log("[STT Request] Language mapping:", languageCode, "->", whisperLanguage);
              
              // Build proper multipart form data with language parameter
              const parts = [];
              
              // Add model field
              parts.push(`--${boundary}\r\n`);
              parts.push(`Content-Disposition: form-data; name="model"\r\n\r\n`);
              parts.push(`${modelName}\r\n`);
              
              // Add language field
              parts.push(`--${boundary}\r\n`);
              parts.push(`Content-Disposition: form-data; name="language"\r\n\r\n`);
              parts.push(`${whisperLanguage}\r\n`);
              
              // Add file field
              parts.push(`--${boundary}\r\n`);
              parts.push(`Content-Disposition: form-data; name="file"; filename="audio.webm"\r\n`);
              parts.push(`Content-Type: audio/webm\r\n\r\n`);
              
              const formDataHeader = Buffer.concat(parts.map(p => Buffer.from(p)));
              const formDataFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
              
              const body = Buffer.concat([formDataHeader, audioBuffer, formDataFooter]);

              // Add timeout to the fetch call
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

              const response = await fetch(sttUrl, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${activeKey}`,
                  "Content-Type": `multipart/form-data; boundary=${boundary}`
                },
                body: body,
                signal: controller.signal
              });
              
              clearTimeout(timeout);

              const data = await response.json();
              if (data.error) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: data.error.message || JSON.stringify(data.error) }));
              }
              return res.end(JSON.stringify({ transcript: data.text || "" }));
            } catch (err) {
              if (err.name === 'AbortError') {
                res.statusCode = 504;
                return res.end(JSON.stringify({ error: 'Speech recognition request timed out. Please try again.' }));
              }
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          // Fallback to Google STT
          if (googleKey) {
            try {
              const googleUrl = `https://speech.googleapis.com/v1/speech:recognize?key=${googleKey}`;
              
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout
              
              const response = await fetch(googleUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  config: {
                    encoding: encoding || "WEBM_OPUS",
                    sampleRateHertz: 48000,
                    languageCode: languageCode || "en-IN"
                  },
                  audio: {
                    content: audioContent
                  }
                }),
                signal: controller.signal
              });
              
              clearTimeout(timeout);

              const data = await response.json();
              if (data.error) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: data.error.message }));
              }
              const transcript = data.results?.[0]?.alternatives?.[0]?.transcript || "";
              return res.end(JSON.stringify({ transcript }));
            } catch (err) {
              if (err.name === 'AbortError') {
                res.statusCode = 504;
                return res.end(JSON.stringify({ error: 'Speech recognition request timed out. Please try again.' }));
              }
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          res.statusCode = 500;
          return res.end(JSON.stringify({ error: "No Speech-to-Text provider credentials configured." }));
        }

        if (url.pathname === "/api/tts") {
          const { text, languageCode, voiceName } = body;
          if (!text) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "Text is required" }));
          }
          if (!apiKey) {
            res.statusCode = 200;
            return res.end(JSON.stringify({ info: "Google API Key not configured. Using browser fallback.", useFallback: true }));
          }
          try {
            const googleUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
            const response = await fetch(googleUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                input: { text },
                voice: {
                  languageCode: languageCode || "en-IN",
                  name: voiceName || undefined,
                  ssmlGender: "FEMALE"
                },
                audioConfig: {
                  audioEncoding: "MP3"
                }
              })
            });
            const data = await response.json();
            if (data.error) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: data.error.message }));
            }
            return res.end(JSON.stringify({ audioContent: data.audioContent }));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ error: "API Endpoint not found" }));
      });
    });
  }
});

export default defineConfig({
  plugins: [react(), localApiPlugin()]
});