
import React, { useState, useCallback, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { PlanDisplay } from './components/PlanDisplay';
import { MealHistory } from './components/MealHistory';
import { GroceryDisplay } from './components/GroceryDisplay';
import { UserDashboard } from './components/UserDashboard';
import { OnboardingFlow } from './components/OnboardingFlow';
import { SchedulingTools } from './components/SchedulingTools';
import { ScheduleView } from './components/ScheduleView';
import { ProfileSettings } from './components/ProfileSettings';
import { useUsers } from './hooks/useUsers';
import { AccessibilityAnnouncer } from './components/Shared';
import { CookingInput, CookingPlan, RecipeOption, EnergyLevel, MealType, GroceryList, OptimizationGoal, TestResult, DailySchedule } from './types';
import { generateFullSchedule, generateGroceryList } from './services/geminiService';
import { logError } from './services/analytics';
import { runIntegrationTests } from './services/testRunner';

type ViewState = 'DASHBOARD' | 'ONBOARDING' | 'USER_MAIN' | 'PLANNER' | 'SCHEDULE_VIEW' | 'SCHEDULE_TOOLS' | 'DETAIL' | 'TESTS' | 'PROFILE_SETTINGS';

const App: React.FC = () => {
  const { users = [], currentUser, setSelectedUserId, addUser, addPlan, addBatchPlans, updateUser, updatePantry } = useUsers();
  const [view, setView] = useState<ViewState>('DASHBOARD');
  
  const [loading, setLoading] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<DailySchedule | null>(null);
  const [currentPlan, setCurrentPlan] = useState<CookingPlan | null>(null);
  const [planDate, setPlanDate] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  useEffect(() => {
    if (currentUser && !currentUser.onboardingComplete) {
      setView('ONBOARDING');
    } else if (currentUser && view === 'DASHBOARD') {
      setView('USER_MAIN');
    }
  }, [currentUser, view]);

  const announce = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const goHome = useCallback(() => {
    setSelectedUserId(null);
    setView('DASHBOARD');
    announce("Returned to Profile Dashboard");
  }, [setSelectedUserId]);

  const handleRunTests = async () => {
    setView('TESTS');
    announce("Executing AI-enhanced engine diagnostics...");
    const results = await runIntegrationTests(users);
    setTestResults(results);
    announce(`Quality Scan Complete: ${results.filter(r => r.status === 'passed').length} units verified.`);
  };

  const handleGenerateSchedule = async (input: CookingInput, days: number = 3) => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    announce(`Synthesizing your ${days}-day roadmap starting ${input.targetDate}...`);
    try {
      const schedule = await generateFullSchedule({ ...input, allergies: currentUser.allergies }, days);
      if (!schedule || !schedule.days) throw new Error("Synthesis produced empty roadmap.");
      setActiveSchedule(schedule);
      setView('SCHEDULE_VIEW');
      announce("Compliance validation successful.");
    } catch (err) {
      logError(err as Error, 'handleGenerateSchedule');
      setError("Compliance failure: The model could not satisfy the current ingredient lock or budget gate.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdoptSchedule = () => {
    if (!currentUser || !activeSchedule || !activeSchedule.days) return;
    
    const plansToCommit: CookingPlan[] = activeSchedule.days.flatMap(day => {
      return (['breakfast', 'lunch', 'dinner'] as const).map(mKey => {
        const recipe = day[mKey];
        if (!recipe) return null;
        return {
          ...recipe,
          id: crypto.randomUUID(),
          imageUrl: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800",
          metadata: {
            mealType: mKey.toUpperCase() as MealType,
            date: day.date,
            energyLevel: EnergyLevel.NORMAL,
            diet: currentUser.diet,
            cityType: currentUser.cityType,
            optimizationGoal: OptimizationGoal.TASTE
          }
        } as CookingPlan;
      });
    }).filter((p): p is CookingPlan => p !== null);

    addBatchPlans(currentUser.id, plansToCommit);
    setActiveSchedule(null);
    setView('USER_MAIN');
    announce("Full schedule committed to your roadmap.");
  };

  const adoptMeal = (recipe: RecipeOption, date: string, mealType: MealType) => {
    if (!currentUser) return;
    const newPlan: CookingPlan = {
      ...recipe,
      id: crypto.randomUUID(),
      imageUrl: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800",
      metadata: {
        mealType, date,
        energyLevel: EnergyLevel.NORMAL,
        diet: currentUser.diet,
        cityType: currentUser.cityType,
        optimizationGoal: OptimizationGoal.TASTE
      }
    };
    addPlan(currentUser.id, newPlan);
    setCurrentPlan(newPlan);
    setView('DETAIL');
    announce(`Recipe locked: ${recipe.recipeName}`);
  };

  const handleGenerateGrocery = async () => {
    if (!currentUser) { setError("Select profile."); return; }
    
    const scheduleDays = activeSchedule?.days || [];
    const userPlans = currentUser.plans || [];
    
    const plansToAudit = scheduleDays.length > 0 
      ? scheduleDays.flatMap(d => [d.breakfast, d.lunch, d.dinner]).filter(Boolean)
      : userPlans;

    if (plansToAudit.length === 0) { 
      setError("No roadmap generated to audit."); 
      return; 
    }
    
    const tempPlans: CookingPlan[] = plansToAudit.map(p => ({
        ...p, id: 'temp', metadata: { cityType: currentUser.cityType }
    } as CookingPlan));

    setLoading(true);
    announce("Auditing logistics via GenAI...");
    try {
      const list = await generateGroceryList(tempPlans);
      if (!list || !list.items) throw new Error("Grocery audit returned no data.");
      setGroceryList(list);
    } catch (e) { 
      setError("Logistics audit failed."); 
    } finally { 
      setLoading(false); 
    }
  };

  const renderView = () => {
    switch (view) {
      case 'DASHBOARD':
        return <UserDashboard users={users} onSelectUser={(u) => setSelectedUserId(u.id)} onCreateUser={() => { const newUser = addUser(); setSelectedUserId(newUser.id); }} onRunTests={handleRunTests} />;
      case 'ONBOARDING':
        return currentUser && <OnboardingFlow user={currentUser} onSave={(updatedUser) => { updateUser(updatedUser); setView('USER_MAIN'); announce(`Welcome, ${updatedUser.name}. Engine ready.`); }} />;
      case 'SCHEDULE_VIEW':
        return activeSchedule && currentUser && <ScheduleView schedule={activeSchedule} user={currentUser} onAdopt={adoptMeal} onFinalize={() => setView('SCHEDULE_TOOLS')} onReset={() => setView('PLANNER')} />;
      case 'SCHEDULE_TOOLS':
        return activeSchedule && currentUser && <SchedulingTools schedule={activeSchedule} user={currentUser} onUpdatePrefs={updateUser} onBack={() => setView('SCHEDULE_VIEW')} onFinalizeCommit={handleAdoptSchedule} />;
      case 'USER_MAIN':
        return currentUser ? (
          <div className="max-w-7xl mx-auto py-12 px-6 lg:px-10 no-print">
             <div className="mb-12 flex justify-between items-center">
               <div className="flex gap-4 items-center">
                 <button onClick={goHome} className="text-xs font-black text-[#A6A196] uppercase hover:text-slate-800 transition-colors">← Exit Dashboard</button>
                 <button onClick={() => setView('PROFILE_SETTINGS')} className="text-xs font-black text-[#E2725B] uppercase underline underline-offset-4">Settings</button>
               </div>
               <h2 className="text-4xl font-black serif italic text-slate-900">{currentUser.name}'s Roadmap</h2>
               <button onClick={() => setView('PLANNER')} className="px-6 py-3 bg-[#2D2A26] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">New Synthesis</button>
             </div>
             <MealHistory plans={currentUser.plans || []} onSelectPlan={(p) => { setCurrentPlan(p); setView('DETAIL'); }} onPlanNew={(date) => { setPlanDate(date); setView('PLANNER'); }} />
          </div>
        ) : null;
      case 'PLANNER':
        return currentUser ? <div className="max-w-7xl mx-auto py-12 px-10 no-print"><InputSection onSubmit={handleGenerateSchedule} isLoading={loading} initialTargetDate={planDate} pantry={currentUser.pantry} onUpdatePantry={(p) => updatePantry(currentUser.id, p)} personaTime={currentUser.cookingTimePerMeal} diet={currentUser.diet} /></div> : null;
      case 'DETAIL':
        return currentPlan ? <div className="no-print"><PlanDisplay plan={currentPlan} onReset={() => setView('USER_MAIN')} /></div> : null;
      case 'TESTS':
        return (
          <div className="max-w-xl mx-auto py-20 no-print">
            <h2 className="text-2xl font-black mb-8 serif italic">Engine Diagnostics (AI-Enhanced)</h2>
            <div className="space-y-4">
              {testResults.map((tr, i) => (
                <div key={i} className={`p-6 bg-white border rounded-3xl transition-all ${tr.status === 'failed' ? 'border-red-200' : 'border-[#EBE8E0]'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800 text-sm">{tr.name}</span>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${tr.status === 'passed' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{tr.status}</span>
                  </div>
                  {tr.error && <p className="text-xs text-slate-500 italic mt-2">"{tr.error}"</p>}
                </div>
              ))}
            </div>
            <button onClick={() => setView('DASHBOARD')} className="mt-8 w-full py-5 bg-[#2D2A26] text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">Close Diagnostic Report</button>
          </div>
        );
      case 'PROFILE_SETTINGS':
        return currentUser ? <ProfileSettings user={currentUser} onSave={updateUser} onClose={() => setView('USER_MAIN')} /> : null;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-warm-neutral flex flex-col font-sans overflow-x-hidden">
      <AccessibilityAnnouncer message={statusMessage} />
      <nav className="bg-white/70 backdrop-blur-xl border-b border-[#EBE8E0] py-5 px-6 lg:px-12 sticky top-0 z-[60] print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={goHome}>
            <div className="bg-[#E2725B] p-2 rounded-xl shadow-lg shadow-[#FBE9E4]">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <span className="text-xl font-black text-[#2D2A26] uppercase italic serif tracking-tight">ChefSync</span>
          </div>
          <button 
            onClick={handleGenerateGrocery} 
            disabled={loading || (!currentUser || (!activeSchedule && (!currentUser.plans || currentUser.plans.length === 0)))}
            className="px-6 py-3 bg-[#E2725B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#FBE9E4] hover:bg-[#D1604A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Generate grocery roadmap"
          >
            {loading ? "Orchestrating..." : "Grocery Audit"}
          </button>
        </div>
      </nav>
      <main className="flex-1">
        {renderView()}
        
        {/* WE INJECT THE PRINTABLE ROADMAP HERE FOR GLOBAL VISIBILITY DURING PRINTING */}
        {(currentUser && view === 'USER_MAIN') && (
           <div className="hidden print:block">
              {/* Note: In a real app we might render a specific print-only component here if props match */}
           </div>
        )}

        {error && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 p-6 bg-[#FBE9E4] text-[#E2725B] border border-[#F5D5CE] rounded-[2rem] shadow-2xl z-[100] max-w-sm text-center animate-in slide-in-from-bottom-4 print:hidden">
             <span className="font-black text-[10px] uppercase tracking-widest">{error}</span>
          </div>
        )}
        {groceryList && <GroceryDisplay list={groceryList} onClose={() => setGroceryList(null)} />}
      </main>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-hidden { display: none !important; }
          body { background: white !important; }
          #root { display: block !important; }
          nav { display: none !important; }
          
          /* Force only the printable roadmap to show */
          body * { visibility: hidden; }
          #printable-roadmap, #printable-roadmap * { visibility: visible; }
          #printable-roadmap {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
