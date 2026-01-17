
import { GoogleGenAI, Type } from "@google/genai";
import { CookingInput, CookingPlan, RecipeOption, GroceryList, OptimizationGoal, CityType, DailySchedule } from "../types";
import { logError, measurePerformance } from "./analytics";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Gemini API busy, retrying... (${retries} left)`);
      await new Promise(r => setTimeout(r, 1000));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

// Shared recipe schema part to avoid duplication and fix invalid $ref usage which is not supported in @google/genai
const recipeSchemaPart = {
  type: Type.OBJECT,
  properties: {
    recipeName: { type: Type.STRING },
    description: { type: Type.STRING },
    totalTime: { type: Type.STRING },
    ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
    substitutions: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: { 
          original: { type: Type.STRING }, 
          replacement: { type: Type.STRING }, 
          reason: { type: Type.STRING } 
        } 
      } 
    },
    prepChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
    cookingSequence: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: { 
          instruction: { type: Type.STRING }, 
          timeEstimate: { type: Type.STRING } 
        } 
      } 
    },
    additionalNotes: { type: Type.STRING },
    budgetFeasibility: { type: Type.STRING },
    estimatedCostValue: { type: Type.NUMBER },
    isFallback: { type: Type.BOOLEAN },
    imagePrompt: { type: Type.STRING },
    fallbacks: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT,
        properties: {
          recipeName: { type: Type.STRING },
          description: { type: Type.STRING },
          estimatedCostValue: { type: Type.NUMBER }
        }
      } 
    }
  },
  required: ["recipeName", "description", "totalTime", "ingredientsUsed", "prepChecklist", "cookingSequence", "budgetFeasibility", "estimatedCostValue", "imagePrompt"]
};

// Fix: Inline recipe schema as $ref is not supported and use gemini-3-flash-preview
export async function generateFullSchedule(input: CookingInput, days: number = 1): Promise<DailySchedule> {
  const startTime = performance.now();
  const goalText = input.optimizationGoal ? `Optimize specifically for ${input.optimizationGoal}.` : "";
  
  const prompt = `
    Act as a professional chef and strict budget meal planning auditor.
    Generate a full ${days}-day cooking schedule (Breakfast, Lunch, Dinner for each day).

    CRITICAL COMPLIANCE RULES:
    1. INGREDIENT LOCK: Every single meal MUST use at least 3 ingredients from this specific list: [${input.ingredients.join(', ')}].
    2. BUDGET VALIDATION GATE: Each meal must not exceed a 1/3 portion of the daily budget of ${input.dailyBudget} INR for a ${input.cityType} economy.
    3. EXPLICIT FALLBACKS: If a meal's cost is risky, provide exactly two "Ultra-Budget Fallback" options within the 'fallbacks' array of that recipe object.
    4. Labels: Fallbacks MUST be titled "Ultra-Budget Fallback 1" and "Ultra-Budget Fallback 2".
    5. DAY-BASED OUTPUT: Organize by Day 1 to Day ${days}.

    User Profile:
    - Diet: ${input.diet}
    - Kitchen: ${input.kitchenSetup}
    - Optimization: ${goalText}
    
    Output JSON only in the schema provided.
  `;

  return withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  breakfast: recipeSchemaPart,
                  lunch: recipeSchemaPart,
                  dinner: recipeSchemaPart
                },
                required: ["date", "breakfast", "lunch", "dinner"]
              }
            }
          },
          required: ["days"]
        }
      }
    });
    measurePerformance('generateFullSchedule', startTime);
    return JSON.parse(response.text.trim());
  });
}

// Fix: Add missing discoverRecipesByIngredients export required by DiscoverySection.tsx
export async function discoverRecipesByIngredients(ingredients: string[], cityType: CityType): Promise<RecipeOption[]> {
  const startTime = performance.now();
  const prompt = `Discover 4 creative and budget-friendly recipes using these ingredients: ${ingredients.join(', ')}. 
  Adjust for a ${cityType} economy. Provide full recipe details in JSON.`;

  return withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: recipeSchemaPart
        }
      }
    });
    measurePerformance('discoverRecipesByIngredients', startTime);
    return JSON.parse(response.text.trim());
  });
}

export async function generateRecipeImage(prompt: string, highQuality = false): Promise<string> {
  const model = highQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  const startTime = performance.now();
  
  try {
    return await withRetry(async () => {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [{ text: `${prompt}. Cinematic food photography, warm lighting.` }]
        },
        config: highQuality ? { imageConfig: { imageSize: "1K", aspectRatio: "1:1" } } : { imageConfig: { aspectRatio: "1:1" } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          measurePerformance(`generateRecipeImage_${model}`, startTime);
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image part returned");
    });
  } catch (error) {
    logError(error as Error, 'generateRecipeImage');
    return "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800";
  }
}

export async function generateGroceryList(plans: CookingPlan[]): Promise<GroceryList> {
  if (plans.length === 0) throw new Error("No plans provided");
  const startTime = performance.now();
  
  const ingredientsString = plans.map(p => `${p.recipeName}: ${p.ingredientsUsed.join(', ')}`).join('\n');
  const prompt = `Consolidated grocery list for: ${ingredientsString}. Provide city-adjusted INR costs for a ${plans[0].metadata.cityType} economy. JSON format.`;

  return withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  estimatedCost: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["item", "quantity", "estimatedCost", "category"]
              }
            },
            totalEstimatedBudget: { type: Type.STRING },
            budgetFeasibilityNote: { type: Type.STRING }
          },
          required: ["items", "totalEstimatedBudget"]
        }
      }
    });
    measurePerformance('generateGroceryList', startTime);
    return JSON.parse(response.text.trim());
  });
}
