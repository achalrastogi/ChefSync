
import React, { useState } from 'react';
import { CookingPlan, MealType } from '../types';

interface PlanDisplayProps {
  plan: CookingPlan;
  onReset: () => void;
  onReSchedule?: (plan: CookingPlan, newDate: string, newMealType: MealType) => void;
}

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onReset, onReSchedule }) => {
  const [completedPrep, setCompletedPrep] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMeal, setNewMeal] = useState<MealType>(plan.metadata.mealType);

  const togglePrep = (item: string) => {
    setCompletedPrep(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-10">
        <button 
          onClick={onReset}
          className="text-slate-500 hover:text-emerald-600 flex items-center gap-2 font-black text-sm uppercase tracking-widest transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Dashboard
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowSchedule(!showSchedule)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all"
          >
            Re-Schedule Meal
          </button>
          <span className="px-4 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
            {new Date(plan.metadata.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {showSchedule && (
        <div className="mb-12 p-8 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-200 animate-in slide-in-from-top-4 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase text-emerald-600 ml-2">Select New Date</label>
            <input type="date" value={newDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setNewDate(e.target.value)} className="w-full p-4 rounded-2xl border-none ring-1 ring-emerald-100 outline-none font-bold" />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase text-emerald-600 ml-2">Meal Type</label>
            <select value={newMeal} onChange={(e) => setNewMeal(e.target.value as MealType)} className="w-full p-4 rounded-2xl border-none ring-1 ring-emerald-100 outline-none font-bold appearance-none">
              {Object.values(MealType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button 
            onClick={() => onReSchedule?.(plan, newDate, newMeal)}
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl"
          >
            Confirm Re-Schedule
          </button>
        </div>
      )}

      <header className="mb-16 flex flex-col md:flex-row gap-12 items-center">
        <div className="md:w-[450px] w-full aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-[10px] border-white ring-1 ring-slate-100">
          <img src={plan.imageUrl || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800"} className="w-full h-full object-cover" alt={plan.recipeName} />
        </div>
        <div className="flex-1 space-y-6 text-center md:text-left">
          {plan.isFallback && (
            <div className="inline-block px-3 py-1 bg-red-50 text-red-700 text-[10px] font-black rounded-lg border border-red-100 uppercase tracking-widest">
              🚨 Ultra-Budget Fallback Plan
            </div>
          )}
          <div className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-100">
             💰 {plan.budgetFeasibility} (Est: ₹{plan.estimatedCostValue})
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight">{plan.recipeName}</h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">{plan.description}</p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
            <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
              <span className="font-black text-slate-700 uppercase tracking-widest text-xs">⏱️ {plan.totalTime}</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
              <span className="font-black text-slate-700 uppercase tracking-widest text-xs">🏙️ {plan.metadata.cityType}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-12">
          <section className="bg-emerald-50 rounded-[3rem] p-10 border border-emerald-100">
            <h3 className="text-xl font-black text-emerald-900 mb-6 flex items-center gap-3 uppercase tracking-tighter">Ingredients</h3>
            <div className="flex flex-wrap gap-2">
              {plan.ingredientsUsed.map((ing, idx) => (
                <span key={idx} className="px-4 py-2 bg-white text-emerald-600 border border-emerald-200 rounded-[1rem] text-xs font-bold shadow-sm">{ing}</span>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Prep Checklist</h3>
            <ul className="space-y-6">
              {plan.prepChecklist.map((task, idx) => (
                <li key={idx} className="flex items-center gap-4 cursor-pointer group" onClick={() => togglePrep(task)}>
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${completedPrep.includes(task) ? 'bg-emerald-600 border-emerald-600' : 'border-slate-200'}`}>
                    {completedPrep.includes(task) && <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                  </div>
                  <span className={`text-sm font-bold ${completedPrep.includes(task) ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{task}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-12">
          <section className="bg-white rounded-[4rem] p-12 shadow-2xl border border-slate-100">
            <h3 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">Cooking Sequence</h3>
            <div className="space-y-10 relative before:content-[''] before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-50">
              {plan.cookingSequence.map((step, idx) => (
                <div key={idx} className="relative pl-14 cursor-pointer group" onClick={() => toggleStep(idx)}>
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl border-2 z-10 flex items-center justify-center font-black text-sm transition-all ${completedSteps.includes(idx) ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-300'}`}>
                    {completedSteps.includes(idx) ? '✓' : idx + 1}
                  </div>
                  <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${completedSteps.includes(idx) ? 'bg-slate-50 opacity-60' : 'bg-white border-slate-50'}`}>
                    <p className={`text-lg font-bold ${completedSteps.includes(idx) ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{step.instruction}</p>
                    {step.timeEstimate && <span className="inline-block mt-4 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">⏱️ {step.timeEstimate}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
