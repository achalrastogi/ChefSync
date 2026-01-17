
export enum DietType {
  VEG = 'VEG',
  NON_VEG = 'NON_VEG'
}

export enum KitchenSetup {
  BASIC = 'BASIC',
  MEDIUM = 'MEDIUM',
  FULL = 'FULL'
}

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER'
}

export enum EnergyLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH'
}

export enum CityType {
  METRO = 'METRO',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3'
}

export enum OptimizationGoal {
  TASTE = 'TASTE',
  PROTEIN = 'PROTEIN',
  CHEAPEST = 'CHEAPEST',
  FASTEST = 'FASTEST'
}

export enum Persona {
  WORKING_PROFESSIONAL = 'WORKING_PROFESSIONAL',
  STUDENT = 'STUDENT',
  HOUSEHOLD = 'HOUSEHOLD'
}

export interface ReminderPreferences {
  reminderTime: 'morning' | 'evening';
  cookingSlotStart: string; 
  cookingSlotEnd: string; 
  remindersPerDay: 1 | 2;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  type: 'shopping' | 'prep' | 'cooking';
  justification: string;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface User {
  id: string;
  name: string;
  age: number;
  cityType: CityType;
  dailyBudget: number;
  diet: DietType;
  kitchenSetup: KitchenSetup;
  pantry: Pantry;
  plans: CookingPlan[];
  preferences: {
    highQualityVisuals: boolean;
  };
  persona?: Persona;
  onboardingComplete: boolean;
  reminderPreferences: ReminderPreferences;
  allergies?: string;
  cookingTimePerMeal: number;
}

export interface CookingInput {
  diet: DietType;
  mealType: MealType;
  energyLevel: EnergyLevel;
  timeAvailable: number;
  kitchenSetup: KitchenSetup;
  ingredients: string[];
  targetDate: string;
  cityType: CityType;
  dailyBudget: number;
  optimizationGoal?: OptimizationGoal;
  allergies?: string;
}

export interface CookingStep {
  instruction: string;
  timeEstimate?: string;
}

export interface Substitution {
  original: string;
  replacement: string;
  reason: string;
}

export interface GroceryItem {
  item: string;
  quantity: string;
  estimatedCost: string;
  category: string;
}

export interface CookingPlan {
  id: string;
  recipeName: string;
  description: string;
  totalTime: string;
  ingredientsUsed: string[];
  substitutions: Substitution[];
  prepChecklist: string[];
  cookingSequence: CookingStep[];
  additionalNotes: string;
  imageUrl?: string;
  budgetFeasibility: 'Budget Validated' | 'Budget Risk';
  estimatedCostValue: number;
  isFallback?: boolean;
  fallbacks?: RecipeOption[];
  metadata: {
    mealType: MealType;
    date: string;
    energyLevel: EnergyLevel;
    diet: DietType;
    cityType: CityType;
    optimizationGoal: OptimizationGoal;
  };
}

export interface RecipeOption {
  recipeName: string;
  description: string;
  totalTime: string;
  ingredientsUsed: string[];
  substitutions: Substitution[];
  prepChecklist: string[];
  cookingSequence: CookingStep[];
  additionalNotes: string;
  imagePrompt: string;
  budgetFeasibility: 'Budget Validated' | 'Budget Risk';
  estimatedCostValue: number;
  isFallback?: boolean;
  fallbacks?: RecipeOption[];
}

export interface DayPlan {
  date: string;
  breakfast: RecipeOption;
  lunch: RecipeOption;
  dinner: RecipeOption;
}

export interface DailySchedule {
  days: DayPlan[];
}

export interface Pantry {
  veg: string[];
  nonVeg: string[];
  oils: string[];
  masalas: string[];
}

export interface GroceryList {
  items: GroceryItem[];
  totalEstimatedBudget: string;
  budgetFeasibilityNote?: string;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'pending';
  error?: string;
}
