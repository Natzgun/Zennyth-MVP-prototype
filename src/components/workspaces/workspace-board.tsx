"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { KanbanColumn } from "@/components/ui/kanban/column";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GroupTaskCard } from "./group-task-card";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Plus,
  Timer,
  X,
} from "lucide-react";
import type { GroupTask, GroupTaskStatus } from "@/types/workspace";
import { todayStr } from "@/lib/utils";
import { useTouchDnD } from "@/hooks/use-touch-dnd";

interface WorkspaceBoardProps {
  workspaceId: string;
}

const DEFAULT_DEADLINE_DAYS = 7;

type StatusTone = "todo" | "in-progress" | "done";

const STATUS_TONE: Record<GroupTaskStatus, StatusTone> = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  DONE: "done",
};

/**
 * 3-column shared Kanban for a single workspace. Reuses the
 * `KanbanColumn` primitive from `src/components/ui/kanban/` for visual
 * consistency with the personal board. Data source: `useWorkspaceStore`.
 *
 * Drag-drop: cards carry the task id; columns translate the drop into
 * `updateTaskStatus(workspaceId, taskId, status)`. Local-first only —
 * other members' copies are unaffected (per design).
 */
export function WorkspaceBoard({ workspaceId }: WorkspaceBoardProps) {
  const workspace = useWorkspaceStore((s) =>
    s.workspaces.find((w) => w.id === workspaceId)
  );
  const updateTaskStatus = useWorkspaceStore((s) => s.updateTaskStatus);
  const addGroupTask = useWorkspaceStore((s) => s.addGroupTask);

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDeadlineDate, setNewDeadlineDate] = useState(todayStr());
  const [newAssignee, setNewAssignee] = useState<string>("");

  if (!workspace) return null;

  const currentMember = workspace.members[workspace.members.length - 1];
  const currentMemberId = currentMember?.id;

  const columns: Record<GroupTaskStatus, GroupTask[]> = {
    TODO: workspace.tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: workspace.tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: workspace.tasks.filter((t) => t.status === "DONE"),
  };

  // ── Tap-to-tap (móvil / tablet) ───────────────────────────────
  const {
    selectedTaskId,
    selectTask,
    dropOnStatus,
    clearSelection,
  } = useTouchDnD((taskId, status) =>
    updateTaskStatus(workspaceId, taskId, status as GroupTaskStatus)
  );

  const handleBoardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea, [role='menuitem']")) return;

    const cardEl = target.closest("[data-task-id]");
    const columnEl = target.closest("[data-column-status]");

    if (cardEl) {
      const clickedTaskId = cardEl.getAttribute("data-task-id");
      if (!clickedTaskId) return;

      if (clickedTaskId === selectedTaskId) {
        clearSelection();
      } else if (selectedTaskId) {
        const status = columnEl?.getAttribute("data-column-status");
        if (status) dropOnStatus(status);
      } else {
        selectTask(clickedTaskId);
      }
    } else if (columnEl && selectedTaskId) {
      const status = columnEl.getAttribute("data-column-status");
      if (status) dropOnStatus(status);
    } else {
      if (selectedTaskId) clearSelection();
    }
  };

  // ── Drag handlers (desktop) ─────────────────────────────────
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("workspaceId", workspaceId);
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = "0.5";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: GroupTaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) updateTaskStatus(workspaceId, taskId, status);
  };

  // ── Add task inline form ────────────────────────────────────
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed || !currentMemberId) return;
    const deadline = newDeadlineDate
      ? new Date(`${newDeadlineDate}T23:59:59`).toISOString()
      : new Date(
          Date.now() + DEFAULT_DEADLINE_DAYS * 24 * 60 * 60 * 1000
        ).toISOString();
    const assignedTo = newAssignee ? newAssignee : undefined;
    addGroupTask(workspaceId, trimmed, deadline, currentMemberId, assignedTo);
    setNewTitle("");
    setNewDeadlineDate(todayStr());
    setNewAssignee("");
    setAdding(false);
  };

  const cancelAdd = () => {
    setAdding(false);
    setNewTitle("");
    setNewDeadlineDate(todayStr());
    setNewAssignee("");
  };

  // ── Empty states ────────────────────────────────────────────
  const emptyStates: Record<GroupTaskStatus, React.ReactNode> = {
    TODO: (
      <div className="flex flex-col items-center justify-center flex-1 text-center opacity-60 px-2">
        <ClipboardList className="w-7 h-7 text-text-3 mb-2" />
        <p className="text-xs text-text-3 font-medium leading-relaxed">
          No hay tareas acá. Agregá la primera con &quot;Nueva tarea&quot;.
        </p>
      </div>
    ),
    IN_PROGRESS: (
      <div className="flex flex-col items-center justify-center flex-1 text-center opacity-60 px-2">
        <Timer className="w-7 h-7 text-text-3 mb-2" />
        <p className="text-xs text-text-3 font-medium leading-relaxed">
          Arrastrá tareas a esta columna cuando el grupo empiece a trabajar.
        </p>
      </div>
    ),
    DONE: (
      <div className="flex flex-col items-center justify-center flex-1 text-center opacity-60 px-2">
        <CheckCircle2 className="w-7 h-7 text-text-3 mb-2" />
        <p className="text-xs text-text-3 font-medium leading-relaxed">
          Los logros grupales van a aparecer acá.
        </p>
      </div>
    ),
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xs font-bold text-text-2 uppercase tracking-wider">
          Tablero del grupo
        </h2>
        {!adding ? (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="w-3.5 h-3.5" />
            Nueva tarea
          </Button>
        ) : (
          <form
            onSubmit={handleAddTask}
            className="flex items-center gap-2 flex-1 justify-end flex-wrap"
          >
            <Input
              id="new-group-task-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título de la tarea"
              autoFocus
              className="flex-1 min-w-[180px]"
              maxLength={120}
            />
            <input
              type="date"
              value={newDeadlineDate}
              onChange={(e) => setNewDeadlineDate(e.target.value)}
              aria-label="Fecha límite"
              className="rounded-xl bg-bg-subtle border border-border px-3 py-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 min-h-[44px]"
            />
            <select
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              aria-label="Asignar a (opcional)"
              className="rounded-xl bg-bg-subtle border border-border px-3 py-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 min-h-[44px] cursor-pointer"
            >
              <option value="">Sin asignar</option>
              {workspace.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id === currentMemberId ? `${m.name} (tú)` : m.name}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm" disabled={!newTitle.trim()}>
              Crear
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={cancelAdd}
              aria-label="Cancelar"
            >
              <X className="w-4 h-4" />
            </Button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" onClick={handleBoardClick}>
        <KanbanColumn
          title="Por hacer"
          icon={ClipboardList}
          count={columns.TODO.length}
          status="TODO"
          isDropReady={!!selectedTaskId}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "TODO")}
          emptyState={emptyStates.TODO}
        >
          {columns.TODO.map((task) => (
            <GroupTaskCard
              key={task.id}
              task={task}
              workspaceId={workspaceId}
              members={workspace.members}
              currentMemberId={currentMemberId}
              statusTone={STATUS_TONE[task.status]}
              isSelected={selectedTaskId === task.id}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
  
            />
          ))}
        </KanbanColumn>

        <KanbanColumn
          title="En progreso"
          icon={Timer}
          count={columns.IN_PROGRESS.length}
          status="IN_PROGRESS"
          isDropReady={!!selectedTaskId}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "IN_PROGRESS")}
          bgClass="bg-primary/5 border-primary/10 hover:bg-primary/10"
          titleClassName="text-primary"
          countClassName="bg-primary/20 text-primary"
          emptyState={emptyStates.IN_PROGRESS}
        >
          {columns.IN_PROGRESS.map((task) => (
            <GroupTaskCard
              key={task.id}
              task={task}
              workspaceId={workspaceId}
              members={workspace.members}
              currentMemberId={currentMemberId}
              statusTone={STATUS_TONE[task.status]}
              isSelected={selectedTaskId === task.id}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
  
            />
          ))}
        </KanbanColumn>

        <KanbanColumn
          title="Terminadas"
          icon={CheckCircle2}
          count={columns.DONE.length}
          status="DONE"
          isDropReady={!!selectedTaskId}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "DONE")}
          bgClass="bg-accent/5 border-accent/10 hover:bg-accent/10"
          titleClassName="text-accent"
          countClassName="bg-accent/20 text-accent"
          emptyState={emptyStates.DONE}
        >
          {columns.DONE.map((task) => (
            <GroupTaskCard
              key={task.id}
              task={task}
              workspaceId={workspaceId}
              members={workspace.members}
              currentMemberId={currentMemberId}
              statusTone={STATUS_TONE[task.status]}
              isSelected={selectedTaskId === task.id}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
  
            />
          ))}
        </KanbanColumn>
      </div>
    </div>
  );
}
