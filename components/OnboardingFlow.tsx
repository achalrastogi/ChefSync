
import React, { useState } from 'react';
import { User, Persona, DietType, KitchenSetup } from '../types';
import { FormField } from './Shared';

interface OnboardingFlowProps {
  user: User;
  onSave: (user: User) => void;
}

const personaDefaults = {
  [Persona.WORKING_PROFESSIONAL]: { time: 30, setup: KitchenSetup.MEDIUM, budget: 400, slot: "18:30", slotEnd: "20:00" },
  [Persona.STUDENT]: { time: 20, setup: KitchenSetup.BASIC, budget: 200, slot: "19:00", slotEnd: "20:30" },
  [Persona.HOUSEHOLD]: { time: 60, setup: KitchenSetup.FULL, budget: 600, slot: "17:00", slotEnd: "19:00" },
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onSave }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(user);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePersonaSelect = (persona: Persona) => {
    const defaults = personaDefaults[persona];
    setFormData(prev => ({
      ...prev,
      persona,
      dailyBudget: defaults.budget,
      kitchenSetup: defaults.setup,
      cookingTimePerMeal: defaults.time,
      reminderPreferences: {
        ...prev.reminderPreferences,
        cookingSlotStart: defaults.slot,
        cookingSlotEnd: defaults.slotEnd
      }
    }));
    setStep(2);
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Identification required.";
    if (formData.age < 12 || formData.age > 110) newErrors.age = "Input valid age.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };
  
  const handleSave = () => {
    onSave({ ...formData, onboardingComplete: true });
  };

  return (
    <div className="fixed inset-0 bg-[#FAF9F6] z-[200] flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-[#EBE8E0] relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1">
            {[1,2,3].map(i => <div key={i} className={`w-8 h-1.5 rounded-full transition-all ${step >= i ? 'bg-[#E2725B]' : 'bg-[#EBE8E0]'}`}></div>)}
        </div>

        {step === 1 && <PersonaStep onSelect={handlePersonaSelect} />}
        {step === 2 && <ProfileStep formData={formData} setFormData={setFormData} errors={errors} />}
        {step === 3 && <WorkflowStep formData={formData} setFormData={setFormData} />}

        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-4 text-[#A6A196] font-black uppercase tracking-widest text-[10px]">Back</button>
          )}
          {step < 3 ? (
            <button onClick={handleNext} className="flex-[2] py-4 bg-[#2D2A26] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Next Step</button>
          ) : (
            <button onClick={handleSave} className="flex-[2] py-4 bg-[#E2725B] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Initialize Architect</button>
          )}
        </div>
      </div>
    </div>
  );
};

const PersonaStep = ({ onSelect }: { onSelect: (p: Persona) => void }) => (
  <div className="text-center animate-in fade-in slide-in-from-bottom-4">
    <h2 className="text-4xl font-black text-[#2D2A26] serif italic mb-4 tracking-tighter">Onboarding Phase</h2>
    <p className="text-[#A6A196] mb-10 font-medium">Select a persona to calibrate the synthesis engine.</p>
    <div className="grid gap-4">
      {(Object.keys(personaDefaults) as Persona[]).map(p => (
        <button key={p} onClick={() => onSelect(p)} className="p-6 rounded-3xl border-2 border-[#EBE8E0] hover:border-[#E2725B] transition-all text-left flex items-center gap-6 group">
          <span className="text-3xl">{p === Persona.WORKING_PROFESSIONAL ? '👨‍💻' : p === Persona.STUDENT ? '🎓' : '🏡'}</span>
          <div>
            <p className="text-sm font-black text-slate-800 uppercase tracking-widest group-hover:text-[#E2725B]">{p.replace(/_/g, ' ')}</p>
            <p className="text-[10px] text-slate-400 font-medium">Auto-calibrates budget and time slots.</p>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const ProfileStep = ({ formData, setFormData, errors }: { formData: User, setFormData: React.Dispatch<React.SetStateAction<User>>, errors: Record<string, string> }) => (
  <div className="animate-in fade-in slide-in-from-right-4">
    <h2 className="text-3xl font-black text-[#2D2A26] serif italic mb-8">Identity & Preferences</h2>
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Full Name" error={errors.name}>
          <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm outline-none focus:border-[#E2725B]" />
        </FormField>
        <FormField label="Age" error={errors.age}>
          <input type="number" value={formData.age} onChange={e => setFormData(p => ({ ...p, age: parseInt(e.target.value) || 0 }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm outline-none focus:border-[#E2725B]" />
        </FormField>
      </div>
      <FormField label="Dietary Logic">
        <div className="flex gap-2">
          {Object.values(DietType).map(d => (
            <button key={d} type="button" onClick={() => setFormData(p => ({ ...p, diet: d }))} className={`flex-1 py-3 text-[10px] font-black rounded-xl border-2 transition-all ${formData.diet === d ? 'bg-[#E2725B] border-[#E2725B] text-white shadow-md' : 'border-[#EBE8E0] text-slate-400'}`}>{d}</button>
          ))}
        </div>
      </FormField>
      <FormField label="Allergies / Strict Exclusions">
         <input type="text" value={formData.allergies} onChange={e => setFormData(p => ({ ...p, allergies: e.target.value }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm outline-none focus:border-[#E2725B]" placeholder="e.g. Peanuts, Shellfish..." />
      </FormField>
    </div>
  </div>
);

const WorkflowStep = ({ formData, setFormData }: { formData: User, setFormData: React.Dispatch<React.SetStateAction<User>> }) => (
  <div className="animate-in fade-in slide-in-from-right-4">
    <h2 className="text-3xl font-black text-[#2D2A26] serif italic mb-8">Workflow Routine</h2>
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Time Per Meal (Min)">
          <input type="number" value={formData.cookingTimePerMeal} onChange={e => setFormData(p => ({ ...p, cookingTimePerMeal: parseInt(e.target.value) || 0 }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm" />
        </FormField>
        <FormField label="Daily Budget (INR)">
          <input type="number" value={formData.dailyBudget} onChange={e => setFormData(p => ({ ...p, dailyBudget: parseInt(e.target.value) || 0 }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm" />
        </FormField>
      </div>
      <FormField label="Typical Cooking Window (Start - End)">
         <div className="grid grid-cols-2 gap-3">
           <input type="time" value={formData.reminderPreferences.cookingSlotStart} onChange={e => setFormData(p => ({ ...p, reminderPreferences: { ...p.reminderPreferences, cookingSlotStart: e.target.value } }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm" />
           <input type="time" value={formData.reminderPreferences.cookingSlotEnd} onChange={e => setFormData(p => ({ ...p, reminderPreferences: { ...p.reminderPreferences, cookingSlotEnd: e.target.value } }))} className="w-full p-4 rounded-2xl border-2 border-[#EBE8E0] font-bold text-sm" />
         </div>
      </FormField>
    </div>
  </div>
);
