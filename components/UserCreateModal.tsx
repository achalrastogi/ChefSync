
import React, { useState, useEffect, useRef } from 'react';
import { DietType, KitchenSetup, CityType, Pantry, User } from '../types';
import { FormField } from './Shared';

interface UserCreateModalProps {
  onSave: (user: User) => void;
  onClose: () => void;
}

const INITIAL_PANTRY: Pantry = {
  veg: ["Onion", "Garlic", "Potato", "Tomato"],
  nonVeg: ["Egg"],
  oils: ["Oil", "Butter"],
  masalas: ["Salt", "Turmeric", "Chilli"]
};

export const UserCreateModal: React.FC<UserCreateModalProps> = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: 25,
    cityType: CityType.TIER_2,
    budget: 200,
    diet: DietType.VEG,
    setup: KitchenSetup.MEDIUM
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // Accessibility: Focus trap & Scroll lock
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    // Initial focus
    const firstInput = modalRef.current?.querySelector('input');
    firstInput?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusables = modalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || [];
        const first = focusables[0] as HTMLElement;
        const last = focusables[focusables.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name required";
    if (formData.age < 1 || formData.age > 120) newErrors.age = "Invalid age";
    if (formData.budget < 50) newErrors.budget = "Min budget ₹50";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    onSave({
      id: crypto.randomUUID(),
      name: formData.name,
      age: formData.age,
      cityType: formData.cityType,
      dailyBudget: formData.budget,
      diet: formData.diet,
      kitchenSetup: formData.setup,
      pantry: INITIAL_PANTRY,
      plans: [],
      preferences: {
        highQualityVisuals: false
      }
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-[#2D2A26]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-[2.5rem] max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl border border-[#EBE8E0] animate-in zoom-in-95 duration-300"
      >
        <div className="p-8 border-b border-[#EBE8E0] flex justify-between items-center bg-[#FAF9F6] rounded-t-[2.5rem]">
          <h2 id="modal-title" className="text-2xl font-black text-[#2D2A26] serif italic">Initialize Profile</h2>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center bg-white border border-[#EBE8E0] rounded-full hover:text-[#E2725B] outline-none focus:ring-2 focus:ring-[#E2725B]"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Full Name" error={errors.name}>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-3.5 rounded-xl border-2 border-[#EBE8E0] focus:border-[#E2725B] outline-none font-bold text-sm"
              />
            </FormField>
            <FormField label="Age" error={errors.age}>
              <input 
                type="number" 
                value={formData.age} 
                onChange={e => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                className="w-full p-3.5 rounded-xl border-2 border-[#EBE8E0] focus:border-[#E2725B] outline-none font-bold text-sm"
              />
            </FormField>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="City Economy">
              <select 
                value={formData.cityType} 
                onChange={e => setFormData({...formData, cityType: e.target.value as CityType})} 
                className="w-full p-3.5 rounded-xl border-2 border-[#EBE8E0] font-bold text-sm outline-none bg-[#FAF9F6]"
              >
                {Object.values(CityType).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Budget (Daily)" error={errors.budget}>
              <input 
                type="number" 
                value={formData.budget} 
                onChange={e => setFormData({...formData, budget: parseInt(e.target.value) || 0})} 
                className="w-full p-3.5 rounded-xl border-2 border-[#EBE8E0] font-bold text-sm outline-none" 
              />
            </FormField>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#A6A196]">Dietary Profile</label>
             <div className="flex gap-2">
                {Object.values(DietType).map(d => (
                  <button 
                    key={d} 
                    type="button" 
                    onClick={() => setFormData({...formData, diet: d})}
                    className={`flex-1 py-3 text-[10px] font-black rounded-xl border-2 transition-all ${formData.diet === d ? 'bg-[#E2725B] border-[#E2725B] text-white' : 'bg-white border-[#EBE8E0] text-[#A6A196]'}`}
                  >
                    {d}
                  </button>
                ))}
             </div>
          </div>
        </form>

        <div className="p-8 border-t border-[#EBE8E0] bg-[#FAF9F6] rounded-b-[2.5rem] flex gap-3">
           <button onClick={onClose} className="flex-1 py-4 text-[#A6A196] font-black uppercase tracking-widest text-[10px]">Discard</button>
           <button 
            type="submit"
            onClick={handleSubmit}
            className="flex-[2] py-4 bg-[#2D2A26] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-black transition-all"
           >
             Activate Profile
           </button>
        </div>
      </div>
    </div>
  );
};
