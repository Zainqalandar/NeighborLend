import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({ apiKey });
};

export const enhanceItemDescriptionWithGemini = async (
  description: string,
) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `Rewrite this NeighborLend item description so it is clear, friendly, and trustworthy. Keep the original meaning, do not invent specifications, and return only the improved description.\n\nDescription:\n${description}`,
  });

  const enhancedDescription = response.text?.trim();

  if (!enhancedDescription) {
    throw new Error("Gemini returned an empty response");
  }

  return enhancedDescription;
};
