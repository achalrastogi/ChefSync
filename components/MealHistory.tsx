
import React from 'react';
import { CookingPlan, MealType } from '../types';
import { Badge, Card } from './Shared';

interface MealHistoryProps {
  plans: CookingPlan[];
  onSelectPlan: (plan: CookingPlan) => void;
  onPlanNew: (date: string) => void;
}

export const MealHistory: React.FC<MealHistoryProps> = ({ plans, onSelectPlan, onPlanNew }) => {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayStr = todayDate.toISOString().split('T')[0];
  
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const getPlansForDay = (date: string) => plans.filter(p => p.metadata.date === date);

  return (
    <div className="space-y-24 mb-24">
      <section>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-[#2D2A26] tracking-tight serif italic">Culinary Calendar</h3>
            <p className="text-[#A6A196] font-medium text-sm">Organized by flavor, budget, and physical effort.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-5">
          {next7Days.map(date => {
            const dayPlans = getPlansForDay(date);
            const dateObj = new Date(date);
            const isToday = todayStr === date;
            const isPast = new Date(date) < todayDate;

            return (
              <div 
                key={date}
                className={`flex flex-col min-h-[220px] rounded-[2.5rem] border transition-all p-6 ${isToday ? 'bg-[#FBE9E4] border-[#F5D5CE] shadow-2xl shadow-[#FBE9E4]' : 'bg-white border-[#EBE8E0] hover:border-[#E2725B] shadow-sm'}`}
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
                        className={`p-4 rounded-3xl text-left transition-all ${isToday ? 'bg-white hover:bg-white/80 shadow-sm' : 'bg-[#FAF9F6] hover:bg-[#FBE9E4] border border-[#EBE8E0]'}`}
                      >
                        <div className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isToday ? 'text-[#E2725B]' : 'text-[#5B7A4B]'}`}>
                          {plan.metadata.mealType}
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
                      className={`flex-1 rounded-3xl border border-dashed flex items-center justify-center transition-all ${isPast ? 'border-[#EBE8E0] cursor-not-allowed opacity-30' : isToday ? 'border-[#E2725B]/40 hover:border-[#E2725B] text-[#E2725B]/40' : 'border-[#EBE8E0] hover:border-[#E2725B] text-[#A6A196]/40'}`}
                    >
                      {!isPast && <span className="text-xl">+</span>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {plans.length > 0 && (
        <section>
          <div className="flex items-center gap-6 mb-12">
            <h3 className="text-2xl font-black text-[#2D2A26] tracking-tight serif italic">Archived Masterpieces</h3>
            <div className="h-px bg-[#EBE8E0] flex-1"></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {plans.sort((a,b) => b.metadata.date.localeCompare(a.metadata.date)).slice(0, 9).map(plan => (
              <Card 
                key={plan.id}
                onClick={() => onSelectPlan(plan)}
                className="overflow-hidden group flex flex-col h-full"
              >
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                  <img src={plan.imageUrl} alt={plan.recipeName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <Badge variant="terracotta">{plan.metadata.mealType}</Badge>
                    {plan.estimatedCostValue < 150 && <Badge variant="sage">On-Budget</Badge>}
                    {parseInt(plan.totalTime) < 30 && <Badge variant="mustard">Quick Fix</Badge>}
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-[#2D2A26] group-hover:text-[#E2725B] transition-colors leading-tight serif italic mb-3">{plan.recipeName}</h4>
                    <p className="text-sm text-[#A6A196] font-medium line-clamp-2 leading-relaxed mb-6">{plan.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-[#EBE8E0]">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#E2725B]">Re-visit Dish ➔</span>
                     <span className="text-[10px] text-[#A6A196] font-black uppercase tracking-widest">{new Date(plan.metadata.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
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
