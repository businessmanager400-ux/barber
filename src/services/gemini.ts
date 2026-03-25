import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateBarberDescription(shopName: string, services: string[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a professional, premium, and inviting description for a barber shop named "${shopName}". 
      The shop offers services like: ${services.join(", ")}. 
      The tone should be elegant and masculine. Keep it under 150 words.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating description:", error);
    return "Welcome to our professional barber shop. We provide high-quality grooming services for the modern man.";
  }
}
