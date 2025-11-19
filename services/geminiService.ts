import { GoogleGenAI, Type } from "@google/genai";
import { NutritionData } from "../types";

const MODEL_NAME = 'gemini-2.5-flash';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = "You are a nutritionist. Estimate the nutritional values for the given food item, image, or barcode. Be reasonable with portion sizes if not specified (assume 1 standard serving). Return the data in JSON format. If a barcode is provided, identify the specific product.";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "A short, clean display name for the food (e.g., 'Grilled Salmon')." },
    calories: { type: Type.NUMBER, description: "Total calories (kcal)." },
    protein: { type: Type.NUMBER, description: "Protein content in grams." },
    carbs: { type: Type.NUMBER, description: "Total carbohydrates in grams." },
    fats: { type: Type.NUMBER, description: "Total fat in grams." },
    sugars: { type: Type.NUMBER, description: "Total sugars in grams." },
    emoji: { type: Type.STRING, description: "A single emoji representing the food." },
    briefDescription: { type: Type.STRING, description: "A very short, 1-sentence fun fact or description." }
  },
  required: ["name", "calories", "protein", "carbs", "fats", "sugars", "emoji"]
};

export const analyzeFood = async (query: string, imageBase64?: string): Promise<NutritionData> => {
  try {
    const parts: any[] = [];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      });
      parts.push({
        text: `Analyze this food image: "${query}". Identify the main food item.`
      });
    } else {
      parts.push({
        text: `Analyze the nutrition for: "${query}".`
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (!response.text) throw new Error("No response from Gemini");
    return JSON.parse(response.text) as NutritionData;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

export const analyzeBarcode = async (code: string): Promise<NutritionData> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [{
          text: `Identify the food product with barcode "${code}". Retrieve its nutritional data.`
        }]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (!response.text) throw new Error("No response from Gemini");
    return JSON.parse(response.text) as NutritionData;
  } catch (error) {
    console.error("Gemini Barcode Analysis Failed:", error);
    throw error;
  }
};