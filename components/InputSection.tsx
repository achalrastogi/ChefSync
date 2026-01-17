
import React, { useState, useMemo, useEffect } from 'react';
import { DietType, KitchenSetup, CookingInput, MealType, EnergyLevel, Pantry, CityType, OptimizationGoal } from '../types';
import { Button } from './Button';
import { PantryModal } from './PantryModal';
import { Badge } from './Shared';

interface InputSectionProps {
  onSubmit: (data: CookingInput, days: number) => void;
  isLoading: boolean;
  initialTargetDate?: string;
  pantry: Pantry;
  onUpdatePantry: (pantry: Pantry) => void;
  personaTime?: number;
  diet: DietType;
}

export const InputSection: React.FC<InputSectionProps> = ({ onSubmit, isLoading, initialTargetDate, pantry, onUpdatePantry, personaTime, diet }) => {
  const [time, setTime] = useState(personaTime || 30);
  const [cityType, setCityType] = useState<CityType>(CityType.TIER_2);
  const [dailyBudget, setDailyBudget] = useState(300);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [optimization, setOptimization] = useState<OptimizationGoal>(OptimizationGoal.TASTE);
  const [showPantryModal, setShowPantryModal] = useState(false);
  const [confirmInputs, setConfirmInputs] = useState(false);
  const [generationDays, setGenerationDays] = useState(3);
  
  const today = new Date().toISOString().split('T')[0];
  const [targetDate, setTargetDate] = useState(initialTargetDate || today);

  const availableIngredients = useMemo(() => {
    let list: string[] = [...pantry.veg, ...pantry.oils, ...pantry.masalas];
    if (diet === DietType.NON_VEG) {
      list = [...list, ...pantry.nonVeg];
    }
    return list;
  }, [pantry, diet]);

  useEffect(() => {
    setSelectedIngredients(prev => prev.filter(ing => availableIngredients.includes(ing)));
  }, [availableIngredients]);

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  const handleProceedToReview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedIngredients.length < 5) {
      alert(`Architecture Error: Synthesis requires at least 5 ingredients to validate budget & nutrition. You currently have ${selectedIngredients.length}.`);
      return;
    }
    setConfirmInputs(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeGeneration = (e: React.MouseEvent) => {
    e.preventDefault();
    onSubmit({
      diet, mealType: MealType.LUNCH, energyLevel: EnergyLevel.NORMAL, timeAvailable: time,
      kitchenSetup: KitchenSetup.MEDIUM, ingredients: selectedIngredients,
      targetDate, cityType, dailyBudget, optimizationGoal: optimization
    }, generationDays);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {!confirmInputs ? (
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[#EBE8E0] animate-in fade-in duration-500">
          <div className="p-12 border-b border-[#EBE8E0] bg-[#FAF9F6]">
            <h2 className="text-4xl font-black text-[#2D2A26] serif italic tracking-tighter">Blueprint Synthesis</h2>
            <p className="text-[#A6A196] font-medium mt-2">Personalize your engine parameters before generation.</p>
          </div>
          
          <div className="p-12 space-y-12">
            <div className="grid md:grid-cols-2 gap-12">
              <section className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-widest">
                    1. Pantry Audit ({diet} Only • 5+ Required)
                  </label>
                  <button type="button" onClick={() => setShowPantryModal(true)} className="text-[10px] font-bold text-[#E2725B] underline">Edit Master</button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-[#FAF9F6] rounded-2xl border border-[#EBE8E0]">
                  {availableIngredients.map(ing => (
                    <button
                      key={ing}
                      type="button"
                      onClick={() => toggleIngredient(ing)}
                      className={`px-4 py-2 rounded-xl border font-bold text-[10px] transition-all ${selectedIngredients.includes(ing) ? 'bg-[#2D2A26] border-[#2D2A26] text-white shadow-md' : 'bg-white border-[#EBE8E0] text-slate-500 hover:border-[#E2725B]'}`}
                    >
                      {ing}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <label className="text-xs font-black text-slate-800 uppercase tracking-widest block">2. Constraints & Goals</label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                       <span className="text-[9px] font-black uppercase text-[#A6A196]">Start Date</span>
                       <input 
                         type="date" 
                         value={targetDate} 
                         min={today}
                         onChange={(e) => setTargetDate(e.target.value)} 
                         className="w-full p-3 rounded-xl border border-[#EBE8E0] text-xs font-bold outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <span className="text-[9px] font-black uppercase text-[#A6A196]">Duration</span>
                       <select value={generationDays} onChange={(e) => setGenerationDays(parseInt(e.target.value))} className="w-full p-3 rounded-xl border border-[#EBE8E0] text-xs font-bold outline-none">
                         {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} Day{n>1?'s':''} {n === 7 ? '(Full Week)' : ''}</option>)}
                       </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase text-[#A6A196]">Daily Budget: ₹{dailyBudget}</span>
                    <input type="range" min="150" max="1500" step="50" value={dailyBudget} onChange={(e) => setDailyBudget(parseInt(e.target.value))} className="w-full h-1 bg-[#EBE8E0] rounded-lg appearance-none cursor-pointer accent-[#E2725B]" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase text-[#A6A196]">Economy</span>
                    <select value={cityType} onChange={(e) => setCityType(e.target.value as CityType)} className="w-full p-3 rounded-xl border border-[#EBE8E0] text-xs font-bold outline-none">
                       {Object.values(CityType).map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
              </section>
            </div>

            <button 
              type="button"
              onClick={handleProceedToReview} 
              className="w-full py-5 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl bg-[#2D2A26] hover:bg-black text-white rounded-2xl transition-all active:scale-95"
            >
              Review Synthesis Parameters
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] shadow-2xl p-16 animate-in zoom-in-95 duration-500 text-center border border-[#EBE8E0]">
          <h3 className="text-4xl font-black text-[#2D2A26] serif italic mb-6">Confirm Blueprint</h3>
          <p className="text-[#A6A196] max-w-lg mx-auto mb-12">Generating a {generationDays}-day culinary roadmap starting {targetDate}.</p>
          
          <div className="grid md:grid-cols-2 gap-12 text-left mb-12">
            <div className="bg-[#FAF9F6] p-8 rounded-[2rem] border border-[#EBE8E0]">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-[#E2725B] mb-4">Plan Summary</h4>
               <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-700">✓ {generationDays} Days Scheduled</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-700">✓ Starts on {new Date(targetDate).toLocaleDateString()}</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-700">✓ Budget Cap: ₹{dailyBudget * generationDays}</li>
               </ul>
            </div>
            <div className="bg-[#FAF9F6] p-8 rounded-[2rem] border border-[#EBE8E0]">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-[#A6A196] mb-4">Locked Pantry Items</h4>
               <div className="flex flex-wrap gap-2">
                  {selectedIngredients.map(i => <span key={i} className="text-[9px] font-bold px-2 py-1 bg-white border border-[#EBE8E0] rounded-lg">{i}</span>)}
               </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <div className="w-full bg-[#FAF9F6] h-2 rounded-full overflow-hidden">
                <div className="bg-[#E2725B] h-full animate-[progress_3s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#E2725B] animate-pulse">Orchestrating Workflow Blueprint...</p>
            </div>
          ) : (
            <div className="flex gap-4">
              <button onClick={() => setConfirmInputs(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-[#A6A196] hover:text-[#2D2A26]">Adjust Inputs</button>
              <button onClick={executeGeneration} className="flex-[2] py-4 bg-[#E2725B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D1604A] transition-all shadow-lg active:scale-95">Lock & Generate</button>
            </div>
          )}
        </div>
      )}

      {showPantryModal && <PantryModal pantry={pantry} onSave={onUpdatePantry} onClose={() => setShowPantryModal(false)} />}
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};
