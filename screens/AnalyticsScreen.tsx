import React from 'react';
import { Task, TaskStatus } from '../types';
import { 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

export const AnalyticsScreen = ({ tasks }: { tasks: Task[] }) => {
  const data = [
    { name: 'Completed', value: 12 },
    { name: 'Pending', value: tasks.length },
    { name: 'Overdue', value: tasks.filter(t => t.status === TaskStatus.OVERDUE).length },
  ];

  const colors = ['#10b981', '#6366f1', '#ef4444'];

  return (
    <div className="p-6 pb-24 md:p-8 md:ml-64 space-y-8">
      <h2 className="text-3xl font-bold text-white">Productivity Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zen-800 p-6 rounded-2xl border border-zen-700">
          <h3 className="text-lg font-semibold text-white mb-6">Task Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
             {data.map((d, i) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{backgroundColor: colors[i]}} />
                 <span className="text-slate-400 text-sm">{d.name}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-zen-800 p-6 rounded-2xl border border-zen-700 flex flex-col justify-center items-center text-center">
          <div className="w-32 h-32 rounded-full border-4 border-emerald-500 flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-white">85%</span>
          </div>
          <h3 className="text-xl font-bold text-white">Efficiency Score</h3>
          <p className="text-slate-400 max-w-xs mt-2">
            You are crushing your high-priority tasks this week! Keep maintaining this balance.
          </p>
        </div>
      </div>
    </div>
  );
};