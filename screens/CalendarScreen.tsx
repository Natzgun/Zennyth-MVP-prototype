import React from 'react';
import { Icons } from '../components/Icons';

export const CalendarScreen = () => (
  <div className="p-8 md:ml-64 space-y-6">
    <h2 className="text-3xl font-bold text-white">My Calendar</h2>
    <div className="bg-zen-800 p-8 rounded-2xl border border-zen-700 text-center">
      <Icons.Calendar className="w-16 h-16 text-zen-500 mx-auto mb-4 opacity-50" />
      <h3 className="text-xl font-bold text-white">Full Calendar View</h3>
      <p className="text-slate-400 mt-2">View your monthly academic schedule and deadlines here.</p>
      <div className="mt-6 inline-block px-4 py-2 bg-zen-700 rounded-lg text-sm text-zen-300">
        Sync Status: <span className="text-emerald-400 font-bold">Connected</span>
      </div>
    </div>
  </div>
);