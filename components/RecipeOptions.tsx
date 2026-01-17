
import React, { useState, useEffect } from 'react';
import { RecipeOption } from '../types';
import { generateRecipeImage } from '../services/geminiService';
import { Badge, Card } from './Shared';

interface RecipeOptionsProps {
  options: RecipeOption[];
  onSelect: (recipe: RecipeOption, imageUrl: string) => void;
  onCancel: () => void;
  isHQ?: boolean;
}

export const RecipeOptions: React.FC<RecipeOptionsProps> = ({ options, onSelect, onCancel, isHQ = false }) => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    options.forEach(async (opt) => {
      setLoadingImages(prev => ({ ...prev, [opt.recipeName]: true }));
      const url = await generateRecipeImage(opt.imagePrompt, isHQ);
      setImages(prev => ({ ...prev, [opt.recipeName]: url }));
      setLoadingImages(prev => ({ ...prev, [opt.recipeName]: false }));
    });
  }, [options, isHQ]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-[#2D2A26] tracking-tight serif italic">Synthesized Selections</h2>
          <p className="text-[#A6A196] font-medium">Validating ingredient locks and budget thresholds for your economy tier.</p>
        </div>
        <button onClick={onCancel} className="px-6 py-3 border border-[#EBE8E0] text-[#A6A196] font-black text-[10px] uppercase tracking-widest rounded-2xl hover:text-[#E2725B] transition-all">Back to Planner</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {options.map((opt) => (
          <Card 
            key={opt.recipeName}
            className={`flex flex-col group h-full ${opt.isFallback ? 'border-amber-200 bg-amber-50/20' : ''}`}
            ariaLabel={`Recipe option: ${opt.recipeName}`}
          >
            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden rounded-t-[2rem]">
              {loadingImages[opt.recipeName] ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#FAF9F6]">
                  <div className="w-8 h-8 border-4 border-[#FBE9E4] border-t-[#E2725B] rounded-full animate-spin" role="status">
                    <span className="sr-only">Generating image...</span>
                  </div>
                </div>
              ) : (
                <img 
                  src={images[opt.recipeName]} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}
              <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                <Badge variant={opt.isFallback ? 'red' : 'terracotta'}>
                  {opt.isFallback ? 'Ultra-Budget Fallback' : `₹${opt.estimatedCostValue}`}
                </Badge>
                {isHQ && <Badge variant="mustard">HQ</Badge>}
              </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-black text-[#2D2A26] serif italic">{opt.recipeName}</h3>
                <span className="text-[10px] font-black text-[#5B7A4B] bg-[#F2F5F0] px-3 py-1.5 rounded-xl border border-[#E5EBE0]">
                  {opt.totalTime}
                </span>
              </div>
              <p className="text-sm text-[#A6A196] font-medium leading-relaxed mb-6 italic">
                "{opt.description}"
              </p>

              <div className="mb-8 space-y-4">
                <div className="p-4 bg-[#FAF9F6] border border-[#EBE8E0] rounded-2xl">
                  <p className="text-[9px] font-black text-[#E2725B] uppercase tracking-[0.2em] mb-2">Locked Ingredients Used (3+ Required)</p>
                  <div className="flex flex-wrap gap-2">
                    {opt.ingredientsUsed.map(ing => (
                      <span key={ing} className="px-2 py-1 bg-white text-[10px] font-bold text-[#A6A196] border border-[#EBE8E0] rounded-lg">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-[#A6A196] uppercase tracking-widest px-2">
                  <span className="text-[#5B7A4B]">✓ Budget Validated</span>
                  <span className="w-1 h-1 rounded-full bg-[#EBE8E0]"></span>
                  <span>{opt.budgetFeasibility}</span>
                </div>
              </div>
              
              <button 
                onClick={() => onSelect(opt, images[opt.recipeName])}
                disabled={loadingImages[opt.recipeName]}
                className="w-full mt-auto py-5 bg-[#2D2A26] text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:opacity-50"
              >
                Accept Plan
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
