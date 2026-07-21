import { Tag, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  id: string;
  title: string;
  borderClass?: string;
  subject?: string;
  timeString?: string;
  timeRequired?: number;
  priority?: string | number;
  isCompleted?: boolean;
  isSelected?: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export function KanbanCard({
  id,
  title,
  borderClass,
  subject,
  timeString,
  timeRequired,
  priority,
  isCompleted,
  isSelected,
  onDragStart,
  onDragEnd,
}: KanbanCardProps) {
  return (
    <div
      draggable
      data-task-id={id}
      onDragStart={(e) => onDragStart(e, id)}
      onDragEnd={onDragEnd}
      className={cn(
        "bg-surface p-4 rounded-lg border-l-4 border-y border-r border-y-border border-r-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group",
        isSelected && "ring-2 ring-primary ring-offset-2",
        borderClass
      )}
    >
      {subject && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
              {subject}
            </span>
          </div>
          {timeString && (
            <span className="text-[10px] font-bold text-text-3 bg-bg-subtle px-1.5 py-0.5 rounded">
              {timeString}
            </span>
          )}
        </div>
      )}

      <h4
        className={cn(
          "text-sm font-semibold text-text-1 mb-3 leading-snug group-hover:text-primary transition-colors",
          isCompleted && "line-through text-text-3"
        )}
      >
        {title}
      </h4>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-text-3">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">{timeRequired}h est.</span>
        </div>
        <div className="text-[10px] font-bold text-text-2 bg-bg-subtle px-2 py-1 rounded-md">
          PRI: {priority}
        </div>
      </div>
    </div>
  );
}
