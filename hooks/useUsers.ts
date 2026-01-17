
import { useState, useEffect, useCallback } from 'react';
import { User, CookingPlan, Pantry, DietType, KitchenSetup, CityType, Persona, ReminderPreferences } from '../types';
import { trackEvent } from '../services/analytics';

const STORAGE_KEY = 'chefSync_users_v5';

const DEFAULT_REMINDER_PREFS: ReminderPreferences = {
  reminderTime: 'evening',
  cookingSlotStart: '18:00',
  cookingSlotEnd: '20:00',
  remindersPerDay: 1
};

const createNewUser = (): User => ({
  id: crypto.randomUUID(),
  name: "",
  age: 25,
  cityType: CityType.TIER_2,
  dailyBudget: 250,
  diet: DietType.VEG,
  kitchenSetup: KitchenSetup.MEDIUM,
  pantry: {
    veg: ["Onion", "Garlic", "Potato", "Tomato", "Spinach", "Ginger"],
    nonVeg: ["Egg", "Chicken"],
    oils: ["Vegetable Oil", "Butter"],
    masalas: ["Salt", "Turmeric", "Chilli Powder", "Coriander Powder"]
  },
  plans: [],
  preferences: { highQualityVisuals: false },
  onboardingComplete: false,
  persona: Persona.WORKING_PROFESSIONAL,
  reminderPreferences: DEFAULT_REMINDER_PREFS,
  allergies: "",
  cookingTimePerMeal: 30,
});

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUsers(JSON.parse(saved));
      } catch (e) {
        console.error("Corrupted storage", e);
      }
    }
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
  }, [users]);

  const currentUser = users.find(u => u.id === selectedUserId);

  const addUser = useCallback(() => {
    const newUser = createNewUser();
    setUsers(prev => [...prev, newUser]);
    trackEvent('onboarding_started', { userId: newUser.id });
    return newUser;
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (updatedUser.onboardingComplete) {
      trackEvent('user_created', { userId: updatedUser.id, cityType: updatedUser.cityType, persona: updatedUser.persona });
    }
  }, []);

  const updatePreferences = useCallback((userId: string, prefs: Partial<User['preferences']>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, preferences: { ...u.preferences, ...prefs } } : u));
    trackEvent('preferences_updated', { userId, ...prefs });
  }, []);

  const updatePantry = useCallback((userId: string, newPantry: Pantry) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, pantry: newPantry } : u));
  }, []);

  const addPlan = useCallback((userId: string, plan: CookingPlan) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const filteredPlans = u.plans.filter(p => 
        !(p.metadata.date === plan.metadata.date && p.metadata.mealType === plan.metadata.mealType)
      );
      return { ...u, plans: [plan, ...filteredPlans] };
    }));
    trackEvent('meal_planned', { userId, recipeName: plan.recipeName });
  }, []);

  const addBatchPlans = useCallback((userId: string, plans: CookingPlan[]) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      
      const newPlanKeys = new Set(plans.map(p => `${p.metadata.date}-${p.metadata.mealType}`));
      const existingPlans = u.plans.filter(p => 
        !newPlanKeys.has(`${p.metadata.date}-${p.metadata.mealType}`)
      );
      
      return { ...u, plans: [...plans, ...existingPlans] };
    }));
    trackEvent('batch_meals_added', { userId, count: plans.length });
  }, []);

  return {
    users,
    currentUser,
    selectedUserId,
    setSelectedUserId,
    addUser,
    updateUser,
    updatePantry,
    addPlan,
    addBatchPlans,
    updatePreferences
  };
};
