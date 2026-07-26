"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Task,
  CalendarEvent,
  User,
  FocusSession,
  StreakData,
  TaskStatus,
  PremiumTier,
  UsageMetrics,
  FREE_TIER_LIMITS,
  SubjectLearningRecord,
  NotificationSettings,
  RescueEvent,
} from "@/types";
import { generateId, todayStr } from "./utils";
import { generateSchedule, calculateWSJFPriority } from "./scheduler";
import { createTaskWithEstimation } from "./estimator";
import { captureCompletion, calculateAccuracy } from "./learning-engine";

interface ZenStore {
  // Core
  tasks: Task[];
  events: CalendarEvent[];
  user: User;
  isOnboarded: boolean;
  tier: PremiumTier;

  // Gamification
  streak: StreakData;
  focusSessions: FocusSession[];
  totalFocusMinutes: number;

  // Coach
  advice: string;
  loadingAdvice: boolean;
  coachRequestsToday: number;
  lastCoachDate: string;

  // Metrics
  metrics: UsageMetrics;

  // Time Learning
  subjectLearning: Record<string, SubjectLearningRecord>;

  // Notifications
  notificationSettings: NotificationSettings;

  // Day Rescue
  rescueHistory: RescueEvent[];

  // Computed
  canAddTask: () => boolean;
  canUseCoach: () => boolean;
  canLinkFocusTask: () => boolean;

  // Actions
  
  setUser: (user: Partial<User>) => void;
  completeOnboarding: (name: string, university: string) => void;
  loadDemoTasks: () => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  addTask: (
    title: string,
    deadline: string,
    timeRequired: number,
    subject?: string,
    customMetrics?: { gradeImpact: number; urgency: number; risk: number }
  ) => void;
  completeTask: (id: string, actualMinutes?: number) => void;
  deleteTask: (id: string) => void;
  autoSchedule: () => void;

  addFocusSession: (session: Omit<FocusSession, "id">) => void;
  updateStreak: () => void;

  setAdvice: (advice: string) => void;
  setLoadingAdvice: (loading: boolean) => void;
  trackCoachRequest: () => void;
  
  // Time Learning actions
  updateSubjectLearning: (subject: string, estimatedHours: number, actualHours: number) => void;

  // Notification actions
  setNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  requestNotificationPermission: () => Promise<void>;

  // Rescue actions
  rescueDay: () => { tasksAffected: number; nextTask?: string; nextTime?: string };

  // Metrics tracking
  trackEvent: (event: keyof Pick<UsageMetrics, "pricingPageViews" | "upgradeClicks" | "coachRequests" | "scheduleRuns" | "shareClicks" | "feedbackGiven">) => void;
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "Clase de Cálculo",
    start: (() => { const d = new Date(); d.setHours(9, 0, 0, 0); return d.toISOString(); })(),
    end: (() => { const d = new Date(); d.setHours(10, 0, 0, 0); return d.toISOString(); })(),
    isFixed: true,
    type: "CLASS",
  },
  {
    id: "evt-2",
    title: "Almuerzo",
    start: (() => { const d = new Date(); d.setHours(12, 0, 0, 0); return d.toISOString(); })(),
    end: (() => { const d = new Date(); d.setHours(13, 0, 0, 0); return d.toISOString(); })(),
    isFixed: true,
    type: "PERSONAL",
  },
  {
    id: "evt-3",
    title: "Lab de Física",
    start: (() => { const d = new Date(); d.setHours(14, 0, 0, 0); return d.toISOString(); })(),
    end: (() => { const d = new Date(); d.setHours(16, 0, 0, 0); return d.toISOString(); })(),
    isFixed: true,
    type: "LAB",
  },
];

const EMPTY_METRICS: UsageMetrics = {
  onboardedAt: "",
  tasksCreated: 0,
  tasksCompleted: 0,
  coachRequests: 0,
  scheduleRuns: 0,
  focusSessionsCompleted: 0,
  pricingPageViews: 0,
  upgradeClicks: 0,
  shareClicks: 0,
  feedbackGiven: 0,
  daysActive: 0,
  lastActiveDate: "",
  weeklyActiveCount: 0,
};

function inProgressTaskEvents(tasks: Task[]): CalendarEvent[] {
  return tasks.flatMap((task) => {
    if (
      task.status !== TaskStatus.IN_PROGRESS ||
      !task.scheduledStart
    ) {
      return [];
    }

    return [{
      id: `in-progress-${task.id}`,
      title: task.title,
      start: task.scheduledStart,
      end: task.scheduledEnd ?? new Date(
        new Date(task.scheduledStart).getTime() + task.metrics.timeRequired * 60 * 60 * 1000
      ).toISOString(),
      isFixed: true,
      type: "STUDY_BLOCK" as const,
    }];
  });
}

