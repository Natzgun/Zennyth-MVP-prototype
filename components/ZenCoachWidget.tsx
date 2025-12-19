import React from 'react';
import { Icons } from './Icons';

interface ZenCoachWidgetProps {
  advice: string;
  loading: boolean;
}

export const ZenCoachWidget: React.FC<ZenCoachWidgetProps> = ({ advice, loading }) => {
  return (
    <div className="bg-gradient-to-r from-zen-800 to-zen-800/50 border border-zen-700 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icons.Brain size={120} className="text-white" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2 text-zen-400">
          <Icons.Brain size={20} />
          <span className="font-bold uppercase tracking-widest text-xs">Zen Coach AI</span>
        </div>
        {loading ? (
           <div className="h-12 flex items-center gap-3">
             <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
             <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
             <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
           </div>
        ) : (
           <p className="text-slate-200 text-lg leading-relaxed max-w-2xl italic">"{advice}"</p>
        )}
      </div>
    </div>
  );
};