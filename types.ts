export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE'
}

export interface WSJFMetrics {
  gradeImpact: number; // 1-10
  urgency: number; // 1-10
  risk: number; // 1-10
  timeRequired: number; // Hours
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  metrics: WSJFMetrics;
  calculatedPriority: number;
  status: TaskStatus;
  deadline: Date;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  subject?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isFixed: boolean; // True for Classes/Labs, False for flexible Tasks
  type: 'CLASS' | 'LAB' | 'STUDY_BLOCK' | 'PERSONAL';
}

export interface User {
  id: string;
  name: string;
  university: string;
  isConnectedToCalendar: boolean;
}

export interface AnalyticsData {
  name: string;
  value: number;
}
