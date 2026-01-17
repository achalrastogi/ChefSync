
import React, { useState, useCallback, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { PlanDisplay } from './components/PlanDisplay';
import { MealHistory } from './components/MealHistory';
import { RecipeOptions } from './components/RecipeOptions';
import { DiscoverySection } from './components/DiscoverySection';
import { GroceryDisplay } from './components/GroceryDisplay';
import { UserDashboard } from './components/UserDashboard';
import { UserCreateModal } from './components/UserCreateModal';
import { useUsers } from './hooks/useUsers';
import { AccessibilityAnnouncer } from './components/Shared';
import { CookingInput, CookingPlan, RecipeOption, EnergyLevel, MealType, GroceryList, User, OptimizationGoal, TestResult, DailySchedule } from './types';
import { generateFullSchedule, generateGroceryList } from './services/geminiService';
import { trackEvent, logError } from './services/analytics';
import { runIntegrationTests } from './services/testRunner';

type ViewState = 'DASHBOARD' | 'USER_MAIN' | 'PLANNER' | 'SCHEDULE_VIEW' | 'DETAIL' | 'DISCOVERY' | 'TESTS';

const App: React.FC = () => {
  const { users, currentUser, setSelectedUserId, addUser, addPlan, updatePantry, updatePreferences } = useUsers();
  const [view, setView] = useState<ViewState>('DASHBOARD');
  
  const [loading, setLoading] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<DailySchedule | null>(null);
  const [currentPlan, setCurrentPlan] = useState<CookingPlan | null>(null);
  const [planDate, setPlanDate] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [loadingGrocery, setLoadingGrocery] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const announce = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const goHome = useCallback(() => {
    setSelectedUserId(null);
    setView('DASHBOARD');
    announce("Returned to Dashboard");
  }, [setSelectedUserId]);

  const handleRunTests = async () => {
    setView('TESTS');
    const results = await runIntegrationTests(users);
    setTestResults(results);
    announce(`Tests completed: ${results.filter(r => r.status === 'passed').length} passed`);
  };

  const handleGenerateSchedule = async (input: CookingInput, count: number, days: number = 1) => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    announce(`Synthesizing ${days}-day roadmap...`);
    try {
      const schedule = await generateFullSchedule(input, days);
      setActiveSchedule(schedule);
      setView('SCHEDULE_VIEW');
      announce(`Plan generated for ${days} days`);
    } catch (err) {
      logError(err as Error, 'handleGenerateSchedule');
      setError("AI could not validate plan against constraints.");
    } finally {
      setLoading(false);
    }
  };

  const adoptMeal = (recipe: RecipeOption, date: string, mealType: MealType, imageUrl?: string) => {
    if (!currentUser) return;
    const newPlan: CookingPlan = {
      ...recipe,
      id: crypto.randomUUID(),
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800",
      metadata: {
        mealType,
        date,
        energyLevel: EnergyLevel.NORMAL,
        diet: currentUser.diet,
        cityType: currentUser.cityType,
        optimizationGoal: OptimizationGoal.TASTE
      }
    };
    addPlan(currentUser.id, newPlan);
    setCurrentPlan(newPlan);
    setView('DETAIL');
    announce(`Confirmed: ${recipe.recipeName}`);
  };

  const handleGenerateGrocery = async () => {
    if (!currentUser) { setError("Select profile."); return; }
    if (currentUser.plans.length === 0) { setError("No plans added."); return; }
    setLoadingGrocery(true);
    announce("Consolidating groceries...");
    try {
      const list = await generateGroceryList(currentUser.plans);
      setGroceryList(list);
    } catch (e) { setError("Failed to generate list."); }
    finally { setLoadingGrocery(false); }
  };

  const renderView = () => {
    switch (view) {
      case 'DASHBOARD':
        return <UserDashboard users={users} onSelectUser={(u) => { setSelectedUserId(u.id); setView('USER_MAIN'); }} onCreateUser={() => setShowOnboarding(true)} onExportUserPlans={() => {}} onRunTests={handleRunTests} />;
      case 'SCHEDULE_VIEW':
        return activeSchedule && (
          <div className="max-w-7xl mx-auto py-12 px-6">
            <h2 className="text-4xl font-black mb-12 serif italic">Grouped Roadmap</h2>
            <div className="space-y-12">
              {activeSchedule.days.map((day, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                  <h3 className="text-2xl font-black mb-8 serif">Day {idx + 1}: {day.date}</h3>
                  <div className="grid lg:grid-cols-3 gap-8">
                    {[
                      { type: MealType.BREAKFAST as MealType, recipe: day.breakfast },
                      { type: MealType.LUNCH as MealType, recipe: day.lunch },
                      { type: MealType.DINNER as MealType, recipe: day.dinner }
                    ].map(slot => (
                      <div key={slot.type} className="flex flex-col gap-4 border p-6 rounded-3xl bg-[#FAF9F6]">
                        <span className="text-[10px] font-black uppercase text-[#E2725B]">{slot.type}</span>
                        <h4 className="text-xl font-bold">{slot.recipe.recipeName}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 italic">"{slot.recipe.description}"</p>
                        <div className="mt-auto pt-4 flex flex-col gap-2">
                           <p className="text-[9px] font-black uppercase tracking-widest text-[#A6A196]">Budget Status: {slot.recipe.budgetFeasibility}</p>
                           {slot.recipe.fallbacks && slot.recipe.fallbacks.length > 0 && (
                             <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                               <p className="text-[8px] font-black text-red-600 uppercase mb-1">Ultra-Budget Fallbacks Available</p>
                             </div>
                           )}
                           <button onClick={() => adoptMeal(slot.recipe, day.date, slot.type)} className="w-full py-3 bg-[#2D2A26] text-white rounded-xl text-[10px] font-black uppercase hover:bg-black">Adopt Meal</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
               <button onClick={() => setView('PLANNER')} className="text-xs font-black uppercase tracking-[0.2em] text-[#A6A196] border-b border-[#EBE8E0] pb-1">Regenerate Roadmap</button>
            </div>
          </div>
        );
      case 'USER_MAIN':
        return currentUser ? (
          <div className="max-w-7xl mx-auto py-12 px-6 lg:px-10">
             <div className="mb-12 flex justify-between items-center">
               <button onClick={goHome} className="text-xs font-black text-[#A6A196] uppercase">← Exit</button>
               <h2 className="text-4xl font-black serif italic">{currentUser.name}'s Map</h2>
               <button onClick={() => setView('PLANNER')} className="px-6 py-3 bg-[#E2725B] text-white rounded-2xl text-[10px] font-black uppercase">Plan Roadmap</button>
             </div>
             <MealHistory plans={currentUser.plans} onSelectPlan={(p) => { setCurrentPlan(p); setView('DETAIL'); }} onPlanNew={(date) => { setPlanDate(date); setView('PLANNER'); }} />
          </div>
        ) : null;
      case 'PLANNER':
        return currentUser ? <div className="max-w-7xl mx-auto py-12 px-10"><InputSection onSubmit={handleGenerateSchedule} isLoading={loading} initialTargetDate={planDate} pantry={currentUser.pantry} onUpdatePantry={(p) => updatePantry(currentUser.id, p)} /></div> : null;
      case 'DETAIL':
        return currentPlan ? <PlanDisplay plan={currentPlan} onReset={() => setView('USER_MAIN')} /> : null;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-warm-neutral flex flex-col font-sans">
      <AccessibilityAnnouncer message={statusMessage} />
      <nav className="bg-white/70 backdrop-blur-xl border-b border-[#EBE8E0] py-5 px-6 lg:px-12 sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={goHome}>
            <div className="bg-[#E2725B] p-2 rounded-xl shadow-lg shadow-[#FBE9E4]">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <span className="text-xl font-black text-[#2D2A26] uppercase italic serif tracking-tight">ChefSync</span>
          </div>
          <button 
            onClick={handleGenerateGrocery} 
            disabled={loadingGrocery} 
            className="px-6 py-3 bg-[#E2725B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#FBE9E4] hover:bg-[#D1604A]"
          >
            {loadingGrocery ? "Auditing..." : "Grocery Audit"}
          </button>
        </div>
      </nav>
      <main className="flex-1">
        {renderView()}
        {error && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 p-6 bg-[#FBE9E4] text-[#E2725B] border border-[#F5D5CE] rounded-[2rem] shadow-2xl z-[100] max-w-sm text-center">
             <span className="font-black text-[10px] uppercase">{error}</span>
          </div>
        )}
        {groceryList && <GroceryDisplay list={groceryList} onClose={() => setGroceryList(null)} />}
        {showOnboarding && <UserCreateModal onSave={(u) => { addUser(u); setShowOnboarding(false); setView('USER_MAIN'); }} onClose={() => setShowOnboarding(false)} />}
      </main>
    </div>
  );
};

export default App;
