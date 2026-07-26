"use client";

import { useEffect } from "react";
import { useZenStore } from "@/lib/store";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { ZenCoachWidget } from "@/components/coach/zen-coach-widget";
import { StreakBadge } from "@/components/dashboard/streak-badge";
import { RescueButton } from "@/components/manana/rescue-button";
import { TimeAccuracyBadge } from "@/components/manana/time-accuracy-badge";
import { DailyBanner } from "@/components/manana/daily-banner";
import { ShareStats } from "@/components/ui/share-stats";
import { NpsPrompt } from "@/components/ui/nps-prompt";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { TaskStatus } from "@/types";

import { KanbanBoard } from "../app/analytics/kanban-board";
import { DailyAgenda, AgendaTask, GroupAgendaTask } from "../app/analytics/daily-agenda";

/**
 * Build the list of group tasks due today that are visible to the
 * current member. These are shown in a dedicated banner ABOVE the
 * timeline — they do NOT occupy a fixed hour slot.
 *
 * The "current member" is the last-joined member in a workspace
 * (single-device MVP assumption).
 */
function buildGroupAgendaTasks(
  workspaces: ReturnType<typeof useWorkspaceStore.getState>["workspaces"],
  today: Date
): GroupAgendaTask[] {
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const out: GroupAgendaTask[] = [];

  for (const ws of workspaces) {
    const currentMember = ws.members[ws.members.length - 1];
    if (!currentMember) continue;
    const currentMemberId = currentMember.id;

    for (const t of ws.tasks) {
      // Skip if status is DONE — the user already finished it.
      if (t.status === "DONE") continue;

      // Skip if explicitly assigned to someone else in the group.
      if (t.assignedTo && t.assignedTo !== currentMemberId) continue;

      const deadline = new Date(t.deadline);
      if (Number.isNaN(deadline.getTime())) continue;
      if (deadline < startOfDay || deadline > endOfDay) continue;

      out.push({
        id: `grp-${t.id}`,
        title: t.title,
      });
    }
  }

  return out;
}

export default function DashboardPage() {
  const { tasks, focusSessions, autoSchedule } = useZenStore();
  // NOTE: this is a deliberate, documented exception to strict store
  // isolation. The Mañana dashboard is the aggregation layer where group
  // work meets the individual timeline. If the user has zero workspaces,
  // the workspace store is read but contributes zero tasks, leaving the
  // render byte-identical to the pre-workspace Mañana view.
  const workspaces = useWorkspaceStore((s) => s.workspaces);

  useEffect(() => {
    const hasUnscheduled = tasks.some(
      (t) => t.status !== "COMPLETED" && !t.scheduledStart
    );
    if (hasUnscheduled) {
      autoSchedule();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const today = new Date();
  const dateStr = today.toLocaleDateString("es", { day: "numeric", month: "long" });
  const dayNameCapitalized = today.toLocaleDateString("es", { weekday: "long" }).charAt(0).toUpperCase() + today.toLocaleDateString("es", { weekday: "long" }).slice(1);

  // Preparamos solo las tareas programadas para la agenda de hoy.
  const individualAgendaTasks: AgendaTask[] = tasks.filter((t) => {
    if (t.status === TaskStatus.COMPLETED) return false;
    if (!t.scheduledStart) return false;
    return new Date(t.scheduledStart).toDateString() === today.toDateString();
  }).map(t => {
    const d = new Date(t.scheduledStart!);
    return {
      id: t.id,
      title: t.title,
      priority: t.calculatedPriority || 5,
      startH: d.getHours(),
      startM: d.getMinutes(),
      duration: (t.metrics?.timeRequired || 1) * 60
    };
  });

  // Tareas grupales visibles hoy (banner arriba del timeline, no bloques de hora).
  const groupAgendaTasks = buildGroupAgendaTasks(workspaces, today);

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <DailyBanner />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-1">Hoy, {dayNameCapitalized}</h1>
          <p className="text-sm text-text-2 mt-0.5 capitalize">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          <TimeAccuracyBadge />
          <ShareStats />
          <RescueButton />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-6">
          <ActivityHeatmap tasks={tasks} focusSessions={focusSessions} />
          <StreakBadge />
          <NpsPrompt />
          <KanbanBoard />
        </div>

        <div className="lg:sticky lg:top-6">
          <DailyAgenda
            tasks={individualAgendaTasks.length > 0 ? individualAgendaTasks : undefined}
            groupTasks={groupAgendaTasks.length > 0 ? groupAgendaTasks : undefined}
          />
        </div>
      </div>

      <div className="pt-8 opacity-80 max-w-2xl">
        <ZenCoachWidget />
      </div>
    </div>
  );
}
