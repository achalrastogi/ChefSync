
import React, { useState } from 'react';
import { Pantry } from '../types';

interface PantryModalProps {
  pantry: Pantry;
  onSave: (pantry: Pantry) => void;
  onClose: () => void;
}

export const PantryModal: React.FC<PantryModalProps> = ({ pantry, onSave, onClose }) => {
  const [localPantry, setLocalPantry] = useState<Pantry>(pantry);
  const [activeTab, setActiveTab] = useState<keyof Pantry>('veg');
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (!newItem.trim()) return;
    setLocalPantry({
      ...localPantry,
      [activeTab]: [...localPantry[activeTab], newItem.trim()]
    });
    setNewItem('');
  };

  const removeItem = (item: string) => {
    setLocalPantry({
      ...localPantry,
      [activeTab]: localPantry[activeTab].filter(i => i !== item)
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white rounded-[3rem] max-w-lg w-full overflow-hidden shadow-2xl flex flex-col border border-white">
        <div className="p-8 bg-emerald-600 text-white flex justify-between items-center">
          <h2 className="text-2xl font-black">Manage Pantry</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" /></svg>
          </button>
        </div>

        <div className="flex bg-slate-50 border-b border-slate-100">
          {(['veg', 'nonVeg', 'oils', 'masalas'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400'}`}
            >
              {tab.replace('nonVeg', 'Non-Veg')}
            </button>
          ))}
        </div>

        <div className="p-8 flex-1 overflow-y-auto max-h-[400px]">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={`Add ${activeTab}...`}
              className="flex-1 p-3 rounded-xl border-2 border-slate-100 focus:border-emerald-600 text-sm outline-none"
            />
            <button onClick={addItem} className="px-6 bg-slate-900 text-white rounded-xl font-bold text-sm">+</button>
          </div>

          <div className="flex flex-wrap gap-2">
            {localPantry[activeTab].map(item => (
              <span key={item} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-2 group">
                {item}
                <button onClick={() => removeItem(item)} className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold text-sm">Cancel</button>
          <button onClick={() => { onSave(localPantry); onClose(); }} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200">Save Pantry</button>
        </div>
      </div>
    </div>
  );
};
