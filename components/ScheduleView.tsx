
import React, { useState } from 'react';
import { DailySchedule, MealType, RecipeOption, CookingPlan, EnergyLevel, OptimizationGoal, CityType, CookingInput, User } from '../types';
import { Badge } from './Shared';
import { swapMeal } from '../services/geminiService';

interface ScheduleViewProps {
  schedule: DailySchedule;
  user: User;
  onAdopt: (recipe: RecipeOption, date: string, mealType: MealType) => void;
  onFinalize: () => void;
  onReset: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule, user, onAdopt, onFinalize, onReset }) => {
  const [activeSchedule, setActiveSchedule] = useState(schedule);
  const [swapping, setSwapping] = useState<string | null>(null);

  const handleSwap = async (date: string, mealType: MealType) => {
    const key = `${date}-${mealType}`;
    setSwapping(key);
    try {
      // Create a focused input for the swap
      const input: CookingInput = {
        diet: user.diet,
        mealType,
        energyLevel: EnergyLevel.NORMAL,
        timeAvailable: user.cookingTimePerMeal,
        kitchenSetup: user.kitchenSetup,
        ingredients: Object.values(user.pantry).flat().slice(0, 10), // Use first 10 for speed
        targetDate: date,
        cityType: user.cityType,
        dailyBudget: user.dailyBudget
      };
      const newRecipe = await swapMeal(input, date, mealType);
      
      const updatedDays = activeSchedule.days.map(d => {
        if (d.date !== date) return d;
        return {
          ...d,
          [mealType.toLowerCase()]: newRecipe
        };
      });
      setActiveSchedule({ days: updatedDays });
    } catch (err) {
      console.error("Swap failed", err);
    } finally {
      setSwapping(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-16">
        <div>
          <h2 className="text-5xl font-black text-[#2D2A26] serif italic tracking-tighter">Roadmap Blueprint</h2>
          <p className="text-[#A6A196] font-medium mt-2">Personalized workflows for your {user.persona?.replace('_', ' ')} routine.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={onReset} className="text-[10px] font-black uppercase text-[#A6A196]">Reset</button>
          <button onClick={onFinalize} className="px-8 py-4 bg-[#E2725B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Finalize & Orchestrate</button>
        </div>
      </div>

      <div className="space-y-16">
        {activeSchedule.days.map((day, dIdx) => (
          <div key={day.date} className="bg-white p-10 rounded-[3.5rem] border border-[#EBE8E0] shadow-xl">
            <h3 className="text-2xl font-black mb-10 text-slate-800 serif">Day {dIdx + 1}: {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {(['BREAKFAST', 'LUNCH', 'DINNER'] as MealType[]).map(mType => {
                const recipe = day[mType.toLowerCase() as keyof typeof day] as RecipeOption;
                const isSwapping = swapping === `${day.date}-${mType}`;
                
                return (
                  <div key={mType} className={`flex flex-col border p-6 rounded-3xl bg-[#FAF9F6] transition-all ${isSwapping ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="terracotta">{mType}</Badge>
                      <Badge variant={recipe.budgetFeasibility === 'Budget Validated' ? 'sage' : 'red'}>
                        {recipe.budgetFeasibility}
                      </Badge>
                    </div>
                    
                    <h4 className="text-xl font-bold mb-2 text-slate-900">{recipe.recipeName}</h4>
                    <p className="text-xs text-slate-500 italic mb-6 line-clamp-3">"{recipe.description}"</p>
                    
                    <div className="mt-auto space-y-4">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>⏱️ {recipe.totalTime}</span>
                        <span>₹{recipe.estimatedCostValue}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleSwap(day.date, mType)}
                          className="py-3 border border-[#EBE8E0] rounded-xl text-[9px] font-black uppercase hover:bg-white"
                        >
                          {isSwapping ? '...' : 'Swap'}
                        </button>
                        <button 
                          onClick={() => onAdopt(recipe, day.date, mType)}
                          className="py-3 bg-[#2D2A26] text-white rounded-xl text-[9px] font-black uppercase hover:bg-black"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
