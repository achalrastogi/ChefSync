
import React, { useState, useEffect } from 'react';
import { CookingPlan } from '../types';
import { generateRecipeImage, generateChefTips } from '../services/geminiService';
import { Badge } from './Shared';

interface PlanDisplayProps {
  plan: CookingPlan;
  onReset: () => void;
}

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan: initialPlan, onReset }) => {
  const [plan, setPlan] = useState<CookingPlan>(initialPlan);
  const [completedPrep, setCompletedPrep] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // AI States
  const [chefTips, setChefTips] = useState<string | null>(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [isHQ, setIsHQ] = useState(false);

  // AI Enhancement: Fetch Chef Tips on mount
  useEffect(() => {
    const fetchTips = async () => {
      setLoadingTips(true);
      try {
        const tips = await generateChefTips(plan.recipeName, plan.ingredientsUsed);
        setChefTips(tips);
      } catch (err) {
        console.error("Chef Tips failed", err);
      } finally {
        setLoadingTips(false);
      }
    };
    fetchTips();
  }, [plan.recipeName, plan.ingredientsUsed]);

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

  const regenerateImage = async (useHQ: boolean) => {
    setLoadingImage(true);
    setIsHQ(useHQ);
    try {
      const prompt = `Professional food photography of ${plan.recipeName}. Ingredients: ${plan.ingredientsUsed.join(', ')}.`;
      const newUrl = await generateRecipeImage(prompt, useHQ);
      setPlan(prev => ({ ...prev, imageUrl: newUrl }));
    } catch (err) {
      console.error("Image regeneration failed", err);
    } finally {
      setLoadingImage(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-10">
        <button 
          onClick={onReset}
          className="text-slate-500 hover:text-[#E2725B] flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Map
        </button>
        <div className="flex gap-3">
          <span className="px-4 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
            {new Date(plan.metadata.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <header className="mb-16 flex flex-col md:flex-row gap-12 items-start">
        <div className="md:w-[450px] w-full group relative">
          <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-[10px] border-white ring-1 ring-slate-100 bg-slate-50 relative">
            {loadingImage && (
               <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                  <div className="flex flex-col items-center gap-4">
                     <div className="w-12 h-12 border-4 border-[#FBE9E4] border-t-[#E2725B] rounded-full animate-spin"></div>
                     <p className="text-[10px] font-black uppercase text-[#E2725B] tracking-widest animate-pulse">Refining Vision...</p>
                  </div>
               </div>
            )}
            <img src={plan.imageUrl || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800"} className="w-full h-full object-cover" alt={plan.recipeName} />
          </div>
          
          <div className="mt-6 flex gap-2 justify-center">
             <button 
                onClick={() => regenerateImage(false)} 
                className={`px-4 py-2 text-[9px] font-black uppercase rounded-xl transition-all border ${!isHQ ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
              >
                Standard
              </button>
             <button 
                onClick={() => regenerateImage(true)} 
                className={`px-4 py-2 text-[9px] font-black uppercase rounded-xl transition-all border ${isHQ ? 'bg-[#E2725B] text-white border-[#E2725B] shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-[#E2725B]'}`}
              >
                High-Quality (AI)
              </button>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap gap-3">
            {plan.isFallback && <Badge variant="red">Ultra-Budget Fallback</Badge>}
            <Badge variant="terracotta">💰 {plan.budgetFeasibility} (₹{plan.estimatedCostValue})</Badge>
            <Badge variant="mustard">⚡ {plan.metadata.optimizationGoal}</Badge>
            {isHQ && <Badge variant="sage">✨ AI Refined Vision</Badge>}
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight serif italic">{plan.recipeName}</h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed italic">"{plan.description}"</p>
          
          <div className="p-8 bg-[#FAF9F6] rounded-[2.5rem] border-2 border-[#EBE8E0] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v2h-2zm0 4h2v5h-2z"/></svg>
             </div>
             <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#E2725B] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B]"></span>
                Chef's Secrets (AI Enhanced)
             </h4>
             {loadingTips ? (
                <div className="space-y-2">
                   <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                   <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
                </div>
             ) : (
                <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line">
                   {chefTips || "Synthesizing culinary insights..."}
                </p>
             )}
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-12">
          <section className="bg-white rounded-[3rem] p-10 border border-[#EBE8E0] shadow-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 serif italic">Ingredients</h3>
            <div className="flex flex-wrap gap-2">
              {plan.ingredientsUsed.map((ing, idx) => (
                <span key={idx} className="px-4 py-2 bg-[#FAF9F6] text-slate-700 border border-[#EBE8E0] rounded-xl text-xs font-bold">{ing}</span>
              ))}
            </div>
          </section>

          <section className="bg-[#FAF9F6] rounded-[3rem] p-10 border border-[#EBE8E0]">
            <h3 className="text-xl font-black text-slate-900 mb-8 serif italic">Prep Checklist</h3>
            <ul className="space-y-6">
              {plan.prepChecklist.map((task, idx) => (
                <li key={idx} className="flex items-center gap-4 cursor-pointer group" onClick={() => togglePrep(task)}>
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${completedPrep.includes(task) ? 'bg-[#E2725B] border-[#E2725B]' : 'border-slate-200 bg-white'}`}>
                    {completedPrep.includes(task) && <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                  </div>
                  <span className={`text-sm font-bold ${completedPrep.includes(task) ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{task}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-12">
          <section className="bg-white rounded-[4rem] p-12 shadow-2xl border border-[#EBE8E0]">
            <h3 className="text-3xl font-black text-slate-900 mb-10 serif italic">Cooking Sequence</h3>
            <div className="space-y-10 relative before:content-[''] before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#EBE8E0]">
              {plan.cookingSequence.map((step, idx) => (
                <div key={idx} className="relative pl-14 cursor-pointer group" onClick={() => toggleStep(idx)}>
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl border-2 z-10 flex items-center justify-center font-black text-sm transition-all ${completedSteps.includes(idx) ? 'bg-[#2D2A26] border-[#2D2A26] text-white' : 'bg-white border-[#EBE8E0] text-slate-300'}`}>
                    {completedSteps.includes(idx) ? '✓' : idx + 1}
                  </div>
                  <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${completedSteps.includes(idx) ? 'bg-slate-50 opacity-60 border-[#EBE8E0]' : 'bg-white border-[#FAF9F6] shadow-sm hover:border-[#E2725B]'}`}>
                    <p className={`text-lg font-bold ${completedSteps.includes(idx) ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{step.instruction}</p>
                    {step.timeEstimate && <span className="inline-block mt-4 text-[10px] font-black text-[#E2725B] bg-[#FBE9E4] px-3 py-1.5 rounded-xl uppercase tracking-widest">⏱️ {step.timeEstimate}</span>}
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
