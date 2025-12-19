import React from 'react';
import { User } from '../types';
import { Icons } from '../components/Icons';

export const ProfileScreen = ({ user }: { user: User }) => (
  <div className="p-8 md:ml-64 space-y-6">
     <h2 className="text-3xl font-bold text-white">Profile & Settings</h2>
     <div className="bg-zen-800 rounded-2xl border border-zen-700 overflow-hidden">
       <div className="p-6 border-b border-zen-700 flex items-center gap-4">
          <div className="w-16 h-16 bg-zen-600 rounded-full flex items-center justify-center">
            <Icons.User size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{user.name}</h3>
            <p className="text-slate-400">{user.university}</p>
          </div>
       </div>
       <div className="p-6 space-y-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-300">Calendar Sync</span>
            <span className="text-emerald-400 font-medium">Active</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-300">Default Study Hours</span>
            <span className="text-white">8:00 AM - 10:00 PM</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-300">Theme</span>
            <span className="text-white">Zen Dark</span>
          </div>
       </div>
     </div>
  </div>
);