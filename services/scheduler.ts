import { Task, CalendarEvent, TaskStatus } from '../types';

// Weighted Shortest Job First (Adapted)
// Priority = (Grade Impact + Urgency + Risk) / Time Required
export const calculateWSJFPriority = (
  gradeImpact: number,
  urgency: number,
  risk: number,
  timeRequired: number
): number => {
  if (timeRequired <= 0) return 0;
  // Weighting urgency slightly higher as it is time-sensitive
  const score = (gradeImpact + (urgency * 1.5) + risk) / timeRequired;
  return parseFloat(score.toFixed(2));
};

export const generateSchedule = (
  tasks: Task[],
  fixedEvents: CalendarEvent[],
  dayStartHour: number = 8,
  dayEndHour: number = 22
): { scheduledTasks: Task[]; studyBlocks: CalendarEvent[] } => {
  // 1. Sort tasks by priority (Highest first)
  const pendingTasks = tasks
    .filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.OVERDUE)
    .sort((a, b) => b.calculatedPriority - a.calculatedPriority);

  // 2. Create a timeline availability map for Today
  // For simplicity in this demo, we assume scheduling for "Today"
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const studyBlocks: CalendarEvent[] = [];
  const scheduledTasks: Task[] = [];
  
  // Create slots (30 min chunks)
  // In a real app, this would be a sophisticated interval tree
  let currentPointer = new Date(today);
  currentPointer.setHours(dayStartHour, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(dayEndHour, 0, 0, 0);

  // Simple greedy algorithm
  for (const task of pendingTasks) {
    const durationMs = task.metrics.timeRequired * 60 * 60 * 1000;
    
    // Find next available slot
    let slotFound = false;
    let searchPointer = new Date(currentPointer); // Start search from where we left off or beginning? 
    // Reset search pointer to start of day to fill gaps if we want "best fit", 
    // but for simplicity, let's just find the next open slot after current hard events.
    searchPointer = new Date(today);
    searchPointer.setHours(dayStartHour, 0, 0, 0);

    while (searchPointer.getTime() + durationMs <= endOfDay.getTime()) {
      const potentialEnd = new Date(searchPointer.getTime() + durationMs);
      
      // Check collision with fixed events
      const hasCollision = fixedEvents.some(evt => {
        return (
          (searchPointer >= evt.start && searchPointer < evt.end) || // Start is inside event
          (potentialEnd > evt.start && potentialEnd <= evt.end) || // End is inside event
          (searchPointer <= evt.start && potentialEnd >= evt.end)    // Envelops event
        );
      });
      
      // Check collision with already scheduled study blocks
      const hasBlockCollision = studyBlocks.some(evt => {
        return (
           (searchPointer >= evt.start && searchPointer < evt.end) ||
           (potentialEnd > evt.start && potentialEnd <= evt.end) ||
           (searchPointer <= evt.start && potentialEnd >= evt.end)
        );
      });

      if (!hasCollision && !hasBlockCollision) {
        // Found a slot!
        const newBlock: CalendarEvent = {
          id: `block-${task.id}`,
          title: `Focus: ${task.title}`,
          start: new Date(searchPointer),
          end: potentialEnd,
          isFixed: false,
          type: 'STUDY_BLOCK'
        };
        
        studyBlocks.push(newBlock);
        scheduledTasks.push({
          ...task,
          scheduledStart: new Date(searchPointer),
          scheduledEnd: potentialEnd
        });
        
        slotFound = true;
        break; 
      }

      // Move pointer by 30 mins
      searchPointer.setMinutes(searchPointer.getMinutes() + 30);
    }
  }

  return { scheduledTasks, studyBlocks };
};
