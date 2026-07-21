import { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  title: string;
  icon: ComponentType<{ className?: string }>;
  count: number;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  children: ReactNode;
  className?: string;
  bgClass?: string;
  titleClassName?: string;
  countClassName?: string;
  emptyState?: ReactNode;
  status?: string;
  isDropReady?: boolean;
}

export function KanbanColumn({
  title,
  icon: Icon,
  count,
  onDragOver,
  onDrop,
  children,
  className,
  bgClass,
  titleClassName,
  countClassName,
  emptyState,
  status,
  isDropReady,
}: KanbanColumnProps) {
  return (
    <div
      data-column-status={status}
      className={cn(
        "flex flex-col rounded-xl p-4 min-h-[400px] border transition-colors",
        bgClass ?? "bg-bg-subtle/30 border-border/50 hover:bg-bg-subtle/50",
        isDropReady && "ring-2 ring-primary/40 bg-primary/5",
        className
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h3
          className={cn(
            "text-xs font-bold flex items-center gap-2 uppercase tracking-wider",
            titleClassName ?? "text-text-2"
          )}
        >
          <Icon className="w-4 h-4" />
          {title}
        </h3>
        <span
          className={cn(
            "text-[10px] px-2 py-1 rounded-full font-bold shadow-sm",
            countClassName ?? "bg-surface text-text-2"
          )}
        >
          {count}
        </span>
      </div>

      {count === 0 && emptyState}

      <div className="flex flex-col gap-3 flex-1">{children}</div>
    </div>
  );
}