function applySchedule(tasks: Task[], scheduledTasks: Task[]): Task[] {
  const scheduledById = new Map(scheduledTasks.map((task) => [task.id, task]));

  return tasks.map((task) => {
    if (task.status !== TaskStatus.PENDING && task.status !== TaskStatus.OVERDUE) {
      return task;
    }

    return scheduledById.get(task.id) ?? {
      ...task,
      scheduledStart: undefined,
      scheduledEnd: undefined,
    };
  });
}

// Sample history makes the dashboard useful from the first visit.
function createSampleTasks(): Task[] {
  const now = new Date();
  const dateAt = (daysFromToday: number, hour = 10) => {
    const date = new Date(now);
    date.setDate(date.getDate() + daysFromToday);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };
  const completedTask = (
    id: string,
    title: string,
    subject: string,
    daysAgo: number,
    timeRequired: number
  ): Task => ({
    id,
    title,
    subject,
    deadline: dateAt(daysAgo - 1),
    metrics: { gradeImpact: 7, urgency: 6, risk: 4, timeRequired },
    calculatedPriority: calculateWSJFPriority(7, 6, 4, timeRequired),
    status: TaskStatus.COMPLETED,
    createdAt: dateAt(daysAgo - 4),
    completedAt: dateAt(daysAgo, 18),
  });

  const completedActivity = [
    { title: "Resolver ejercicios de Cálculo", subject: "Cálculo", daysAgo: -79, count: 1 },
    { title: "Preparar fichas de Biología", subject: "Biología", daysAgo: -73, count: 2 },
    { title: "Repasar mecánica clásica", subject: "Física", daysAgo: -65, count: 3 },
    { title: "Corregir avance del ensayo", subject: "Historia", daysAgo: -56, count: 1 },
    { title: "Práctica de programación", subject: "Programación", daysAgo: -49, count: 2 },
    { title: "Completar reporte de laboratorio", subject: "Física", daysAgo: -43, count: 4 },
    { title: "Revisar lecturas de metodología", subject: "Metodología", daysAgo: -35, count: 1 },
    { title: "Resolver problemas de Cálculo", subject: "Cálculo", daysAgo: -27, count: 3 },
    { title: "Preparar guía de estudio", subject: "Biología", daysAgo: -19, count: 2 },
    { title: "Avanzar proyecto de programación", subject: "Programación", daysAgo: -11, count: 4 },
    { title: "Sintetizar apuntes de clase", subject: "Historia", daysAgo: -4, count: 1 },
    { title: "Revisar lecturas de la semana", subject: "Metodología", daysAgo: -1, count: 2 },
  ];
  const completedTasks = completedActivity.flatMap((activity, activityIndex) =>
    Array.from({ length: activity.count }, (_, taskIndex) =>
      completedTask(
        `demo-completed-${activityIndex}-${taskIndex}`,
        activity.count > 1 ? `${activity.title} (${taskIndex + 1}/${activity.count})` : activity.title,
        activity.subject,
        activity.daysAgo,
        1 + (taskIndex % 2) * 0.5
      )
    )
  );

  return [
    ...completedTasks,
    {
      id: "demo-pending-1",
      title: "Estudiar para parcial de Cálculo",
      subject: "Cálculo",
      deadline: dateAt(2),
      metrics: { gradeImpact: 9, urgency: 9, risk: 7, timeRequired: 3 },
      calculatedPriority: calculateWSJFPriority(9, 9, 7, 3),
      status: TaskStatus.PENDING,
      createdAt: dateAt(-1),
    },
    {
      id: "demo-pending-2",
      title: "Ensayo de Historia del Arte",
      subject: "Historia",
      deadline: dateAt(5),
      metrics: { gradeImpact: 7, urgency: 5, risk: 4, timeRequired: 2 },
      calculatedPriority: calculateWSJFPriority(7, 5, 4, 2),
      status: TaskStatus.PENDING,
      createdAt: dateAt(-1),
    },
    {
      id: "demo-pending-3",
      title: "Reporte de laboratorio de Física",
      subject: "Física",
      deadline: dateAt(7),
      metrics: { gradeImpact: 6, urgency: 3, risk: 3, timeRequired: 1.5 },
      calculatedPriority: calculateWSJFPriority(6, 3, 3, 1.5),
      status: TaskStatus.PENDING,
      createdAt: dateAt(-1),
    },
  ];
}

