export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { audioContent, languageCode, encoding } = req.body;
  if (!audioContent) {
    return res.status(400).json({ error: 'audioContent (base64) is required' });
  }

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
      
      // Build proper multipart form data manually for Node.js
      const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
      
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
        return res.status(400).json({ error: data.error.message || JSON.stringify(data.error) });
      }
      return res.status(200).json({ transcript: data.text || "" });
    } catch (err) {
      if (err.name === 'AbortError') {
        return res.status(504).json({ error: 'Speech recognition request timed out. Please try again.' });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback to Google STT
  if (googleKey) {
    try {
      const url = `https://speech.googleapis.com/v1/speech:recognize?key=${googleKey}`;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            encoding: encoding || 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: languageCode || 'en-IN'
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
        return res.status(400).json({ error: data.error.message });
      }

      const transcript = data.results?.[0]?.alternatives?.[0]?.transcript || "";
      return res.status(200).json({ transcript });
    } catch (err) {
      if (err.name === 'AbortError') {
        return res.status(504).json({ error: 'Speech recognition request timed out. Please try again.' });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(500).json({ error: "No Speech-to-Text provider credentials configured." });
}
