
import React, { useState } from 'react';
import { discoverRecipesByIngredients, generateRecipeImage } from '../services/geminiService';
import { RecipeOption, MealType, CityType } from '../types';
import { Button } from './Button';

interface DiscoverySectionProps {
  onPlanAdded: (recipe: RecipeOption, imageUrl: string, date: string, mealType: MealType) => void;
}

export const DiscoverySection: React.FC<DiscoverySectionProps> = ({ onPlanAdded }) => {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<RecipeOption[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<MealType>(MealType.DINNER);
  // Added cityType state to provide the required argument for discoverRecipesByIngredients
  const [cityType, setCityType] = useState<CityType>(CityType.TIER_2);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) return;
    setLoading(true);
    setOptions([]);
    try {
      // Fix: Provided the missing 'cityType' argument as required by the service
      const results = await discoverRecipesByIngredients(ingredients.split(',').map(i => i.trim()), cityType);
      setOptions(results);
      results.forEach(async (opt) => {
        const url = await generateRecipeImage(opt.imagePrompt);
        setImages(prev => ({ ...prev, [opt.recipeName]: url }));
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (opt: RecipeOption) => {
    onPlanAdded(opt, images[opt.recipeName], targetDate, mealType);
    setAddedIds(prev => [...prev, opt.recipeName]);
    setTimeout(() => {
      setAddedIds(prev => prev.filter(id => id !== opt.recipeName));
    }, 2000);
  };

  return (
    <div className="space-y-20 mb-20">
      <section className="max-w-4xl mx-auto text-center space-y-6">
        <h3 className="text-5xl font-black text-slate-900 tracking-tighter">Kitchen Inspiration</h3>
        <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto">Discover effortless recipes based on what's left in your fridge.</p>
        
        <form onSubmit={handleSearch} className="flex flex-col gap-4 max-w-2xl mx-auto pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Search e.g. Pasta, Spinach, Cream..."
              className="flex-1 px-6 py-5 rounded-[1.5rem] border-2 border-slate-100 focus:border-emerald-600 focus:outline-none transition-all shadow-xl shadow-slate-200/50 text-lg font-medium"
            />
            {/* Added City selector to provide the city context for the search */}
            <select 
              value={cityType} 
              onChange={(e) => setCityType(e.target.value as CityType)}
              className="px-6 py-5 rounded-[1.5rem] border-2 border-slate-100 focus:border-emerald-600 focus:outline-none bg-white font-bold text-slate-700 shadow-xl shadow-slate-200/50 appearance-none"
            >
              {Object.values(CityType).map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <Button isLoading={loading} type="submit" className="w-full sm:w-auto px-10 py-5 rounded-[1.5rem] text-lg font-black shadow-lg shadow-emerald-200 self-center">Inspire Me</Button>
        </form>
      </section>

      {options.length > 0 && (
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
          {options.map(opt => {
            const isAdded = addedIds.includes(opt.recipeName);
            return (
              <div key={opt.recipeName} className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-xl flex flex-col sm:flex-row group hover:shadow-2xl hover:border-emerald-100 transition-all duration-500">
                <div className="sm:w-[40%] aspect-square sm:aspect-auto bg-slate-50 relative overflow-hidden">
                  <img src={images[opt.recipeName] || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={opt.recipeName} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-10 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-2xl font-black text-slate-900 leading-tight">{opt.recipeName}</h4>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{opt.totalTime}</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed mb-6">{opt.description}</p>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 mb-6">
                       <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-1">Affordability</p>
                       <p className="text-[11px] text-amber-800 font-medium italic">{opt.budgetFeasibility}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6 pt-6 border-t border-slate-50">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Target Date</label>
                        <input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          value={targetDate} 
                          onChange={(e) => setTargetDate(e.target.value)}
                          className="w-full text-xs p-3 border-2 border-slate-100 rounded-xl outline-none font-bold text-slate-700 focus:border-emerald-300 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Meal Time</label>
                        <select 
                          value={mealType} 
                          onChange={(e) => setMealType(e.target.value as MealType)}
                          className="w-full text-xs p-3 border-2 border-slate-100 rounded-xl outline-none font-bold text-slate-700 focus:border-emerald-300 transition-all appearance-none"
                        >
                          {Object.values(MealType).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAdd(opt)}
                      disabled={isAdded}
                      className={`w-full py-4 rounded-[1.2rem] text-xs font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${isAdded ? 'bg-emerald-50 text-emerald-600 shadow-none border-2 border-emerald-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'}`}
                    >
                      {isAdded ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                          Added to Plan
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          Add to Calendar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
