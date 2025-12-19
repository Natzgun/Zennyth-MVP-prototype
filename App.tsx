import React, { useState, useEffect } from 'react';
import { Task, CalendarEvent, User } from './types';
import { generateSchedule } from './services/scheduler';
import { getZenCoachAdvice } from './services/geminiService';

// Data
import { MOCK_USER, INITIAL_TASKS, MOCK_EVENTS } from './data/mock';

// Components
import { Navigation } from './components/Navigation';

// Screens
import { DashboardScreen } from './screens/DashboardScreen';
import { AddTaskScreen } from './screens/AddTaskScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { CalendarConnectionScreen } from './screens/CalendarConnectionScreen';

const AppContent = () => {
  // Application State
  const [user, setUser] = useState<User>(MOCK_USER);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [advice, setAdvice] = useState<string>("Ready to focus?");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  // Side Effects
  useEffect(() => {
    if (user.isConnectedToCalendar) {
       handleGetAdvice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.isConnectedToCalendar, tasks]);

  // Handlers
  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    const adviceText = await getZenCoachAdvice(tasks, user.name);
    setAdvice(adviceText);
    setLoadingAdvice(false);
  };

  const handleConnectCalendar = () => {
    setUser({ ...user, isConnectedToCalendar: true });
  };

  const handleAddTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const handleAutoSchedule = () => {
    const fixedEvents = events.filter(e => e.isFixed);
    const result = generateSchedule(tasks, fixedEvents);
    
    const updatedTasks = tasks.map(t => {
      const scheduled = result.scheduledTasks.find(st => st.id === t.id);
      return scheduled ? scheduled : t;
    });

    setTasks(updatedTasks);
    setEvents([...fixedEvents, ...result.studyBlocks]);
  };

  // View Routing
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardScreen 
            tasks={tasks} 
            events={events} 
            generate={handleAutoSchedule} 
            advice={advice}
            loadingAdvice={loadingAdvice}
          />
        );
      case 'add':
        return <AddTaskScreen onAdd={handleAddTask} />;
      case 'analytics':
        return <AnalyticsScreen tasks={tasks} />;
      case 'calendar':
        return <CalendarScreen />;
      case 'profile':
        return <ProfileScreen user={user} />;
      default:
        return (
          <DashboardScreen 
            tasks={tasks} 
            events={events} 
            generate={handleAutoSchedule} 
            advice={advice}
            loadingAdvice={loadingAdvice}
          />
        );
    }
  };

  // Authentication Guard
  if (!user.isConnectedToCalendar) {
    return <CalendarConnectionScreen onConnect={handleConnectCalendar} />;
  }

  // Main Layout
  return (
    <div className="bg-zen-900 min-h-screen text-slate-200 font-sans selection:bg-zen-500 selection:text-white">
      <Navigation currentView={currentView} onNavigate={setCurrentView} />
      {renderView()}
    </div>
  );
};

export default function App() {
  return <AppContent />;
}