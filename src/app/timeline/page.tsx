"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useZenStore } from "@/lib/store";
import { TaskStatus } from "@/types";

type View = "day" | "week" | "month";
type ItemKind = "task" | "completed" | "class" | "focus" | "personal";

interface TimelineItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  kind: ItemKind;
}

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function atStartOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function sameDay(first: Date, second: Date) {
  return first.toDateString() === second.toDateString();
}

function startOfWeek(date: Date) {
  const start = atStartOfDay(date);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function itemClass(kind: ItemKind) {
  const classes: Record<ItemKind, string> = {
    task: "bg-warning-subtle border-warning/25 text-text-1",
    completed: "bg-accent-subtle border-accent/25 text-accent",
    class: "bg-primary-subtle border-primary/25 text-primary",
    focus: "bg-primary-subtle/70 border-primary/20 text-text-1",
    personal: "bg-bg-subtle border-border text-text-2",
  };
  return classes[kind];
}

function itemLabel(kind: ItemKind) {
  const labels: Record<ItemKind, string> = {
    task: "Tarea",
    completed: "Completada",
    class: "Clase",
    focus: "Focus",
    personal: "Personal",
  };
  return labels[kind];
}

export default function TimelinePage() {
  const { tasks, events, focusSessions } = useZenStore();
  const [view, setView] = useState<View>("week");
  const [selectedDate, setSelectedDate] = useState(() => atStartOfDay(new Date()));

  const taskItems: TimelineItem[] = tasks.map((task) => {
    const start = new Date(task.scheduledStart ?? task.deadline);
    const end = task.scheduledEnd
      ? new Date(task.scheduledEnd)
      : new Date(start.getTime() + task.metrics.timeRequired * 60 * 60 * 1000);

    return {
      id: `task-${task.id}`,
      title: task.title,
      start,
      end,
      kind: task.status === TaskStatus.COMPLETED ? "completed" : "task",
    };
  });
  const eventItems: TimelineItem[] = events
    .filter((event) => event.isFixed)
    .map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      kind: event.type === "CLASS" || event.type === "LAB" ? "class" : "personal",
    }));
  const focusItems: TimelineItem[] = focusSessions
    .filter((session) => session.type === "WORK")
    .map((session) => {
      const start = new Date(session.startedAt);
      return {
        id: `focus-${session.id}`,
        title: session.taskTitle || "Sesión de enfoque",
        start,
        end: new Date(start.getTime() + session.duration * 60 * 1000),
        kind: "focus",
      };
    });
  const items = [...taskItems, ...eventItems, ...focusItems]
    .filter((item) => !Number.isNaN(item.start.getTime()))
    .sort((first, second) => first.start.getTime() - second.start.getTime());

  const movePeriod = (direction: -1 | 1) => {
    if (view === "day") setSelectedDate(addDays(selectedDate, direction));
    if (view === "week") setSelectedDate(addDays(selectedDate, direction * 7));
    if (view === "month") {
      const next = new Date(selectedDate);
      next.setMonth(next.getMonth() + direction);
      setSelectedDate(next);
    }
  };

  const periodLabel = view === "day"
    ? selectedDate.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })
    : view === "week"
      ? `${startOfWeek(selectedDate).toLocaleDateString("es", { day: "numeric", month: "short" })} - ${addDays(startOfWeek(selectedDate), 6).toLocaleDateString("es", { day: "numeric", month: "short" })}`
      : selectedDate.toLocaleDateString("es", { month: "long", year: "numeric" });

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-text-1">
            <CalendarDays className="h-6 w-6 text-primary" />
            Línea de tiempo
          </h1>
          <p className="mt-0.5 text-sm text-text-2">Organiza tu estudio por día, semana o mes</p>
        </div>
        <div className="flex rounded-xl border border-border bg-surface p-1" role="group" aria-label="Vista de calendario">
          {(["day", "week", "month"] as View[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              aria-pressed={view === option}
              className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition-colors ${view === option ? "bg-primary-subtle text-primary" : "text-text-3 hover:bg-bg-subtle hover:text-text-1"}`}
            >
              {{ day: "Día", week: "Semana", month: "Mes" }[option]}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-2">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => movePeriod(-1)} aria-label="Período anterior"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => movePeriod(1)} aria-label="Período siguiente"><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(atStartOfDay(new Date()))}>Hoy</Button>
        </div>
        <p className="capitalize text-sm font-bold text-text-1">{periodLabel}</p>
        <div className="hidden items-center gap-3 text-[11px] text-text-3 sm:flex" aria-label="Leyenda">
          <LegendItem className="bg-warning-subtle border-warning/25" label="Tareas" />
          <LegendItem className="bg-primary-subtle border-primary/25" label="Clases y Focus" />
          <LegendItem className="bg-accent-subtle border-accent/25" label="Completadas" />
        </div>
      </div>

      {view === "day" && <DayView date={selectedDate} items={items} />}
      {view === "week" && <WeekView date={selectedDate} items={items} />}
      {view === "month" && <MonthView date={selectedDate} items={items} />}
    </div>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full border ${className}`} />{label}</span>;
}

function DayView({ date, items }: { date: Date; items: TimelineItem[] }) {
  const dayItems = items.filter((item) => sameDay(item.start, date));

  return (
    <Card hover={false} className="p-4 sm:p-6">
      {dayItems.length === 0 ? (
        <EmptyState />
      ) : (
        <ol className="relative ml-3 space-y-3 border-l border-border pl-6">
          {dayItems.map((item) => (
            <li key={item.id} className="relative">
              <span className="absolute -left-[31px] top-4 h-3 w-3 rounded-full border-2 border-surface bg-primary" />
              <div className={`rounded-xl border p-3 ${itemClass(item.kind)}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold">{item.title}</p>
                  <span className="flex items-center gap-1 text-[11px] font-semibold opacity-75"><Clock3 className="h-3 w-3" />{item.start.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="mt-1 text-xs opacity-75">{itemLabel(item.kind)} · hasta {item.end.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

function WeekView({ date, items }: { date: Date; items: TimelineItem[] }) {
  const firstDay = startOfWeek(date);
  const days = Array.from({ length: 7 }, (_, index) => addDays(firstDay, index));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {days.map((day, index) => {
        const dayItems = items.filter((item) => sameDay(item.start, day));
        const isToday = sameDay(day, new Date());
        return (
          <Card key={day.toISOString()} hover={false} className={`min-h-48 p-3 ${isToday ? "border-primary/35 bg-primary-subtle/30" : ""}`}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-3">{WEEKDAYS[index]}</span>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${isToday ? "bg-primary text-on-primary" : "bg-bg-subtle text-text-2"}`}>{day.getDate()}</span>
            </div>
            <div className="space-y-2">
              {dayItems.slice(0, 4).map((item) => <EventPill key={item.id} item={item} />)}
              {dayItems.length > 4 && <p className="px-1 text-[11px] font-semibold text-text-3">+{dayItems.length - 4} más</p>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function MonthView({ date, items }: { date: Date; items: TimelineItem[] }) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDay = addDays(monthStart, -((monthStart.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, index) => addDays(firstDay, index));

  return (
    <Card hover={false} className="overflow-hidden p-0">
      <div className="grid grid-cols-7 border-b border-border bg-bg-subtle/50">
        {WEEKDAYS.map((day) => <span key={day} className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-text-3">{day}</span>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayItems = items.filter((item) => sameDay(item.start, day));
          const isCurrentMonth = day.getMonth() === date.getMonth();
          const isToday = sameDay(day, new Date());
          return (
            <div key={day.toISOString()} className={`min-h-28 border-b border-r border-border p-1.5 sm:min-h-32 sm:p-2 ${isCurrentMonth ? "bg-surface" : "bg-bg-subtle/40"}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${isToday ? "bg-primary text-on-primary" : isCurrentMonth ? "text-text-2" : "text-text-3"}`}>{day.getDate()}</span>
              <div className="mt-1 space-y-1">
                {dayItems.slice(0, 2).map((item) => <EventPill key={item.id} item={item} compact />)}
                {dayItems.length > 2 && <p className="px-1 text-[10px] font-semibold text-text-3">+{dayItems.length - 2}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function EventPill({ item, compact = false }: { item: TimelineItem; compact?: boolean }) {
  return <div className={`rounded-md border px-1.5 py-1 text-[10px] font-semibold leading-tight ${itemClass(item.kind)} ${compact ? "truncate" : ""}`} title={item.title}>{compact ? item.title : `${item.start.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })} ${item.title}`}</div>;
}

function EmptyState() {
  return <div className="flex min-h-72 flex-col items-center justify-center text-center"><div className="mb-3 rounded-xl bg-primary-subtle p-3 text-primary"><Timer className="h-5 w-5" /></div><p className="text-sm font-bold text-text-1">Sin eventos para este período</p><p className="mt-1 text-xs text-text-3">Programa una tarea o añade una sesión Focus para verla aquí.</p></div>;
}
