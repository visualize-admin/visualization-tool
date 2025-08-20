import type { Locale } from "@/locales/locales";

import type { GenerateContentResponse } from "@google/genai";

export const getLanguageName = (locale: Locale) => {
  switch (locale) {
    case "de":
      return "German";
    case "fr":
      return "French";
    case "it":
      return "Italian";
    case "en":
      return "English";
    default:
      const _exhaustiveCheck: never = locale;
      return _exhaustiveCheck;
  }
};

export const extractText = (res: GenerateContentResponse): string => {
  return res.text ?? res.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
};
