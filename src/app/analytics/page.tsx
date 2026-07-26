"use client";

import { useZenStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart3, CheckCircle2, Clock, AlertTriangle, Flame } from "lucide-react";
import { VelocityChart } from "./velocity-chart";

const CHART_COLORS = ["#34c790", "#7c5cfc", "#e85454"];

export default function AnalyticsPage() {
  const { tasks, streak, totalFocusMinutes } = useZenStore();
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const pending = tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length;
  const overdue = tasks.filter((t) => t.status === "OVERDUE").length;
  const total = tasks.length;
  const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
  const chartData = [{ name: "Completadas", value: completed }, { name: "Pendientes", value: pending }, { name: "Vencidas", value: overdue }].filter((d) => d.value > 0);
  const avgPriority = tasks.length > 0 ? (tasks.reduce((sum, t) => sum + t.calculatedPriority, 0) / tasks.length).toFixed(1) : "0";

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-1 flex items-center gap-2.5"><BarChart3 className="w-6 h-6 text-primary" />Analytics</h1>
        <p className="text-sm text-text-2 mt-0.5">Resumen de tu productividad</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<CheckCircle2 className="w-4 h-4 text-accent" />} label="Completadas" value={completed} color="text-accent" />
        <StatCard icon={<Clock className="w-4 h-4 text-primary" />} label="Pendientes" value={pending} color="text-primary" />
        <StatCard icon={<AlertTriangle className="w-4 h-4 text-danger" />} label="Vencidas" value={overdue} color="text-danger" />
        <StatCard icon={<Flame className="w-4 h-4 text-warning" />} label="Racha" value={`${streak.currentStreak}d`} color="text-warning" />
      </div>

      <VelocityChart />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hover={false}>
          <h2 className="text-sm font-bold text-text-1 mb-4">Distribución de Tareas</h2>
          {total === 0 ? (
            <p className="text-xs text-text-3 text-center py-10">Agrega tareas para ver estadísticas</p>
          ) : (
            <>
              <div className="h-48" role="img" aria-label={`Distribución: ${completed} completadas, ${pending} pendientes, ${overdue} vencidas`}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", fontSize: "12px", color: "var(--color-text-1)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-3">
                {chartData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i] }} />
                    <span className="text-[11px] text-text-2">{d.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card hover={false}>
          <h2 className="text-sm font-bold text-text-1 mb-4">Eficiencia</h2>
          <div className="flex flex-col items-center py-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128" role="img" aria-label={`Eficiencia: ${efficiency}%`}>
                <circle cx="64" cy="64" r="56" fill="none" stroke="var(--color-bg-subtle)" strokeWidth="8" />
                <circle cx="64" cy="64" r="56" fill="none" stroke={efficiency >= 70 ? "#34c790" : efficiency >= 40 ? "#f0a030" : "#e85454"} strokeWidth="8" strokeDasharray={`${(efficiency / 100) * 352} 352`} strokeLinecap="round" className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-text-1 tabular-nums">{efficiency}%</span>
                <span className="text-[10px] text-text-3">completadas</span>
              </div>
            </div>
          </div>
          <div className="space-y-3 mt-3">
            <div className="flex items-center justify-between text-xs"><span className="text-text-2">Prioridad promedio</span><span className="text-text-1 font-mono tabular-nums">{avgPriority}</span></div>
            <div className="flex items-center justify-between text-xs"><span className="text-text-2">Tiempo enfocado</span><span className="text-text-1 font-mono tabular-nums">{Math.round(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m</span></div>
            <div className="flex items-center justify-between text-xs"><span className="text-text-2">Mejor racha</span><span className="text-text-1 font-mono tabular-nums">{streak.longestStreak} días</span></div>
          </div>
        </Card>
      </div>
    </div>
    
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[10px] text-text-3 uppercase tracking-wider">{label}</span></div>
      <span className={`text-2xl font-bold tabular-nums ${color}`}>{value}</span>
    </Card>
  );
}
