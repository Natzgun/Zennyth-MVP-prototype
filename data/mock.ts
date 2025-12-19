import { Task, CalendarEvent, User, TaskStatus } from '../types';

// Helper to create date for today at specific hour
export const todayAt = (hour: number) => {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d;
};

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex',
  university: 'Tech University',
  isConnectedToCalendar: false,
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Advanced Calculus Midterm Study',
    metrics: { gradeImpact: 9, urgency: 8, risk: 9, timeRequired: 3 },
    calculatedPriority: 8.6,
    status: TaskStatus.PENDING,
    deadline: new Date(new Date().setDate(new Date().getDate() + 2)),
    subject: 'Math'
  },
  {
    id: 't2',
    title: 'History Essay Draft',
    metrics: { gradeImpact: 6, urgency: 4, risk: 3, timeRequired: 2 },
    calculatedPriority: 7.5,
    status: TaskStatus.PENDING,
    deadline: new Date(new Date().setDate(new Date().getDate() + 5)),
    subject: 'History'
  },
  {
    id: 't3',
    title: 'Physics Lab Report',
    metrics: { gradeImpact: 7, urgency: 9, risk: 8, timeRequired: 1.5 },
    calculatedPriority: 19.0,
    status: TaskStatus.OVERDUE,
    deadline: new Date(new Date().setDate(new Date().getDate() - 1)),
    subject: 'Physics'
  }
];

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Calculus Lecture', start: todayAt(9), end: todayAt(10), isFixed: true, type: 'CLASS' },
  { id: 'e2', title: 'Lunch', start: todayAt(12), end: todayAt(13), isFixed: true, type: 'PERSONAL' },
  { id: 'e3', title: 'Physics Lab', start: todayAt(14), end: todayAt(16), isFixed: true, type: 'LAB' },
];