import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { calculateWSJFPriority } from '../services/scheduler';
import { Icons } from '../components/Icons';

export const AddTaskScreen = ({ onAdd }: { onAdd: (t: Task) => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    time: 1,
    grade: 5,
    urgency: 5,
    risk: 5,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priority = calculateWSJFPriority(formData.grade, formData.urgency, formData.risk, formData.time);
    
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      subject: formData.subject,
      metrics: {
        gradeImpact: formData.grade,
        urgency: formData.urgency,
        risk: formData.risk,
        timeRequired: formData.time
      },
      calculatedPriority: priority,
      status: TaskStatus.PENDING,
      deadline: new Date()
    };
    
    onAdd(newTask);
    setSubmitted(true);
    // Reset after delay
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ title: '', subject: '', time: 1, grade: 5, urgency: 5, risk: 5 });
    }, 2000);
  };

  const Slider = ({ label, value, onChange, min = 1, max = 10, colorClass = "accent-zen-500" }: any) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm font-bold text-white bg-zen-700 px-2 rounded">{value}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 bg-zen-700 rounded-lg appearance-none cursor-pointer ${colorClass}`} 
      />
      <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 pb-24 md:ml-64 flex justify-center items-start min-h-screen pt-12">
      <div className="w-full max-w-2xl bg-zen-800 rounded-2xl border border-zen-700 p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-zen-500 rounded-lg">
             <Icons.Add size={24} className="text-white" />
          </div>
          New Academic Task
        </h2>
        
        {submitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-8 text-center animate-pulse">
            <Icons.Check className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">Task Added!</h3>
            <p className="text-emerald-400">Zennyth is recalculating your optimal schedule...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Task Title</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-zen-900 border border-zen-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-zen-500 outline-none transition-all"
                  placeholder="e.g. Microeconomics Final Paper"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Subject / Course</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-zen-900 border border-zen-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-zen-500 outline-none"
                  placeholder="e.g. ECON 101"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-zen-900/50 rounded-xl p-6 border border-zen-700 space-y-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Icons.Zap size={16} className="text-zen-warning" />
                Priority Calculator (WSJF)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Slider 
                    label="Grade Impact" 
                    value={formData.grade} 
                    onChange={(v: number) => setFormData({...formData, grade: v})} 
                    colorClass="accent-emerald-500"
                 />
                 <Slider 
                    label="Urgency (Deadline proximity)" 
                    value={formData.urgency} 
                    onChange={(v: number) => setFormData({...formData, urgency: v})}
                    colorClass="accent-zen-warning" 
                 />
                 <Slider 
                    label="Risk of Failure" 
                    value={formData.risk} 
                    onChange={(v: number) => setFormData({...formData, risk: v})} 
                    colorClass="accent-zen-danger"
                 />
                 <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-slate-300">Est. Time Required (Hours)</label>
                      <span className="text-sm font-bold text-white bg-zen-700 px-2 rounded">{formData.time}h</span>
                    </div>
                    <input 
                      type="range" 
                      min={0.5} 
                      max={10} 
                      step={0.5}
                      value={formData.time} 
                      onChange={(e) => setFormData({...formData, time: Number(e.target.value)})}
                      className="w-full h-2 bg-zen-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                    />
                 </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="bg-white text-zen-900 hover:bg-slate-200 px-8 py-3 rounded-lg font-bold transition-colors w-full md:w-auto">
                Add to Schedule
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};