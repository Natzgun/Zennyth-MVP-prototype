import { Card } from "@/components/ui/card";
import { TaskStatus, type FocusSession, type Task } from "@/types";

const WEEKS_TO_SHOW = 17;
const DAILY_QUOTES = [
  "Un bloque de enfoque hoy vale más que un plan perfecto mañana.",
  "El progreso se construye con sesiones pequeñas y constantes.",
  "Tu atención es tu recurso más valioso: protégela.",
  "Avanza una tarea a la vez; el ritmo llega después.",
  "No necesitas terminar todo hoy, solo avanzar con intención.",
  "La constancia convierte el estudio en confianza.",
  "Cada minuto de enfoque es una inversión en tu futuro.",
];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function heatLevel(value: number, maximum: number) {
  if (value === 0 || maximum === 0) return 0;
  return Math.min(4, Math.ceil((value / maximum) * 4));
}

function cellStyle(level: number, isFuture: boolean) {
  if (isFuture) return { backgroundColor: "transparent" };

  const colors = [
    "var(--color-bg-subtle)",
    "var(--color-primary-subtle)",
    "var(--color-primary)",
    "var(--color-primary)",
    "var(--color-accent)",
  ];
  const opacity = [1, 1, 0.45, 0.75, 1];

  return { backgroundColor: colors[level], opacity: opacity[level] };
}

interface ActivityHeatmapProps {
  tasks: Task[];
  focusSessions: FocusSession[];
}

export function ActivityHeatmap({ tasks, focusSessions }: ActivityHeatmapProps) {
  const today = startOfDay(new Date());
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - today.getDay() - (WEEKS_TO_SHOW - 1) * 7);

  const activityByDay = new Map<string, number>();
  const addActivity = (timestamp: string, amount: number) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return;

    const key = dateKey(date);
    activityByDay.set(key, (activityByDay.get(key) ?? 0) + amount);
  };

  tasks.forEach((task) => {
    if (task.completedAt) addActivity(task.completedAt, 1);
  });
  focusSessions.forEach((session) => addActivity(session.startedAt, Math.max(1, Math.ceil(session.duration / 30))));

  const days = Array.from({ length: WEEKS_TO_SHOW * 7 }, (_, index) => {
    const date = new Date(firstDay);
    date.setDate(firstDay.getDate() + index);
    return date;
  });
  const maxActivity = Math.max(0, ...activityByDay.values());
  const totalActiveDays = days.filter((date) => (activityByDay.get(dateKey(date)) ?? 0) > 0).length;
  const completedTasks = tasks.filter((task) => task.status === TaskStatus.COMPLETED).length;
  const pendingTasks = tasks.filter((task) => task.status !== TaskStatus.COMPLETED).length;
  const dailyQuote = DAILY_QUOTES[(today.getDate() - 1) % DAILY_QUOTES.length];
  const todayLabel = today.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
  const weekColumns = Array.from({ length: WEEKS_TO_SHOW }, (_, index) => days.slice(index * 7, index * 7 + 7));

  return (
    <Card hover={false} className="w-full p-3 sm:p-4">
      <div>
        <div>
          <h2 className="text-sm font-bold text-text-1">Actividad de estudio</h2>
          <p className="mt-0.5 text-xs text-text-3">Tus últimas 17 semanas de avance</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-center">
        <div>
          <div
            className="grid w-fit grid-cols-[auto_minmax(0,1fr)] gap-2"
            role="img"
            aria-label={`Mapa de actividad: ${totalActiveDays} días activos en las últimas ${WEEKS_TO_SHOW} semanas.`}
          >
            <div className="hidden pt-5 text-[10px] text-text-3 sm:flex sm:flex-col sm:justify-around" aria-hidden="true">
              <span>Lun</span>
              <span>Mié</span>
              <span>Vie</span>
            </div>

            <div>
              <div className="grid h-4 gap-1 text-[10px] text-text-3" style={{ gridTemplateColumns: `repeat(${WEEKS_TO_SHOW}, 14px)` }} aria-hidden="true">
                {weekColumns.map((week, index) => {
                  const monthStart = week.find((date) => date.getDate() === 1) ?? (index === 0 ? week[0] : undefined);
                  return <span key={index}>{monthStart?.toLocaleDateString("es", { month: "short" }).replace(".", "")}</span>;
                })}
              </div>
              <div className="mt-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${WEEKS_TO_SHOW}, 14px)` }}>
                {weekColumns.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-1">
                    {week.map((date) => {
                      const value = activityByDay.get(dateKey(date)) ?? 0;
                      const isFuture = date > today;
                      const level = heatLevel(value, maxActivity);
                      const description = isFuture
                        ? `${date.toLocaleDateString("es", { day: "numeric", month: "long" })}: aún no llega`
                        : `${date.toLocaleDateString("es", { day: "numeric", month: "long" })}: ${value === 0 ? "sin actividad" : `${value} puntos de actividad`}`;

                      return <div key={date.toISOString()} className="h-3.5 w-3.5 rounded-[3px] border border-border/70 transition-colors duration-200" style={cellStyle(level, isFuture)} title={description} aria-label={description} />;
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-text-3" aria-hidden="true">
            <span>Menos</span>
            {[0, 1, 2, 3, 4].map((level) => <span key={level} className="h-3 w-3 rounded-[3px] border border-border/70" style={cellStyle(level, false)} />)}
            <span>Más</span>
          </div>
        </div>

        <div className="hidden flex-1 md:flex md:flex-col md:items-center md:justify-center md:gap-3">
          <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-bg-subtle/40">
            <StudyMetric label="Días activos" value={totalActiveDays} color="text-accent" />
            <StudyMetric label="Tareas completadas" value={completedTasks} color="text-primary" />
            <StudyMetric label="Tareas pendientes" value={pendingTasks} color="text-warning" />
          </div>
          <div className="max-w-sm text-center">
            <p className="text-sm italic leading-relaxed text-text-2">&ldquo;{dailyQuote}&rdquo;</p>
            <time dateTime={today.toISOString().slice(0, 10)} className="mt-1 block text-[11px] font-semibold capitalize text-text-3">{todayLabel}</time>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StudyMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="min-w-24 px-3 py-2 text-center">
      <span className={`block text-base font-bold tabular-nums ${color}`}>{value}</span>
      <span className="block text-[10px] font-semibold text-text-3">{label}</span>
    </div>
  );
}
