export const LANGUAGES = [
  { native: "తెలుగు", english: "Telugu", code: "te" },
  { native: "हिन्दी", english: "Hindi", code: "hi" },
  { native: "தமிழ்", english: "Tamil", code: "ta" },
  { native: "ಕನ್ನಡ", english: "Kannada", code: "kn" },
  { native: "മലയാളം", english: "Malayalam", code: "ml" },
  { native: "मराठी", english: "Marathi", code: "mr" },
  { native: "বাংলা", english: "Bengali", code: "bn" },
  { native: "ગુજરાતી", english: "Gujarati", code: "gu" },
  { native: "ଓଡ଼ିଆ", english: "Odia", code: "or" },
  { native: "ਪੰਜਾਬੀ", english: "Punjabi", code: "pa" },
];

export const DEFAULT_LANGUAGE = "Telugu";

export function getLanguageByEnglish(name) {
  return LANGUAGES.find((l) => l.english === name) ?? LANGUAGES[0];
}
