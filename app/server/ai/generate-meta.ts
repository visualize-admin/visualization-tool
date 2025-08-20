import { ChartAIContext } from "@/ai/use-chart-ai-context";
import type { Locale } from "@/locales/locales";
import { ai } from "@/server/ai/client";
import { extractText, getLanguageName } from "@/server/ai/utils";

export const generateMeta = async ({
  field,
  locale,
  context,
}: {
  field: "title" | "description";
  locale: Locale;
  context: ChartAIContext;
}) => {
  const systemInstruction = getSystemInstruction({ field, locale });
  const prompt = `Context (JSON):\n${JSON.stringify(context)}`;
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction,
      temperature: 0.2,
    },
  });

  return extractText(result);
};

const getSystemInstruction = ({
  field,
  locale,
}: {
  field: "title" | "description";
  locale: Locale;
}) => {
  const systemInstructions = [
    `You write a concise visualization ${field} in ${getLanguageName(locale)}.`,
    `Do not use markdown, quotes or lists. Return only the ${field} text.`,
    `The journal you write for is a very serious, Swiss one, so do not make it too light-hearted or funny, but professional.`,
  ];

  switch (field) {
    case "title":
      systemInstructions.push(`
        It needs to read like a good article headline, highlighting the most important information or insight from the context.
        It can not be in the style of "Number of X in Y" - remember, make it insightful and interesting!
      `);
      break;
    case "description":
      systemInstructions.push(`
        Make it around 2-3 short sentences - clear, factual, and helpful for a general audience.
        Remember to highlight the most important trends, patterns, or insights from the context.
      `);
      break;
    default:
      const _exhaustiveCheck: never = field;
      return _exhaustiveCheck;
  }

  return systemInstructions.join("\n");
};
