
import React, { useState, useMemo } from 'react';
import { DailySchedule, User, ReminderPreferences, CalendarEvent } from '../types';
import { generateGoogleCalendarLink, createEventsFromSchedule, downloadICS } from '../services/calendarService';
import { FormField, Badge } from './Shared';

interface SchedulingToolsProps {
  schedule: DailySchedule;
  user: User;
  onUpdatePrefs: (user: User) => void;
  onBack: () => void;
  onFinalizeCommit: () => void;
}

export const SchedulingTools: React.FC<SchedulingToolsProps> = ({ schedule, user, onUpdatePrefs, onBack, onFinalizeCommit }) => {
  const [prefs, setPrefs] = useState<ReminderPreferences>(user.reminderPreferences);
  const [showSyncGuide, setShowSyncGuide] = useState(false);

  const generatedEvents = useMemo(() => {
    return createEventsFromSchedule(schedule, { ...user, reminderPreferences: prefs });
  }, [schedule, user, prefs]);

  const handleSave = () => {
    onUpdatePrefs({ ...user, reminderPreferences: prefs });
    alert("Smart routine calibrated!");
  };

  const syncAllToGoogle = () => {
    downloadICS(generatedEvents);
    setShowSyncGuide(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
        <button onClick={onBack} className="text-xs font-black uppercase tracking-[0.2em] text-[#A6A196] hover:text-[#2D2A26] transition-colors">← Back to Roadmap</button>
        <div className="text-center">
            <h2 className="text-5xl font-black serif italic text-[#2D2A26]">Schedule Orchestration</h2>
            <p className="text-[#A6A196] mt-2 font-medium">Calibrating {generatedEvents.length} routine nodes.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={syncAllToGoogle}
            className="px-8 py-4 bg-[#F2F5F0] text-[#5B7A4B] border border-[#E5EBE0] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
          >
            Download .ICS
          </button>
          <button 
            onClick={onFinalizeCommit}
            className="px-8 py-4 bg-[#E2725B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all"
          >
            Commit to Main Roadmap ➔
          </button>
        </div>
      </div>

      {showSyncGuide && (
        <div className="mb-12 bg-[#2D2A26] text-white p-10 rounded-[3rem] shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-start mb-6">
             <h3 className="text-2xl font-black serif italic">Google Calendar Sync Guide</h3>
             <button onClick={() => setShowSyncGuide(false)} className="text-[10px] font-black uppercase opacity-50 hover:opacity-100">Dismiss</button>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-sm">
             <div className="space-y-3">
                <span className="w-8 h-8 rounded-full bg-[#E2725B] flex items-center justify-center font-black">1</span>
                <p className="font-bold">Download Completed</p>
                <p className="text-slate-400">The .ICS file with all {generatedEvents.length} events is now on your device.</p>
             </div>
             <div className="space-y-3">
                <span className="w-8 h-8 rounded-full bg-[#E2725B] flex items-center justify-center font-black">2</span>
                <p className="font-bold">Open Google Import</p>
                <a 
                  href="https://calendar.google.com/calendar/r/settings/export" 
                  target="_blank" 
                  className="inline-block py-2 px-4 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest mt-2"
                >
                  Go to G-Cal Settings ➔
                </a>
             </div>
             <div className="space-y-3">
                <span className="w-8 h-8 rounded-full bg-[#E2725B] flex items-center justify-center font-black">3</span>
                <p className="font-bold">Select & Upload</p>
                <p className="text-slate-400">Upload the file you just downloaded to sync your entire cooking roadmap at once.</p>
             </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl sticky top-24">
            <h3 className="text-xl font-black text-[#2D2A26] mb-8 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#FBE9E4] text-[#E2725B] flex items-center justify-center text-xs italic">S</span>
                Time Slot Window
            </h3>
            <div className="space-y-8">
              <FormField label="Daily Reminder Window">
                  <div className="flex gap-2">
                      <button type="button" onClick={() => setPrefs(p => ({...p, reminderTime: 'morning'}))} className={`flex-1 py-3 text-[10px] font-black rounded-xl border-2 transition-all ${prefs.reminderTime === 'morning' ? 'bg-[#E2725B] border-[#E2725B] text-white' : 'bg-slate-50 border-[#EBE8E0] text-slate-400'}`}>Morning</button>
                      <button type="button" onClick={() => setPrefs(p => ({...p, reminderTime: 'evening'}))} className={`flex-1 py-3 text-[10px] font-black rounded-xl border-2 transition-all ${prefs.reminderTime === 'evening' ? 'bg-[#E2725B] border-[#E2725B] text-white' : 'bg-slate-50 border-[#EBE8E0] text-slate-400'}`}>Evening</button>
                  </div>
              </FormField>
              
              <FormField label="Preferred Cooking Slot">
                   <div className="grid grid-cols-2 gap-3 items-center">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 ml-1">Start</span>
                        <input type="time" value={prefs.cookingSlotStart} onChange={e => setPrefs(p => ({...p, cookingSlotStart: e.target.value}))} className="w-full p-4 rounded-xl border-2 border-[#EBE8E0] font-black text-sm bg-slate-50" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 ml-1">End</span>
                        <input type="time" value={prefs.cookingSlotEnd} onChange={e => setPrefs(p => ({...p, cookingSlotEnd: e.target.value}))} className="w-full p-4 rounded-xl border-2 border-[#EBE8E0] font-black text-sm bg-slate-50" />
                      </div>
                   </div>
              </FormField>

              <button onClick={handleSave} className="w-full py-5 bg-[#2D2A26] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black shadow-lg transition-all">
                  Calibrate Routine
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-[#2D2A26] serif italic">Compliance Output</h3>
                <Badge variant="sage">Nodes Verified</Badge>
              </div>
              <div className="space-y-6">
                  {generatedEvents.map((event, idx) => (
                      <div key={idx} className="bg-[#FAF9F6] p-8 rounded-[2rem] border border-[#EBE8E0] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#E2725B] transition-all group">
                          <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                  {event.type === 'shopping' ? '🛒' : event.type === 'prep' ? '🔪' : '🍳'}
                              </div>
                              <div className="space-y-1">
                                 <p className="font-black text-lg text-slate-900">{event.title}</p>
                                 <p className="text-xs font-bold text-[#E2725B]">
                                     {new Date(event.start).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} @ {new Date(event.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                 </p>
                                 <div className="pt-2 max-w-md">
                                     <p className="text-[10px] font-black text-[#A6A196] uppercase tracking-widest leading-relaxed">Synthesis Insight</p>
                                     <p className="text-[11px] text-slate-500 font-medium italic mt-1">"{event.justification}"</p>
                                 </div>
                              </div>
                          </div>
                          <a 
                            href={generateGoogleCalendarLink(event)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full md:w-auto px-6 py-3 bg-white border border-[#EBE8E0] text-[#2D2A26] rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#E2725B] hover:text-[#E2725B] transition-all text-center"
                          >
                            Single G-Cal Sync
                          </a>
                      </div>
                  ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
