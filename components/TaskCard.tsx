import React from 'react';
import { Task, TaskStatus } from '../types';
import { Icons } from './Icons';

export const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  let priorityColor = 'bg-emerald-500';
  if (task.calculatedPriority > 10) priorityColor = 'bg-zen-warning';
  if (task.calculatedPriority > 15 || task.status === TaskStatus.OVERDUE) priorityColor = 'bg-zen-danger';

  return (
    <div className="bg-zen-800 p-4 rounded-xl border border-zen-700 hover:border-zen-500 transition-all group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${priorityColor}`} />
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
            {task.subject}
          </span>
          <h3 className="text-white font-semibold text-lg leading-tight">{task.title}</h3>
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-bold text-zen-900 ${priorityColor}`}>
          {task.calculatedPriority.toFixed(1)}
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-3 text-slate-400 text-sm">
        <div className="flex items-center gap-1">
          <Icons.Clock size={14} />
          <span>{task.metrics.timeRequired}h</span>
        </div>
        <div className="flex items-center gap-1">
           <Icons.Alert size={14} className={task.metrics.urgency > 7 ? "text-zen-warning" : ""} />
           <span>Urg: {task.metrics.urgency}</span>
        </div>
        {task.status === TaskStatus.OVERDUE && (
          <span className="text-zen-danger font-bold text-xs flex items-center gap-1">
            OVERDUE
          </span>
        )}
      </div>
    </div>
  );
};