
import React from 'react';
import { GroceryList } from '../types';

interface GroceryDisplayProps {
  list: GroceryList;
  onClose: () => void;
}

export const GroceryDisplay: React.FC<GroceryDisplayProps> = ({ list, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <div className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 border border-white">
        <div className="p-10 bg-[#2D2A26] text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-3xl font-black tracking-tight serif italic">Grocery Audit</h2>
            <p className="font-medium opacity-80 text-sm">Consolidated roadmap for your validated plan.</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition-all">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#FAF9F6] p-6 rounded-[2rem] border border-[#EBE8E0]">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FBE9E4] text-[#E2725B] rounded-full flex items-center justify-center font-black">₹</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#A6A196]">Consolidated INR Budget</p>
                    <p className="text-2xl font-black text-slate-800">{list.totalEstimatedBudget}</p>
                  </div>
              </div>
            </div>
            {list.budgetFeasibilityNote && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-[10px] font-bold uppercase tracking-widest text-center">
                 ✓ Budget Feasibility: {list.budgetFeasibilityNote}
              </div>
            )}
          </div>

          <div className="space-y-8">
            {Array.from(new Set(list.items.map(i => i.category))).map(category => (
              <div key={category}>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#A6A196] mb-4 ml-2">{category}</h3>
                <div className="space-y-3">
                  {list.items.filter(i => i.category === category).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-[#EBE8E0] group hover:border-[#E2725B] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-5 h-5 rounded border-2 border-[#EBE8E0] group-hover:border-[#E2725B]"></div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{item.item}</p>
                          <p className="text-[10px] font-medium text-[#A6A196] uppercase tracking-widest">{item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-[#E2725B] bg-[#FBE9E4] px-3 py-1.5 rounded-xl">
                        {item.estimatedCost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-8 border-t border-slate-50 bg-[#FAF9F6] flex justify-center">
           <button onClick={() => window.print()} className="px-10 py-4 bg-[#2D2A26] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-[#FBE9E4]">
              Print Shopping Roadmap
           </button>
        </div>
      </div>
    </div>
  );
};
