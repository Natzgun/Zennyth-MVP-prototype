"use client";
import { useState, useCallback } from "react";

export function useTouchDnD(
  onDrop: (taskId: string, status: string) => void
) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectTask = useCallback((taskId: string) => {
    setSelectedTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  const dropOnStatus = useCallback(
    (status: string) => {
      if (selectedTaskId) {
        onDrop(selectedTaskId, status);
        setSelectedTaskId(null);
      }
    },
    [selectedTaskId, onDrop]
  );

  const clearSelection = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  return { selectedTaskId, selectTask, dropOnStatus, clearSelection };
}
