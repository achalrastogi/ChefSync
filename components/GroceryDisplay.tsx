
import React from 'react';
import { GroceryList } from '../types';

interface GroceryDisplayProps {
  list: GroceryList;
  onClose: () => void;
}

export const GroceryDisplay: React.FC<GroceryDisplayProps> = ({ list, onClose }) => {
  const handlePrint = () => {
    // Ensuring the DOM is stable before triggering print
    window.print();
  };

  const items = list?.items || [];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 print:static print:bg-transparent print:p-0">
      <div className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 border border-white print:max-h-none print:shadow-none print:border-0 print:rounded-none">
        <div className="p-10 bg-[#2D2A26] text-white flex justify-between items-center shrink-0 print:bg-white print:text-black print:p-4 print:border-b-2">
          <div>
            <h2 className="text-3xl font-black tracking-tight serif italic print:text-xl">Grocery Audit</h2>
            <p className="font-medium opacity-80 text-sm no-print">Consolidated roadmap for your validated plan.</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition-all no-print">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide print:p-4 print:overflow-visible">
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#FAF9F6] p-6 rounded-[2rem] border border-[#EBE8E0] print:border-0 print:bg-transparent print:p-0">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FBE9E4] text-[#E2725B] rounded-full flex items-center justify-center font-black print:hidden">₹</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#A6A196] print:text-black">Consolidated INR Budget</p>
                    <p className="text-2xl font-black text-slate-800 print:text-lg">{list?.totalEstimatedBudget || '---'}</p>
                  </div>
              </div>
            </div>
            {list?.budgetFeasibilityNote && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-[10px] font-bold uppercase tracking-widest text-center print:text-xs print:bg-transparent print:border-0 print:text-black">
                 ✓ Budget Feasibility: {list.budgetFeasibilityNote}
              </div>
            )}
          </div>

          <div className="space-y-8">
            {items.length === 0 ? (
              <p className="text-center text-slate-400 italic py-10">No items detected in logistics audit.</p>
            ) : (
              Array.from(new Set(items.map(i => i.category))).map(category => (
                <div key={category} className="page-break-inside-avoid">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#A6A196] mb-4 ml-2 print:text-black print:mb-1">{category}</h3>
                  <div className="space-y-3">
                    {items.filter(i => i.category === category).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-[#EBE8E0] group hover:border-[#E2725B] transition-all print:border-0 print:p-1 print:border-b">
                        <div className="flex items-center gap-4">
                          <div className="w-5 h-5 rounded border-2 border-[#EBE8E0] group-hover:border-[#E2725B] print:hidden"></div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm print:text-xs">{item.item}</p>
                            <p className="text-[10px] font-medium text-[#A6A196] uppercase tracking-widest print:text-[8px]">{item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-[#E2725B] bg-[#FBE9E4] px-3 py-1.5 rounded-xl print:text-black print:bg-transparent">
                          {item.estimatedCost}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="p-8 border-t border-slate-50 bg-[#FAF9F6] flex justify-center no-print">
           <button onClick={handlePrint} className="px-10 py-4 bg-[#2D2A26] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl">
              Print Shopping Roadmap
           </button>
        </div>
      </div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          body * { visibility: hidden; }
          .print-full, .print-full * { visibility: visible; }
          /* Ensure modal content prints */
          .fixed { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: auto !important; background: white !important; visibility: visible !important; z-index: 1000 !important; }
          .fixed * { visibility: visible !important; }
        }
      `}</style>
    </div>
  );
};
