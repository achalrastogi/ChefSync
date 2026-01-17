
import React, { useState } from 'react';
import { DietType, KitchenSetup, CookingInput, MealType, EnergyLevel, Pantry, CityType, OptimizationGoal } from '../types';
import { Button } from './Button';
import { PantryModal } from './PantryModal';

interface InputSectionProps {
  onSubmit: (data: CookingInput, count: number, days: number) => void;
  isLoading: boolean;
  initialTargetDate?: string;
  pantry: Pantry;
  onUpdatePantry: (pantry: Pantry) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ onSubmit, isLoading, initialTargetDate, pantry, onUpdatePantry }) => {
  const [diet, setDiet] = useState<DietType>(DietType.VEG);
  const [mealType, setMealType] = useState<MealType>(MealType.LUNCH);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(EnergyLevel.NORMAL);
  const [time, setTime] = useState(25);
  const [setup, setSetup] = useState<KitchenSetup>(KitchenSetup.MEDIUM);
  const [cityType, setCityType] = useState<CityType>(CityType.TIER_2);
  const [dailyBudget, setDailyBudget] = useState(300);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipeCount, setRecipeCount] = useState(3);
  const [planDays, setPlanDays] = useState(1);
  const [optimization, setOptimization] = useState<OptimizationGoal>(OptimizationGoal.TASTE);
  const [showPantryModal, setShowPantryModal] = useState(false);
  const [confirmInputs, setConfirmInputs] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const [targetDate, setTargetDate] = useState(initialTargetDate || today);

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIngredients.length < 5) {
      alert("Functional Requirement: Please select at least 5 ingredients from your pantry to continue.");
      return;
    }
    setConfirmInputs(true);
  };

  const executeGeneration = () => {
    onSubmit({
      diet,
      mealType,
      energyLevel,
      timeAvailable: time,
      kitchenSetup: setup,
      ingredients: selectedIngredients,
      targetDate,
      cityType,
      dailyBudget,
      optimizationGoal: optimization
    }, recipeCount, planDays);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 mb-20">
      <div className="bg-gradient-to-br from-[#2D2A26] via-[#4A463F] to-[#E2725B] p-12 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tighter serif italic">Meal Architect</h2>
          <p className="opacity-80 font-medium max-w-xs text-sm">Strict compliance mode: 3+ ingredients lock & budget validation enabled.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#FBE9E4] mb-2 block">Days to Plan</label>
            <select value={planDays} onChange={(e) => setPlanDays(parseInt(e.target.value))} className="bg-transparent border-none text-white font-bold cursor-pointer text-lg outline-none appearance-none">
              <option value={1} className="text-slate-900">1 Day</option>
              <option value={2} className="text-slate-900">2 Days</option>
              <option value={3} className="text-slate-900">3 Days</option>
            </select>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#FBE9E4] mb-2 block">Economy Tier</label>
            <select value={cityType} onChange={(e) => setCityType(e.target.value as CityType)} className="bg-transparent border-none text-white font-bold cursor-pointer text-lg outline-none appearance-none">
              {Object.values(CityType).map(c => <option key={c} value={c} className="text-slate-900">{c.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      {!confirmInputs ? (
        <form onSubmit={handleInitialSubmit} className="p-12 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-10">
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#E2725B] text-white flex items-center justify-center text-xs">1</span>
                  Select Pantry Assets
                </label>
                <button type="button" onClick={() => setShowPantryModal(true)} className="text-xs font-bold text-[#E2725B] hover:text-[#D1604A] bg-[#FBE9E4] px-4 py-2 rounded-xl transition-all">Edit Pantry</button>
              </div>
              
              <div className="bg-[#FAF9F6] rounded-[2.5rem] p-8 border border-[#EBE8E0] space-y-6">
                <div className="flex flex-col gap-4">
                  <p className="text-[10px] font-black text-[#A6A196] uppercase tracking-[0.2em]">Required: Select at least 5 ({selectedIngredients.length} selected)</p>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto scrollbar-hide p-1">
                    {Object.values(pantry).flat().map(ing => (
                      <button
                        key={ing}
                        type="button"
                        onClick={() => toggleIngredient(ing)}
                        className={`px-4 py-2.5 rounded-2xl border-2 font-bold text-xs transition-all ${selectedIngredients.includes(ing) ? 'bg-[#E2725B] border-[#E2725B] text-white shadow-lg' : 'bg-white border-[#EBE8E0] text-slate-500 hover:border-[#F5D5CE]'}`}
                      >
                        {ing}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#E2725B] text-white flex items-center justify-center text-xs">2</span>
                Budget Threshold
              </label>
              <div className="p-8 bg-[#2D2A26] rounded-[2.5rem] text-white">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-[#A6A196] uppercase tracking-widest">Target Daily Budget</span>
                    <span className="text-2xl font-black text-[#E2725B]">₹{dailyBudget}</span>
                </div>
                <input type="range" min="150" max="2500" step="50" value={dailyBudget} onChange={(e) => setDailyBudget(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#E2725B]" />
                <div className="mt-4 flex justify-between text-[9px] font-black text-[#A6A196] uppercase tracking-widest">
                  <span>Minimum ₹150</span>
                  <span>Max ₹2500</span>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-10">
            <section className="space-y-6">
              <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#E2725B] text-white flex items-center justify-center text-xs">3</span>
                Meal Configuration
              </label>
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setDiet(DietType.VEG)} className={`py-3 text-xs font-bold rounded-xl border-2 transition-all ${diet === DietType.VEG ? 'bg-[#F2F5F0] border-[#5B7A4B] text-[#5B7A4B]' : 'bg-white border-[#EBE8E0] text-slate-400'}`}>Pure Veg</button>
                    <button type="button" onClick={() => setDiet(DietType.NON_VEG)} className={`py-3 text-xs font-bold rounded-xl border-2 transition-all ${diet === DietType.NON_VEG ? 'bg-[#FBE9E4] border-[#E2725B] text-[#E2725B]' : 'bg-white border-[#EBE8E0] text-slate-400'}`}>Non-Veg</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-[#A6A196] uppercase ml-1">Time per Meal (min)</label>
                    <input type="number" value={time} onChange={(e) => setTime(parseInt(e.target.value))} className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold" />
                  </div>
              </div>
            </section>

            <section className="space-y-6">
              <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#E2725B] text-white flex items-center justify-center text-xs">4</span>
                Optimization
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(OptimizationGoal).map(goal => (
                  <button key={goal} type="button" onClick={() => setOptimization(goal)} className={`p-4 rounded-[1.5rem] border-2 flex flex-col items-center gap-2 transition-all ${optimization === goal ? 'bg-[#2D2A26] border-[#2D2A26] text-white shadow-xl' : 'bg-[#FAF9F6] border-[#EBE8E0] text-[#A6A196] hover:border-[#E2725B]'}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest">{goal}</span>
                  </button>
                ))}
              </div>
            </section>

            <Button type="submit" className="w-full py-6 text-xl shadow-2xl shadow-[#FBE9E4] bg-[#E2725B] hover:bg-[#D1604A]" isLoading={isLoading}>Review & Plan</Button>
          </div>
        </form>
      ) : (
        <div className="p-12 animate-in fade-in duration-500">
          <section className="mb-12">
            <h3 className="text-3xl font-black text-[#2D2A26] mb-8 serif italic">Using Your Ingredients</h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="p-8 bg-[#FAF9F6] rounded-[2.5rem] border border-[#EBE8E0]">
                   <p className="text-[10px] font-black text-[#E2725B] uppercase tracking-widest mb-4">Confirmed Ingredient Lock (3+ Applied)</p>
                   <div className="flex flex-wrap gap-2">
                      {selectedIngredients.map(ing => (
                        <span key={ing} className="px-3 py-1.5 bg-white border border-[#EBE8E0] text-slate-600 rounded-xl text-xs font-bold">✓ {ing}</span>
                      ))}
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-slate-900 text-white rounded-[2rem]">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Diet</p>
                      <p className="font-black text-sm">{diet}</p>
                   </div>
                   <div className="p-6 bg-slate-900 text-white rounded-[2rem]">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Duration</p>
                      <p className="font-black text-sm">{planDays} Days</p>
                   </div>
                </div>
              </div>
              <div className="space-y-6">
                 <div className="p-8 bg-[#2D2A26] text-white rounded-[2.5rem] border border-[#4A463F]">
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-[10px] font-black text-[#A6A196] uppercase tracking-widest">Economy Checkpoint</p>
                      <span className="px-3 py-1 bg-[#E2725B] rounded-lg text-[9px] font-black uppercase">Active</span>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between text-sm">
                          <span className="opacity-60">City Economy:</span>
                          <span className="font-bold">{cityType}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="opacity-60">Daily Budget:</span>
                          <span className="font-bold text-[#E2725B]">₹{dailyBudget}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="opacity-60">Optimization:</span>
                          <span className="font-bold uppercase">{optimization}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => setConfirmInputs(false)} className="flex-1 py-4 text-xs font-black text-[#A6A196] uppercase tracking-widest hover:text-[#2D2A26] transition-colors">Edit Parameters</button>
                    <button onClick={executeGeneration} className="flex-[2] py-4 bg-[#E2725B] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#FBE9E4] hover:bg-[#D1604A] transition-all">Generate Roadmap</button>
                 </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {showPantryModal && <PantryModal pantry={pantry} onSave={onUpdatePantry} onClose={() => setShowPantryModal(false)} />}
    </div>
  );
};
