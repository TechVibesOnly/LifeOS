import { GoogleGenAI } from "@google/genai";

// Initialization according to gemini-api skill
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const MODELS = {
  text: "gemini-3-flash-preview",
  reasoning: "gemini-3.1-pro-preview",
  image: "gemini-2.5-flash-image"
};
