
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { CookingInput, CookingPlan, RecipeOption, GroceryList, CityType, DailySchedule, MealType } from "../types";
import { logError, measurePerformance } from "./analytics";

/**
 * SOLID: Helper to ensure fresh instance per call as per SDK guidelines
 */
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * DRY: Centralized handler for all Gemini text-based content generation
 */
async function callGeminiText(params: GenerateContentParameters, label: string): Promise<string> {
  const startTime = performance.now();
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent(params);
    measurePerformance(label, startTime);
    return response.text || "";
  } catch (error) {
    logError(error as Error, label);
    throw error;
  }
}

const RECIPE_SCHEMA = {
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
    budgetFeasibility: { type: Type.STRING, description: "Must be 'Budget Validated' or 'Budget Risk'" },
    estimatedCostValue: { type: Type.NUMBER },
    isFallback: { type: Type.BOOLEAN },
    imagePrompt: { type: Type.STRING }
  },
  required: ["recipeName", "description", "totalTime", "ingredientsUsed", "prepChecklist", "cookingSequence", "budgetFeasibility", "estimatedCostValue", "imagePrompt"]
};

export async function generateFullSchedule(input: CookingInput, days: number = 3): Promise<DailySchedule> {
  const prompt = `
    Generate a ${days}-day cooking schedule for a ${input.diet} diet starting from ${input.targetDate}.
    Each day must have breakfast, lunch, and dinner.
    
    IMPORTANT RULES:
    - Use date format: YYYY-MM-DD for the 'date' field.
    - Each day must be sequential starting from ${input.targetDate}.
    - Must use at least 3 from: [${input.ingredients.join(', ')}].
    - Daily total budget for ${input.cityType}: ₹${input.dailyBudget}.
    - Focus on ${input.optimizationGoal || 'Taste'}.
    - Include substitution logic for ingredients if the user requested a specific diet or if the recipe is budget-constrained.
  `;

  const text = await callGeminiText({
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
                date: { type: Type.STRING, description: "Strict YYYY-MM-DD format" },
                breakfast: RECIPE_SCHEMA,
                lunch: RECIPE_SCHEMA,
                dinner: RECIPE_SCHEMA
              },
              required: ["date", "breakfast", "lunch", "dinner"]
            }
          }
        },
        required: ["days"]
      }
    }
  }, 'generateFullSchedule');
  return JSON.parse(text);
}

export async function generateChefTips(recipeName: string, ingredients: string[]): Promise<string> {
  const prompt = `As a professional chef, provide 3 short, specific tips for ${recipeName} focusing on these ingredients: ${ingredients.join(', ')}.`;
  return callGeminiText({
    model: 'gemini-3-flash-preview',
    contents: prompt
  }, 'generateChefTips');
}

export async function auditScheduleQuality(schedule: DailySchedule, input: CookingInput): Promise<{score: number, report: string, compliance: string}> {
  const prompt = `
    Audit the following cooking schedule against these constraints:
    Diet: ${input.diet}
    Budget: ₹${input.dailyBudget}
    Ingredients Required: ${input.ingredients.join(', ')}
    
    Schedule to audit: ${JSON.stringify(schedule)}
    
    Check for:
    1. Culinary logic (do the recipes make sense?)
    2. Dietary purity (any meat in veg plans?)
    3. Ingredient utilization (did it use the required locked ingredients?)
    
    Return a JSON report.
  `;

  const text = await callGeminiText({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Score from 0-100" },
          report: { type: Type.STRING, description: "Short summary of findings" },
          compliance: { type: Type.STRING, description: "Status: 'COMPLIANT' or 'NON_COMPLIANT'" }
        },
        required: ["score", "report", "compliance"]
      }
    }
  }, 'auditScheduleQuality');
  return JSON.parse(text);
}

export async function generateRecipeImage(prompt: string, highQuality = false): Promise<string> {
  const model = highQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  const startTime = performance.now();
  
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: `${prompt}. High-quality professional food photography, shallow depth of field, warm lighting.` }]
      },
      config: { 
        imageConfig: { 
          aspectRatio: "1:1",
          imageSize: highQuality ? "2K" : "1K"
        } 
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        measurePerformance(`generateRecipeImage_${model}`, startTime);
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data in response");
  } catch (error) {
    logError(error as Error, 'generateRecipeImage');
    return "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800";
  }
}

export async function generateGroceryList(plans: CookingPlan[]): Promise<GroceryList> {
  const prompt = `Consolidate ingredients for: ${plans.map(p => p.recipeName).join(', ')}. Group by category and estimate costs in INR.`;
  const text = await callGeminiText({
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
  }, 'generateGroceryList');
  return JSON.parse(text);
}

export async function swapMeal(input: CookingInput, date: string, mealType: MealType): Promise<RecipeOption> {
  const prompt = `Provide a replacement ${mealType} for ${date} using [${input.ingredients.join(', ')}] under budget ₹${input.dailyBudget/3}. Ensure date is ${date}.`;
  const text = await callGeminiText({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: RECIPE_SCHEMA
    }
  }, 'swapMeal');
  return JSON.parse(text);
}

export async function discoverRecipesByIngredients(ingredients: string[], cityType: CityType): Promise<RecipeOption[]> {
  const prompt = `Discover 3 distinct recipe options using these ingredients: ${ingredients.join(', ')}. 
  Context: User lives in a ${cityType} city in India. 
  Ensure recipes are culturally appropriate and respect budget constraints for this economy tier.`;

  const text = await callGeminiText({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: RECIPE_SCHEMA
      }
    }
  }, 'discoverRecipesByIngredients');
  return JSON.parse(text);
}