export const useZenStore = create<ZenStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      events: INITIAL_EVENTS,
      user: { name: "", university: "" },
      isOnboarded: false,
      tier: "free",

      streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: "" },
      focusSessions: [],
      totalFocusMinutes: 0,

      advice: "Listo para enfocarte? Agrega tu primera tarea.",
      loadingAdvice: false,
      coachRequestsToday: 0,
      lastCoachDate: "",

      metrics: EMPTY_METRICS,

      subjectLearning: {},

      notificationSettings: {
        enabled: false,
        time: "21:00",
        permission: "default",
      },

      rescueHistory: [],

      // ─── Feature gating ──────────────────────────────────────
      canAddTask: () => {
        const { tasks, tier } = get();
        if (tier === "pro") return true;
        const activeTasks = tasks.filter((t) => t.status !== TaskStatus.COMPLETED);
        return activeTasks.length < FREE_TIER_LIMITS.maxTasks;
      },

      canUseCoach: () => {
        const { tier, coachRequestsToday, lastCoachDate } = get();
        if (tier === "pro") return true;
        const today = todayStr();
        if (lastCoachDate !== today) return true; // new day resets
        return coachRequestsToday < FREE_TIER_LIMITS.maxCoachRequests;
      },

      canLinkFocusTask: () => {
        return get().tier === "pro";
      },

      // ─── Actions ─────────────────────────────────────────────
      setUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      completeOnboarding: (name, university) => {
        const sampleTasks = createSampleTasks();
        const completedSampleTasks = sampleTasks.filter((task) => task.status === TaskStatus.COMPLETED);
        set({
          user: { name, university },
          isOnboarded: true,
          tasks: sampleTasks,
          metrics: {
            ...EMPTY_METRICS,
            onboardedAt: new Date().toISOString(),
            tasksCreated: sampleTasks.length,
            tasksCompleted: completedSampleTasks.length,
            lastActiveDate: todayStr(),
            daysActive: 1,
          },
        });
      },

      loadDemoTasks: () =>
        set((state) => {
          const sampleTasks = createSampleTasks();
          const completedSampleTasks = sampleTasks.filter((task) => task.status === TaskStatus.COMPLETED);
          const existingDemoTasks = state.tasks.filter((task) => task.id.startsWith("demo-"));
          const existingDemoCompletions = existingDemoTasks.filter((task) => task.status === TaskStatus.COMPLETED);
          return {
            tasks: [...state.tasks.filter((task) => !task.id.startsWith("demo-")), ...sampleTasks],
            metrics: {
              ...state.metrics,
              tasksCreated: Math.max(0, state.metrics.tasksCreated - existingDemoTasks.length) + sampleTasks.length,
              tasksCompleted: Math.max(0, state.metrics.tasksCompleted - existingDemoCompletions.length) + completedSampleTasks.length,
            },
          };
        }),

      addTask: (title, deadline, timeRequired, subject, customMetrics) => {
        const state = get();
        if (!state.canAddTask()) return; // Enforce gate

        const { metrics: estimated, calculatedPriority } = createTaskWithEstimation(
          title, deadline, timeRequired, subject, state.tasks
        );

        const finalMetrics = customMetrics ? { ...estimated, ...customMetrics } : estimated;
        const finalPriority = customMetrics
          ? calculateWSJFPriority(customMetrics.gradeImpact, customMetrics.urgency, customMetrics.risk, timeRequired)
          : calculatedPriority;

        const task: Task = {
          id: generateId(),
          title,
          subject,
          deadline,
          metrics: finalMetrics,
          calculatedPriority: finalPriority,
          status: TaskStatus.PENDING,
          createdAt: new Date().toISOString(),
        };

        set({
          tasks: [...state.tasks, task],
          metrics: {
            ...state.metrics,
            tasksCreated: state.metrics.tasksCreated + 1,
            firstTaskCreatedAt: state.metrics.firstTaskCreatedAt || new Date().toISOString(),
          },
        });
      },

      completeTask: (id, actualMinutes) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          let updatedLearning = state.subjectLearning;

          // Capture learning if subject exists and we have time data
          if (task?.subject) {
            const estimatedHours = task.metrics.timeRequired;
            const actualHours = actualMinutes ? actualMinutes / 60 : estimatedHours;
            updatedLearning = captureCompletion(
              state.subjectLearning,
              task.subject,
              estimatedHours,
              actualHours
            );
          }

          return {
            tasks: state.tasks.map((t) =>
              t.id === id
                ? { ...t, status: TaskStatus.COMPLETED, completedAt: new Date().toISOString() }
                : t
            ),
            metrics: { ...state.metrics, tasksCompleted: state.metrics.tasksCompleted + 1 },
            subjectLearning: updatedLearning,
          };
        }),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      updateTaskStatus: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status } : t
          ),
        })),
      autoSchedule: () => {
        const state = get();
        const fixedEvents = state.events.filter((e) => e.isFixed);
        const occupiedEvents = [...fixedEvents, ...inProgressTaskEvents(state.tasks)];
        const { scheduledTasks, studyBlocks } = generateSchedule(state.tasks, occupiedEvents);

        set({
          tasks: applySchedule(state.tasks, scheduledTasks),
          events: [...fixedEvents, ...studyBlocks],
          metrics: {
            ...state.metrics,
            scheduleRuns: state.metrics.scheduleRuns + 1,
            firstScheduleAt: state.metrics.firstScheduleAt || new Date().toISOString(),
          },
        });
      },

      addFocusSession: (session) => {
        const state = get();
        const newSession = { ...session, id: generateId() };
        set({
          focusSessions: [...state.focusSessions, newSession],
          totalFocusMinutes: state.totalFocusMinutes + session.duration,
          metrics: {
            ...state.metrics,
            focusSessionsCompleted: state.metrics.focusSessionsCompleted + 1,
            firstFocusSessionAt: state.metrics.firstFocusSessionAt || new Date().toISOString(),
          },
        });
      },

      updateStreak: () =>
        set((state) => {
          const today = todayStr();
          const { streak } = state;
          if (streak.lastActiveDate === today) return {};

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          const newStreak = streak.lastActiveDate === yesterdayStr ? streak.currentStreak + 1 : 1;

          return {
            streak: {
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, streak.longestStreak),
              lastActiveDate: today,
            },
            metrics: {
              ...state.metrics,
              daysActive: state.metrics.daysActive + 1,
              lastActiveDate: today,
            },
          };
        }),

      setAdvice: (advice) => set({ advice }),
      setLoadingAdvice: (loadingAdvice) => set({ loadingAdvice }),

      trackCoachRequest: () =>
        set((state) => {
          const today = todayStr();
          return {
            coachRequestsToday: state.lastCoachDate === today ? state.coachRequestsToday + 1 : 1,
            lastCoachDate: today,
            metrics: { ...state.metrics, coachRequests: state.metrics.coachRequests + 1 },
          };
        }),

      // ─── Time Learning ──────────────────────────────────────
      updateSubjectLearning: (subject, estimatedHours, actualHours) =>
        set((state) => ({
          subjectLearning: captureCompletion(
            state.subjectLearning,
            subject,
            estimatedHours,
            actualHours
          ),
        })),

      // ─── Notifications ──────────────────────────────────────
      setNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        })),

      requestNotificationPermission: async () => {
        if (typeof window === "undefined" || !("Notification" in window)) return;
        const permission = await Notification.requestPermission();
        // We need to update store after permission result
        // This is async so we use set outside
        setTimeout(() => {
          useZenStore.getState().setNotificationSettings({ permission });
        }, 0);
      },

      // ─── Day Rescue ─────────────────────────────────────────
      rescueDay: () => {
        const state = get();
        const pendingTasks = state.tasks.filter(
          (t) => t.status === TaskStatus.PENDING || t.status === TaskStatus.OVERDUE
        );

        if (pendingTasks.length === 0) {
          return { tasksAffected: 0 };
        }

        const fixedEvents = state.events.filter((e) => e.isFixed);
        const occupiedEvents = [...fixedEvents, ...inProgressTaskEvents(state.tasks)];
        const { scheduledTasks, studyBlocks } = generateSchedule(pendingTasks, occupiedEvents);

        const tasksAffected = scheduledTasks.length;
        const nextTask = scheduledTasks[0]?.title;
        const nextTime = scheduledTasks[0]?.scheduledStart
          ? new Date(scheduledTasks[0].scheduledStart).toLocaleTimeString("es", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : undefined;

        const rescueEntry: RescueEvent = {
          timestamp: new Date().toISOString(),
          tasksAffected,
          hourOfDay: new Date().getHours(),
        };

        set({
          tasks: applySchedule(state.tasks, scheduledTasks),
          events: [...fixedEvents, ...studyBlocks],
          rescueHistory: [...state.rescueHistory, rescueEntry],
          metrics: {
            ...state.metrics,
            scheduleRuns: state.metrics.scheduleRuns + 1,
            firstScheduleAt: state.metrics.firstScheduleAt || new Date().toISOString(),
          },
        });

        return { tasksAffected, nextTask, nextTime };
      },

      trackEvent: (event) =>
        set((state) => ({
          metrics: { ...state.metrics, [event]: (state.metrics[event] as number) + 1 },
        })),
    }),
    {
      name: "zennyth-store",
      onRehydrateStorage: () => (state) => {
        if (state?.isOnboarded && (!state.tasks.some((task) => task.status === TaskStatus.COMPLETED) || state.tasks.some((task) => task.id.startsWith("demo-")))) {
          state.loadDemoTasks();
        }
      },
    }
  )
);
