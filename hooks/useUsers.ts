
import { useState, useEffect, useCallback } from 'react';
import { User, CookingPlan, Pantry } from '../types';
import { trackEvent } from '../services/analytics';

const STORAGE_KEY = 'chefSync_users_v4';

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const currentUser = users.find(u => u.id === selectedUserId);

  const addUser = useCallback((user: User) => {
    setUsers(prev => [...prev, user]);
    setSelectedUserId(user.id);
    trackEvent('user_created', { userId: user.id, cityType: user.cityType });
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

  return {
    users,
    currentUser,
    selectedUserId,
    setSelectedUserId,
    addUser,
    updatePantry,
    addPlan,
    updatePreferences
  };
};
