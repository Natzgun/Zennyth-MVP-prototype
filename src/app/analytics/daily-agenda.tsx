"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { CalendarDays, Users } from "lucide-react";

export interface AgendaTask {
  id: string;
  title: string;
  priority: number;
  startH: number;
  startM: number;
  duration: number;
}

export interface GroupAgendaTask {
  id: string;
  title: string;
}

const MOCK_TASKS: AgendaTask[] = [
  { id: "1", title: "Estudiar para parcial de Cálculo", priority: 9, startH: 9, startM: 0, duration: 180 },
  { id: "3", title: "Ensayo de Historia del Arte", priority: 3, startH: 16, startM: 0, duration: 120 },
];

interface DailyAgendaProps {
  tasks?: AgendaTask[];
  groupTasks?: GroupAgendaTask[];
}

export function DailyAgenda({ tasks, groupTasks }: DailyAgendaProps) {
  // Ahora usamos las 24 horas para que el calendario sea real
  const startHour = 0;
  const endHour = 24; 
  const hoursList = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  const displayTasks = tasks && tasks.length > 0 ? tasks : MOCK_TASKS;

  const [now, setNow] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null); // Referencia para controlar el scroll

  // 1. Actualiza la hora cada minuto
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Auto-scroll a la hora actual al cargar el componente
  useEffect(() => {
    if (scrollRef.current) {
      const currentH = new Date().getHours();
      // Restamos 2 horas para que la línea roja no quede pegada al techo, sino centrada
      const scrollPosition = Math.max(0, (currentH - 2) * 60);
      scrollRef.current.scrollTop = scrollPosition;
    }
  }, []);

  const getIntensityClasses = (priority: number) => {
    if (priority >= 8) return "bg-primary-subtle text-primary border-primary/35 shadow-sm z-10";
    if (priority >= 5) return "bg-primary-subtle/70 text-text-1 border-primary/25";
    return "bg-accent-subtle/70 text-text-2 border-accent/25";
  };

  // Cálculos para la posición de la línea roja
  const currentH = now.getHours();
  const currentM = now.getMinutes();
  const nowOffset = ((currentH - startHour) * 60) + currentM;

  return (
    <Card className="p-5 h-full flex flex-col min-h-[600px] max-h-[800px]">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-sm font-bold text-text-1 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Línea de Tiempo
          </h2>
        </div>
      </div>

      {/* Tareas grupales del día — banner fijo arriba del timeline */}
      {groupTasks && groupTasks.length > 0 && (
        <div className="mb-3 p-3 rounded-lg bg-accent-subtle/40 border border-accent/30">
          <h3 className="text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5" />
            Tareas grupales de hoy
          </h3>
          <div className="flex flex-wrap gap-2">
            {groupTasks.map((gt) => (
              <span
                key={gt.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-accent/10 text-accent border border-accent/20"
              >
                {gt.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CONTENEDOR CON SCROLL (overflow-y-auto) */}
      <div
        ref={scrollRef}
        className="scrollbar-zennyth relative w-full overflow-y-auto bg-surface rounded-lg border border-border flex-1 scroll-smooth"
      >
        {/* Contenedor interno que define la altura total (24 horas * 60px) */}
        <div className="relative" style={{ height: `${24 * 60}px` }}>
          
          {/* Fondo del calendario (Líneas de las horas) */}
          <div className="absolute inset-0">
            {hoursList.map(hour => (
              <div key={hour} className="flex border-b border-border/50" style={{ height: "60px" }}>
                <div className="w-14 flex-shrink-0 text-[10px] text-text-3 font-medium bg-surface pt-1 pl-2 border-r border-border/50">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 bg-bg-subtle/20"></div>
              </div>
            ))}
          </div>

          {/* LÍNEA DE TIEMPO REAL (El indicador rojo siempre visible ahora) */}
          <div
            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
            style={{ top: `${nowOffset}px`, transform: "translateY(-50%)" }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-primary/70 shadow-sm shadow-primary/20 ml-[50px]"></div>
            <div className="flex-1 h-[2px] bg-primary/50"></div>
          </div>

          {/* Bloques de tareas */}
          <div className="absolute inset-0 left-14">
            {displayTasks.map(task => {
              const topOffset = ((task.startH - startHour) * 60) + task.startM;
              if (task.startH < startHour || task.startH >= endHour) return null;

              return (
                <div
                  key={task.id}
                  className={`absolute left-1 right-2 rounded-md border-l-4 p-2 overflow-hidden transition-all hover:brightness-110 cursor-pointer ${getIntensityClasses(task.priority)}`}
                  style={{ top: `${topOffset}px`, height: `${task.duration - 2}px` }}
                >
                  <h3 className="break-words text-[11px] font-semibold leading-tight" title={task.title}>{task.title}</h3>
                </div>
              );
            })}
          </div>
          
        </div>
      </div>
    </Card>
  );
}
