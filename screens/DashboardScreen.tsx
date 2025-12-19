import React from 'react';
import { Task, CalendarEvent } from '../types';
import { Icons } from '../components/Icons';
import { TaskCard } from '../components/TaskCard';
import { ZenCoachWidget } from '../components/ZenCoachWidget';

interface DashboardProps {
  tasks: Task[];
  events: CalendarEvent[];
  generate: () => void;
  advice: string;
  loadingAdvice: boolean;
}

export const DashboardScreen: React.FC<DashboardProps> = ({ 
  tasks, 
  events, 
  generate, 
  advice, 
  loadingAdvice 
}) => {
  const sortedTasks = [...tasks].sort((a, b) => b.calculatedPriority - a.calculatedPriority);

  return (
    <div className="p-6 pb-24 md:p-8 md:ml-64 space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Good Morning, Alex</h2>
          <p className="text-slate-400">Ready to conquer your academic goals?</p>
        </div>
        <button 
          onClick={generate}
          className="bg-zen-500 hover:bg-zen-400 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-zen-500/25 flex items-center gap-2"
        >
          <Icons.Zap size={18} />
          Auto-Schedule Day
        </button>
      </header>

      {/* Zen Coach Section */}
      <ZenCoachWidget advice={advice} loading={loadingAdvice} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Tasks Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Icons.Dashboard className="text-zen-500" />
              Priority Queue
            </h3>
            <span className="text-xs text-slate-500 bg-zen-800 px-2 py-1 rounded">Sorted by WSJF</span>
          </div>
          
          <div className="grid gap-4">
            {sortedTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {sortedTasks.length === 0 && (
              <div className="text-center py-12 bg-zen-800/30 rounded-xl border border-dashed border-zen-700">
                <p className="text-slate-500">No pending tasks. Enjoy your free time!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Today's Timeline */}
        <div className="space-y-6">
           <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Icons.Clock className="text-zen-500" />
              Today's Timeline
            </h3>
            <div className="bg-zen-800 rounded-2xl p-4 border border-zen-700 min-h-[400px]">
              <div className="space-y-4">
                {/* Timeline Visualizer */}
                {events
                  .sort((a,b) => a.start.getTime() - b.start.getTime())
                  .map((evt, idx) => {
                    const isStudy = evt.type === 'STUDY_BLOCK';
                    return (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-slate-500 font-mono">
                            {evt.start.getHours()}:{(evt.start.getMinutes() < 10 ? '0' : '') + evt.start.getMinutes()}
                          </span>
                          <div className="w-0.5 h-full bg-zen-700 my-1 rounded-full"></div>
                        </div>
                        <div className={`flex-1 p-3 rounded-lg text-sm border-l-4 mb-2 ${
                          isStudy 
                            ? 'bg-zen-500/10 border-zen-500 text-zen-100' 
                            : 'bg-slate-700/30 border-slate-500 text-slate-300'
                        }`}>
                          <p className="font-semibold">{evt.title}</p>
                          <p className="text-xs opacity-70">
                             {evt.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                             {evt.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
        </div>

      </div>
    </div>
  );
};