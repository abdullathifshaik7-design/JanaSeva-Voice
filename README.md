# JanaSeva Voice — Multilingual voice-first citizen assistance platform

JanaSeva Voice is a production-grade, highly accessible, multilingual, and voice-first gateway designed to help citizens discover, understand, and track Indian government schemes, certificates, welfare benefits, and public services. 

## 1. Problem Statement & Solution

Discovering and applying for welfare schemes (like PM-KISAN, old-age pensions, or housing subsidies) is often difficult for rural, elderly, or semi-literate citizens due to complex administrative portals, jargon, and language barriers. 

**JanaSeva Voice** solves this by offering a unified voice helpline. Citizens can speak naturally in their native tongue or a mixture of languages. The platform automatically detects their language, extracts their profiling criteria (such as state, age, and occupation), recommends eligible schemes, and explains them in clear layperson terms.

## 2. Key Features

- **Multilingual Support**: Real UI, Speech Recognition, and Text-to-Speech mapping for **13 Indian languages**: English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, Assamese, and Urdu.
- **Natural Mixed-Language Processing**: Understands mixed speech queries (e.g. *"Nenu farmer ni, naaku schemes kavali"*).
- **First-Utterance Greeting**: Starts by listening to the user's speech first to greet them dynamically in their own detected language.
- **Central & State Scheme Routing**: Separates central and state government programs. An Andhra Pradesh resident only sees central and AP state schemes.
- **Browser Geolocation & Proximity Search**: Uses browser GPS coordinates to query the local common service centers list, calculating distances in kilometers and sorting them nearest first.
- **👴 Senior Citizen Mode**: Accessible dashboard with large tactile buttons, tel:14567 official helpline call shortcuts, and voice-only repeat prompts.
- **Dynamic Admin Console CMS**: Fully working dashboard, CRUD editors for schemes/services, validation checks, and citizen feedback analysis.
- **Feedback Collection**: Allows logging scheme helpfulness and app ratings.

## 3. Technology Stack

- **Core**: HTML5, Vanilla CSS, JavaScript
- **Framework**: React (Vite)
- **APIs**: Native Web Speech Recognition, Web SpeechSynthesis, and HTML5 Geolocation API
- **Icons**: Lucide React
- **Bundler**: Vite

## 4. Local Development

Ensure Node.js 18+ is installed.

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Compile production bundle
npm run build
```

## 5. Deployment Instructions

Please consult [DEPLOYMENT.md](file:///C:/Users/ABDUL%20LATHIF%20SHAIK/OneDrive/Desktop/JanaSevaVoice/DEPLOYMENT.md) for environment variables, Vercel/Netlify guidelines, and SSL certificate (HTTPS) requirements.
