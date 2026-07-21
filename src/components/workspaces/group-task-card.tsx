"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { cn, daysUntil } from "@/lib/utils";
import {
  Calendar,
  Check,
  ChevronDown,
  PartyPopper,
  Split,
  UserPlus,
  X,
} from "lucide-react";
import type {
  GroupTask,
  SubTask,
  WorkspaceMember,
} from "@/types/workspace";
import { SplitTaskDialog } from "./split-task-dialog";
import { MemberBadge } from "./member-badge";

interface GroupTaskCardProps {
  task: GroupTask;
  workspaceId: string;
  members: WorkspaceMember[];
  /** The local member id for the current user in this workspace. */
  currentMemberId?: string;
  /** Visual tone for the left border (matches the parent column's status). */
  statusTone: "todo" | "in-progress" | "done";
  isSelected?: boolean;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const STATUS_BORDER: Record<GroupTaskCardProps["statusTone"], string> = {
  todo: "border-l-text-3",
  "in-progress": "border-l-primary",
  done: "border-l-accent",
};

/**
 * Card for a single GroupTask inside the shared workspace board.
 *
 * - Draggable: parent (WorkspaceBoard) attaches drag handlers via props.
 * - Empty state (no subtasks yet): shows a "Dividir entre el grupo" trigger
 *   that opens the SplitTaskDialog. Once split, the trigger is hidden to
 *   prevent accidental overwrites (per spec).
 * - Per-subtask row: shows owner (or "Sin asignar"), with "Reclamar" for
 *   unclaimed subtasks and "Completar" for the subtask's owner.
 * - Individual assignment: the creator of the task is shown as a quiet
 *   owner badge; a small dropdown lets any member reassign or clear the
 *   individual responsibility. Unassigned tasks show an "Asignar a..."
 *   affordance instead.
 * - Celebration: when every subtask is done, a subtle "Logro grupal" badge
 *   appears with `animate-scale-in` (respects prefers-reduced-motion).
 *
 * No red, no blame, no leaderboards — calm collective-progress tone.
 */
export function GroupTaskCard({
  task,
  workspaceId,
  members,
  currentMemberId,
  statusTone,
  isSelected,
  onDragStart,
  onDragEnd,
}: GroupTaskCardProps) {
  const [splitOpen, setSplitOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const claimSubtask = useWorkspaceStore((s) => s.claimSubtask);
  const completeSubtask = useWorkspaceStore((s) => s.completeSubtask);
  const assignTask = useWorkspaceStore((s) => s.assignTask);
  const unassignTask = useWorkspaceStore((s) => s.unassignTask);

  const owner = members.find((m) => m.id === task.createdBy);
  const assignee = task.assignedTo
    ? members.find((m) => m.id === task.assignedTo)
    : undefined;
  const totalSubtasks = task.subtasks.length;
  const doneSubtasks = task.subtasks.filter((s) => s.status === "DONE").length;
  const allDone = totalSubtasks > 0 && doneSubtasks === totalSubtasks;
  const isComplete = task.status === "DONE";

  return (
    <>
      <div
        draggable
        data-task-id={task.id}
        onDragStart={(e) => onDragStart(e, task.id)}
        onDragEnd={onDragEnd}
        className={cn(
          "bg-surface p-4 rounded-lg border-l-4 border-y border-r border-y-border border-r-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group",
          STATUS_BORDER[statusTone],
          isSelected && "ring-2 ring-primary ring-offset-2",
          allDone && "ring-1 ring-accent/30"
        )}
      >
        <h4
          className={cn(
            "text-sm font-semibold text-text-1 leading-snug mb-2",
            isComplete && "line-through text-text-3"
          )}
        >
          {task.title}
        </h4>

        <div className="flex items-center justify-between gap-2 mb-3 text-[10px]">
          <DeadlineBadge iso={task.deadline} />
          <div className="flex items-center gap-1.5">
            {owner && (
              <MemberBadge
                name={owner.name}
                variant={owner.id === currentMemberId ? "self" : "default"}
              />
            )}
            {assignee ? (
              <AssignDropdown
                assignedTo={assignee.id}
                assigneeName={assignee.name}
                isSelf={assignee.id === currentMemberId}
                open={assignOpen}
                onOpenChange={setAssignOpen}
                members={members}
                currentMemberId={currentMemberId}
                onSelect={(memberId) => {
                  assignTask(workspaceId, task.id, memberId);
                  setAssignOpen(false);
                }}
                onUnassign={() => {
                  unassignTask(workspaceId, task.id);
                  setAssignOpen(false);
                }}
              />
            ) : totalSubtasks === 0 ? (
              <AssignDropdown
                assignedTo={undefined}
                assigneeName={undefined}
                isSelf={false}
                open={assignOpen}
                onOpenChange={setAssignOpen}
                members={members}
                currentMemberId={currentMemberId}
                onSelect={(memberId) => {
                  assignTask(workspaceId, task.id, memberId);
                  setAssignOpen(false);
                }}
                onUnassign={() => setAssignOpen(false)}
                placeholder
              />
            ) : null}
          </div>
        </div>

        {totalSubtasks === 0 ? (
          <Button
            variant="accent"
            size="sm"
            onClick={() => setSplitOpen(true)}
            className="w-full"
          >
            <Split className="w-3.5 h-3.5" />
            Dividir entre el grupo
          </Button>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-text-2 uppercase tracking-wider">
                {doneSubtasks}/{totalSubtasks} completadas
              </span>
              {allDone && (
                <span
                  className="flex items-center gap-1 text-[10px] text-accent font-bold animate-scale-in"
                  aria-live="polite"
                >
                  <PartyPopper className="w-3 h-3" />
                  Logro grupal
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {task.subtasks.map((s) => (
                <SubtaskRow
                  key={s.id}
                  subtask={s}
                  members={members}
                  currentMemberId={currentMemberId}
                  onClaim={() =>
                    currentMemberId &&
                    claimSubtask(workspaceId, task.id, s.id, currentMemberId)
                  }
                  onComplete={() =>
                    completeSubtask(workspaceId, task.id, s.id)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
      <SplitTaskDialog
        open={splitOpen}
        workspaceId={workspaceId}
        taskId={task.id}
        onClose={() => setSplitOpen(false)}
      />
    </>
  );
}

// ── Assignment dropdown ──────────────────────────────────────────

interface AssignDropdownProps {
  /** Current assignee id; `undefined` for the unassigned placeholder. */
  assignedTo?: string;
  /** Current assignee name; `undefined` renders the unassigned state. */
  assigneeName?: string;
  /** True when the current assignee is the local user (drives the variant). */
  isSelf: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: WorkspaceMember[];
  currentMemberId?: string;
  onSelect: (memberId: string) => void;
  onUnassign: () => void;
  /** When true, render the unassigned placeholder trigger instead of a name. */
  placeholder?: boolean;
}

/**
 * Tiny popover for the individual task assignment. Shows the current
 * assignee as a clickable chip; clicking opens a list of members to
 * reassign to. The "Sin asignar" placeholder variant is used when no
 * assignment exists yet (only on tasks without subtasks, per spec).
 *
 * No red, no blame — same MemberBadge visual language as elsewhere.
 */
function AssignDropdown({
  assignedTo,
  assigneeName,
  isSelf,
  open,
  onOpenChange,
  members,
  currentMemberId,
  onSelect,
  onUnassign,
  placeholder,
}: AssignDropdownProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onOpenChange]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        draggable={false}
        onClick={(e) => {
          e.stopPropagation();
          onOpenChange(!open);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          placeholder
            ? "Asignar tarea a un miembro"
            : "Reasignar o desasignar tarea"
        }
        className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md"
      >
        {placeholder ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold",
              "bg-bg-subtle text-text-2 hover:bg-surface-hover transition-colors"
            )}
          >
            <UserPlus className="w-2.5 h-2.5" />
            Asignar a...
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold",
              isSelf
                ? "bg-primary-subtle text-primary hover:bg-primary/15"
                : "bg-bg-subtle text-text-2 hover:bg-surface-hover",
              "transition-colors"
            )}
          >
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            {assigneeName}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1.5 z-20 min-w-[180px] rounded-lg border border-border bg-surface shadow-lg p-1 animate-fade-in"
        >
          <p className="px-2.5 pt-1.5 pb-1 text-[9px] font-bold uppercase tracking-wider text-text-3">
            Asignar a
          </p>
          {members.map((m) => {
            const isCurrentAssignee = m.id === assignedTo;
            const isMe = m.id === currentMemberId;
            return (
              <button
                key={m.id}
                type="button"
                role="menuitem"
                onClick={() => onSelect(m.id)}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  "hover:bg-bg-subtle",
                  isCurrentAssignee
                    ? "text-primary"
                    : "text-text-1"
                )}
              >
                {m.name}
                {isMe && (
                  <span className="text-text-3 ml-1.5 font-normal">(tú)</span>
                )}
                {isCurrentAssignee && (
                  <Check className="w-3 h-3 inline ml-1.5 -mt-0.5" />
                )}
              </button>
            );
          })}
          {!placeholder && (
            <>
              <div className="h-px bg-border my-1" />
              <button
                type="button"
                role="menuitem"
                onClick={onUnassign}
                className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium text-text-2 hover:bg-bg-subtle transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-3 h-3" />
                Desasignar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Subtask row ───────────────────────────────────────────────────

interface SubtaskRowProps {
  subtask: SubTask;
  members: WorkspaceMember[];
  currentMemberId?: string;
  onClaim: () => void;
  onComplete: () => void;
}

function SubtaskRow({
  subtask,
  members,
  currentMemberId,
  onClaim,
  onComplete,
}: SubtaskRowProps) {
  const owner = members.find((m) => m.id === subtask.ownerId);
  const isDone = subtask.status === "DONE";
  const isMine = subtask.ownerId && subtask.ownerId === currentMemberId;

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors",
        isDone
          ? "bg-accent-subtle/40"
          : subtask.ownerId
            ? "bg-bg-subtle"
            : "bg-bg-subtle/60 border border-dashed border-border"
      )}
    >
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-[11px] font-semibold text-text-1 truncate",
            isDone && "line-through text-text-3"
          )}
        >
          {subtask.title}
        </p>
        <div className="mt-0.5">
          {owner ? (
            <MemberBadge
              name={owner.name}
              variant={owner.id === currentMemberId ? "self" : "default"}
            />
          ) : (
            <MemberBadge name={undefined} variant="unassigned" />
          )}
        </div>
      </div>

      {!isDone && (
        <>
          {subtask.ownerId ? (
            isMine && (
              <button
                onClick={onComplete}
                aria-label="Marcar como completada"
                className="flex-shrink-0 w-8 h-8 rounded-md bg-accent-subtle text-accent hover:bg-accent hover:text-on-primary transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <Check className="w-4 h-4" />
              </button>
            )
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={onClaim}
              disabled={!currentMemberId}
              className="text-[10px] flex-shrink-0"
            >
              <UserPlus className="w-3 h-3" />
              Reclamar
            </Button>
          )}
        </>
      )}
    </div>
  );
}

// ── Deadline badge ────────────────────────────────────────────────

function DeadlineBadge({ iso }: { iso: string }) {
  const days = daysUntil(iso);
  const label =
    days === 0
      ? "Hoy"
      : days < 0
        ? `Hace ${Math.abs(days)}d`
        : days === 1
          ? "Mañana"
          : `En ${days}d`;
  const tone =
    days < 0
      ? "text-text-3"
      : days <= 1
        ? "text-warning"
        : "text-text-2";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold",
        tone
      )}
    >
      <Calendar className="w-3 h-3" />
      {label}
    </span>
  );
}
