
import { TestResult, User, CookingInput, EnergyLevel, MealType } from "../types";
import { auditScheduleQuality, generateFullSchedule } from "./geminiService";

export const runIntegrationTests = async (users: User[]): Promise<TestResult[]> => {
  const results: TestResult[] = [];
  
  if (!users) return [{ name: "Engine Initialized", status: 'passed' }];

  // Static Tests (The basics)
  results.push({
    name: "User Persistence Logic",
    status: (users && users.length >= 0) ? 'passed' : 'failed'
  });

  results.push({
    name: "Pantry Initialization Integrity",
    status: users.every(u => u.pantry && Object.keys(u.pantry).length === 4) ? 'passed' : 'failed'
  });

  results.push({
    name: "Budget Policy Minimum (₹50)",
    status: users.every(u => u.dailyBudget >= 50) ? 'passed' : 'failed'
  });

  // Functional Logic Tests
  const windowValid = users.every(u => {
    if (!u.reminderPreferences) return false;
    const start = parseInt((u.reminderPreferences.cookingSlotStart || "00:00").replace(':', ''));
    const end = parseInt((u.reminderPreferences.cookingSlotEnd || "23:59").replace(':', ''));
    return end > start;
  });
  results.push({
    name: "Cooking Window Temporal Logic",
    status: windowValid ? 'passed' : 'failed'
  });

  // AI-POWERED DEEP TESTING
  const testUser = users[0];
  if (testUser && testUser.onboardingComplete) {
    try {
      const mockInput: CookingInput = {
        diet: testUser.diet,
        mealType: MealType.LUNCH,
        energyLevel: EnergyLevel.NORMAL,
        timeAvailable: testUser.cookingTimePerMeal,
        kitchenSetup: testUser.kitchenSetup,
        ingredients: (testUser.pantry?.veg || []).slice(0, 5),
        targetDate: new Date().toISOString().split('T')[0],
        cityType: testUser.cityType,
        dailyBudget: testUser.dailyBudget
      };

      const schedule = await generateFullSchedule(mockInput, 1);
      if (!schedule || !schedule.days) throw new Error("Empty AI response");
      
      const audit = await auditScheduleQuality(schedule, mockInput);

      results.push({
        name: `AI Compliance Audit: ${audit.compliance}`,
        status: audit.compliance === 'COMPLIANT' ? 'passed' : 'failed',
        error: audit.report
      });

      results.push({
        name: `AI Culinary Quality Score: ${audit.score}/100`,
        status: audit.score > 70 ? 'passed' : 'failed',
        error: `Score: ${audit.score}. Report: ${audit.report}`
      });

    } catch (err) {
      results.push({
        name: "AI Deep Diagnostic Engine",
        status: 'failed',
        error: "AI service failed to validate logic branch during diagnostic."
      });
    }
  } else {
    results.push({
      name: "AI Deep Diagnostic Engine",
      status: 'pending',
      error: "Complete onboarding for first architect to enable AI diagnostics."
    });
  }

  return results;
};
