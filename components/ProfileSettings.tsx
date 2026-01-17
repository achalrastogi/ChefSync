
import React, { useState } from 'react';
import { User, DietType, CityType, Persona } from '../types';
import { FormField } from './Shared';

interface ProfileSettingsProps {
  user: User;
  onSave: (user: User) => void;
  onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState<User>(user);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[150] flex items-center justify-center p-6">
      <div className="bg-white rounded-[3.5rem] max-w-xl w-full p-12 shadow-2xl border border-white animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-[#2D2A26] serif italic">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" /></svg>
          </button>
        </div>

        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name">
              <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm outline-none" />
            </FormField>
            <FormField label="Age">
              <input type="number" value={formData.age} onChange={e => setFormData(p => ({ ...p, age: parseInt(e.target.value) || 0 }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm outline-none" />
            </FormField>
          </div>

          <FormField label="Dietary Preference">
            <div className="flex gap-2">
              {Object.values(DietType).map(d => (
                <button 
                  key={d} 
                  type="button" 
                  onClick={() => setFormData(p => ({ ...p, diet: d }))} 
                  className={`flex-1 py-3 text-[10px] font-black rounded-xl border-2 transition-all ${formData.diet === d ? 'bg-[#E2725B] border-[#E2725B] text-white' : 'border-[#EBE8E0] text-slate-400'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Persona">
            <select value={formData.persona} onChange={e => setFormData(p => ({ ...p, persona: e.target.value as Persona }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm outline-none">
              {Object.values(Persona).map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Daily Budget (INR)">
              <input type="number" value={formData.dailyBudget} onChange={e => setFormData(p => ({ ...p, dailyBudget: parseInt(e.target.value) || 0 }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm" />
            </FormField>
            <FormField label="Time Per Meal (Min)">
              <input type="number" value={formData.cookingTimePerMeal} onChange={e => setFormData(p => ({ ...p, cookingTimePerMeal: parseInt(e.target.value) || 0 }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm" />
            </FormField>
          </div>

          <FormField label="Cooking Window">
            <div className="grid grid-cols-2 gap-3">
              <input type="time" value={formData.reminderPreferences.cookingSlotStart} onChange={e => setFormData(p => ({ ...p, reminderPreferences: { ...p.reminderPreferences, cookingSlotStart: e.target.value } }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm" />
              <input type="time" value={formData.reminderPreferences.cookingSlotEnd} onChange={e => setFormData(p => ({ ...p, reminderPreferences: { ...p.reminderPreferences, cookingSlotEnd: e.target.value } }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm" />
            </div>
          </FormField>
        </div>

        <div className="mt-10 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-[#A6A196] font-black uppercase text-[10px]">Cancel</button>
          <button onClick={handleSave} className="flex-[2] py-4 bg-[#2D2A26] text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">Save Changes</button>
        </div>
      </div>
    </div>
  );
};
