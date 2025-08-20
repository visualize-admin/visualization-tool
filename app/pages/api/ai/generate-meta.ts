import { CompactAIContext } from "@/ai/context";
import { Locale } from "@/locales/locales";
import { generateMeta } from "@/server/ai/generate-meta";
import { api } from "@/server/nextkit";

type Body = {
  field: "title" | "description";
  locale: Locale;
  context: CompactAIContext;
};

const route = api({
  POST: async ({ req }) => {
    if (!process.env.GEMINI_API_KEY) {
      return { status: 500, message: "GEMINI_API_KEY is missing" } as const;
    }

    const body = req.body as Body;
    const { field, locale, context } = body;
    const text = await generateMeta({ field, locale, context });

    return { text };
  },
});

export default route;
