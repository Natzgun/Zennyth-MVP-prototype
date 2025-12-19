import React from 'react';
import { Icons } from './Icons';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { path: 'dashboard', icon: Icons.Dashboard, label: 'Home' },
    { path: 'calendar', icon: Icons.Calendar, label: 'Calendar' },
    { path: 'add', icon: Icons.Add, label: 'Add Task' },
    { path: 'analytics', icon: Icons.Analytics, label: 'Analytics' },
    { path: 'profile', icon: Icons.Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-zen-800 border-r border-zen-700 h-screen fixed left-0 top-0 p-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-zen-500 to-emerald-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Zennyth</h1>
        </div>
        
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = currentView === item.path;
            const Icon = item.icon;
            return (
              <button 
                key={item.path} 
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                  isActive 
                    ? 'bg-zen-500 text-white shadow-lg shadow-zen-500/20' 
                    : 'text-slate-400 hover:bg-zen-700 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="mt-auto pt-6 border-t border-zen-700">
           <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                <Icons.User size={20} className="text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Alex Student</p>
                <p className="text-xs text-slate-400">Pro Plan</p>
              </div>
           </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zen-800/90 backdrop-blur-md border-t border-zen-700 p-2 z-50">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = currentView === item.path;
            const Icon = item.icon;
            return (
              <button 
                key={item.path} 
                onClick={() => onNavigate(item.path)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg w-full ${
                   isActive ? 'text-zen-400' : 'text-slate-500'
                }`}
              >
                <Icon size={24} />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};