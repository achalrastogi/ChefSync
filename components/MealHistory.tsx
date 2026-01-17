
import React, { useMemo } from 'react';
import { CookingPlan, MealType } from '../types';
import { Badge, Card } from './Shared';

interface MealHistoryProps {
  plans: CookingPlan[];
  onSelectPlan: (plan: CookingPlan) => void;
  onPlanNew: (date: string) => void;
}

export const MealHistory: React.FC<MealHistoryProps> = ({ plans = [], onSelectPlan, onPlanNew }) => {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayStr = todayDate.toISOString().split('T')[0];
  
  // DYNAMIC CALENDAR LOGIC:
  // Instead of always starting from 'today', we start from either 'today' or the 
  // first date in the plans, whichever is earlier/more relevant to showing the roadmap.
  const calendarDates = useMemo(() => {
    let startDate = new Date(todayDate);
    
    // If we have plans, let's find the earliest planned date to ensure they show up in the calendar
    if (plans.length > 0) {
      const planDates = plans.map(p => new Date(p.metadata.date));
      const minPlanDate = new Date(Math.min(...planDates.map(d => d.getTime())));
      if (minPlanDate < startDate) {
        startDate = minPlanDate;
      }
    }

    return Array.from({ length: 14 }, (_, i) => { // Show 2 weeks for better roadmap view
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, [plans]);

  const getPlansForDay = (date: string) => (plans || []).filter(p => p.metadata && p.metadata.date === date);

  const handlePrintFullRoadmap = () => {
    // We use a custom event or class toggling to ensure the printer only sees the printable section
    window.print();
  };

  const sortedPlans = useMemo(() => {
    return [...(plans || [])].sort((a, b) => {
      if (!a.metadata || !b.metadata) return 0;
      const dateComp = a.metadata.date.localeCompare(b.metadata.date);
      if (dateComp !== 0) return dateComp;
      const mealOrder = { BREAKFAST: 0, LUNCH: 1, DINNER: 2 };
      return mealOrder[a.metadata.mealType] - mealOrder[b.metadata.mealType];
    });
  }, [plans]);

  return (
    <div className="space-y-24 mb-24">
      {/* MASTER PDF EXPORT VIEW (Hidden on screen, visible on print) */}
      <div id="printable-roadmap" className="hidden print:block print:bg-white print:m-0 print:p-8 space-y-16">
        <div className="text-center border-b-8 border-slate-900 pb-12 mb-20">
          <h1 className="text-6xl font-black serif italic uppercase tracking-tighter text-slate-900">ChefSync Master Roadmap</h1>
          <p className="text-slate-500 font-bold tracking-[0.5em] text-sm mt-6">OFFICIAL SYNTHESIZED CULINARY LOG</p>
          <p className="text-[10px] text-slate-400 mt-2">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        
        {sortedPlans.map(plan => (
          <div key={plan.id} className="p-12 border-4 border-slate-100 rounded-[4rem] page-break-inside-avoid mb-16 bg-white shadow-none">
            <div className="flex justify-between items-start mb-10">
              <div className="max-w-xl">
                <span className="text-[12px] font-black uppercase text-[#E2725B] tracking-[0.3em]">
                  {plan.metadata ? new Date(plan.metadata.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date'}
                </span>
                <h2 className="text-5xl font-black serif italic text-slate-900 mt-3 leading-tight">{plan.recipeName}</h2>
                <div className="mt-4 flex gap-3">
                  <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">{plan.metadata?.mealType}</span>
                  <span className="px-4 py-2 border-2 border-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Time: {plan.totalTime}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-slate-900">₹{plan.estimatedCostValue}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">{plan.budgetFeasibility}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-16 mb-12 bg-slate-50 p-10 rounded-[3rem]">
              <div>
                <h3 className="text-xs font-black uppercase mb-6 text-slate-400 tracking-widest border-b-2 border-slate-200 pb-2">Synthesis Components</h3>
                <ul className="text-sm space-y-3 font-semibold text-slate-700">
                  {(plan.ingredientsUsed || []).map((ing, i) => <li key={i} className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-[#E2725B]"></span> {ing}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-black uppercase mb-6 text-slate-400 tracking-widest border-b-2 border-slate-200 pb-2">Substitution Protocols</h3>
                {(plan.substitutions || []).length > 0 ? (
                  <ul className="text-xs space-y-4">
                    {plan.substitutions.map((s, i) => (
                      <li key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="font-black text-slate-900 uppercase text-[10px] mb-2">{s.original} → {s.replacement}</p>
                        <p className="text-slate-500 italic leading-relaxed">"{s.reason}"</p>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm italic text-slate-400 font-medium">Standard ingredient protocol utilized.</p>}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase mb-8 text-slate-400 tracking-widest">Execution Sequence</h3>
              <div className="space-y-6">
                {(plan.cookingSequence || []).map((step, i) => (
                  <div key={i} className="flex gap-8 items-start">
                    <span className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg">{i+1}</span>
                    <div className="pt-2">
                      <p className="text-lg font-bold text-slate-800 leading-snug">{step.instruction}</p>
                      {step.timeEstimate && <span className="text-[10px] font-black text-[#E2725B] uppercase tracking-[0.2em] mt-2 block">Allocated Time: {step.timeEstimate}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 pt-10 border-t-2 border-slate-50">
                <h4 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.5em] mb-4">Analytic Notes</h4>
                <p className="text-xs text-slate-500 italic leading-relaxed">{plan.additionalNotes}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SCREEN UI */}
      <section className="print:hidden px-6 lg:px-0">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-[#2D2A26] tracking-tight serif italic">Culinary Calendar</h3>
            <p className="text-[#A6A196] font-medium text-sm">Synchronized workflow roadmap for the next 14 cycles.</p>
          </div>
          {plans.length > 0 && (
             <button 
                onClick={handlePrintFullRoadmap}
                className="px-8 py-4 bg-white border-2 border-[#EBE8E0] text-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#E2725B] hover:text-[#E2725B] transition-all flex items-center gap-3 shadow-sm active:scale-95"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Export Master PDF
             </button>
          )}
        </div>
        
        <div className="overflow-x-auto pb-8 scrollbar-hide">
          <div className="flex gap-5 min-w-max px-2">
            {calendarDates.map(date => {
              const dayPlans = getPlansForDay(date);
              const dateObj = new Date(date);
              const isToday = todayStr === date;
              const isPast = new Date(date) < todayDate;

              return (
                <div 
                  key={date}
                  className={`flex flex-col w-56 min-h-[260px] rounded-[2.5rem] border transition-all p-6 ${isToday ? 'bg-[#FBE9E4] border-[#F5D5CE] shadow-2xl shadow-[#FBE9E4]' : 'bg-white border-[#EBE8E0] hover:border-[#E2725B] shadow-sm'}`}
                >
                  <div className="text-center mb-6">
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isToday ? 'text-[#E2725B]' : 'text-[#A6A196]'}`}>
                      {dateObj.toLocaleDateString(undefined, { weekday: 'short' })}
                    </p>
                    <p className={`text-4xl font-black serif ${isToday ? 'text-[#E2725B]' : 'text-[#2D2A26]'}`}>{dateObj.getDate()}</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-3">
                    {dayPlans.length > 0 ? (
                      dayPlans.map(plan => (
                        <button 
                          key={plan.id}
                          onClick={() => onSelectPlan(plan)}
                          className={`p-4 rounded-3xl text-left transition-all ${isToday ? 'bg-white hover:bg-white/80 shadow-sm border border-[#F5D5CE]' : 'bg-[#FAF9F6] hover:bg-[#FBE9E4] border border-[#EBE8E0]'}`}
                        >
                          <div className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isToday ? 'text-[#E2725B]' : 'text-[#5B7A4B]'}`}>
                            {plan.metadata?.mealType || 'MEAL'}
                          </div>
                          <p className="text-[10px] font-black leading-tight line-clamp-2 text-slate-800">
                            {plan.recipeName}
                          </p>
                        </button>
                      ))
                    ) : (
                      <button 
                        onClick={() => !isPast && onPlanNew(date)}
                        disabled={isPast}
                        className={`flex-1 rounded-3xl border-2 border-dashed flex items-center justify-center transition-all ${isPast ? 'border-slate-100 cursor-not-allowed opacity-30' : isToday ? 'border-[#E2725B]/40 hover:border-[#E2725B] text-[#E2725B]/40 bg-white/50' : 'border-[#EBE8E0] hover:border-[#E2725B] text-[#A6A196]/40 hover:bg-[#FAF9F6]'}`}
                      >
                        {!isPast && <span className="text-2xl font-light">+</span>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {plans.length > 0 && (
        <section className="print:hidden px-6 lg:px-0">
          <div className="flex items-center gap-6 mb-12">
            <h3 className="text-2xl font-black text-[#2D2A26] tracking-tight serif italic">Archived Masterpieces</h3>
            <div className="h-px bg-[#EBE8E0] flex-1"></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...(plans || [])].sort((a,b) => (b.metadata?.date || '').localeCompare(a.metadata?.date || '')).slice(0, 9).map(plan => (
              <Card 
                key={plan.id}
                onClick={() => onSelectPlan(plan)}
                className="overflow-hidden group flex flex-col h-full"
              >
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                  <img src={plan.imageUrl || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800"} alt={plan.recipeName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <Badge variant="terracotta">{plan.metadata?.mealType}</Badge>
                    {plan.estimatedCostValue < 150 && <Badge variant="sage">On-Budget</Badge>}
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-[#2D2A26] group-hover:text-[#E2725B] transition-colors leading-tight serif italic mb-3">{plan.recipeName}</h4>
                    <p className="text-sm text-[#A6A196] font-medium line-clamp-2 leading-relaxed mb-6">{plan.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-[#EBE8E0]">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#E2725B]">Execute Roadmap ➔</span>
                     <span className="text-[10px] text-[#A6A196] font-black uppercase tracking-widest">{plan.metadata ? new Date(plan.metadata.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '---'}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
