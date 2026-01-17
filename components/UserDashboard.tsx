
import React from 'react';
import { User } from '../types';
import { Card, Badge } from './Shared';

interface UserDashboardProps {
  users: User[];
  onSelectUser: (user: User) => void;
  onCreateUser: () => void;
  onRunTests?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ users = [], onSelectUser, onCreateUser, onRunTests }) => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h2 className="text-5xl font-black text-[#2D2A26] tracking-tighter serif italic">Architect Engine</h2>
          <p className="text-lg text-[#A6A196] font-medium mt-2">Manage multiple culinary maps and budget economies.</p>
        </div>
        <div className="flex gap-4">
          {onRunTests && (
            <button 
              onClick={onRunTests}
              className="px-6 py-4 bg-white text-[#2D2A26] border-2 border-[#EBE8E0] rounded-2xl font-black uppercase tracking-widest text-[10px] hover:border-[#E2725B] transition-all"
            >
              Run Diagnostics
            </button>
          )}
          <button 
            onClick={onCreateUser}
            className="px-8 py-4 bg-[#E2725B] text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl hover:bg-[#D1604A] transition-all"
          >
            + New Architect
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.length === 0 ? (
          <Card className="col-span-full py-20 bg-white border-2 border-dashed border-[#EBE8E0] flex flex-col items-center justify-center text-center px-10">
             <div className="w-16 h-16 bg-[#FAF9F6] rounded-full flex items-center justify-center text-3xl mb-6">🏗️</div>
             <h3 className="text-2xl font-black text-[#2D2A26] mb-2 serif italic">Empty Engine</h3>
             <p className="text-[#A6A196] max-w-xs mb-8">No culinary architects detected. Initialize a profile to begin your synthesis journey.</p>
             <button onClick={onCreateUser} className="text-[#E2725B] font-black uppercase tracking-widest text-xs underline underline-offset-8">Start Onboarding ➔</button>
          </Card>
        ) : (
          users.map(user => (
            <Card 
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="p-10 group flex flex-col gap-6"
              ariaLabel={`Select profile for ${user.name}`}
            >
              <div className="flex justify-between items-start">
                 <Badge variant="slate">{user.cityType || 'STANDARD'} Economy</Badge>
                 {user.preferences?.highQualityVisuals && <Badge variant="terracotta">HQ</Badge>}
              </div>
              <div>
                 <h3 className="text-3xl font-black text-[#2D2A26] group-hover:text-[#E2725B] transition-colors leading-tight serif italic">{user.name || 'Unnamed Architect'}, {user.age || '??'}</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#A6A196] mt-2">Daily Goal: ₹{user.dailyBudget || 0}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#EBE8E0]">
                   <p className="text-[9px] font-black uppercase tracking-widest text-[#A6A196]">Plans</p>
                   <p className="text-lg font-black text-slate-800">{(user.plans || []).length}</p>
                </div>
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#EBE8E0]">
                   <p className="text-[9px] font-black uppercase tracking-widest text-[#A6A196]">Pantry Items</p>
                   <p className="text-lg font-black text-slate-800">{Object.values(user.pantry || {}).flat().length}</p>
                </div>
              </div>

              <button className="w-full py-4 bg-[#2D2A26] text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all group-hover:bg-black shadow-lg">
                Manage Blueprint
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
