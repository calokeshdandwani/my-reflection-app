import React from "react";
import TaskList from "./targets/TaskList";
import { Task } from "@/types";
import { loadTasks, updateTask, deleteTask } from "@/lib/storage";
import { toast } from "sonner";
import { format, isToday } from "date-fns";

const TodaysPlaygroundPage: React.FC = () => {
  const [tasks, setTasks] = React.useState<Task[]>([]);

  React.useEffect(() => {
    const fetchTasks = async () => {
      const storedTasks = await loadTasks();
      if (storedTasks) setTasks(storedTasks);
    };
    fetchTasks();
  }, []);

  const handleToggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newCompleted = !task.completed;
    const updated = await updateTask(taskId, {
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
    });
    if (updated) {
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const success = await deleteTask(taskId);
    if (success) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success("Task deleted!");
    } else {
      toast.error("Failed to delete task.");
    }
  };

  const handleEditTask = async (taskId: string, newName: string, newPriority: number) => {
    const updated = await updateTask(taskId, { name: newName, priority: newPriority });
    if (updated) {
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      toast.success("Task updated!");
    } else {
      toast.error("Failed to update task.");
    }
  };

  const handleScheduleTask = async (taskId: string, date: string) => {
    const tasksForDate = tasks.filter(t => t.scheduled_for === date);
    const maxOrder = tasksForDate.reduce((m, t) => Math.max(m, t.schedule_order || 0), 0);
    const updated = await updateTask(taskId, { scheduled_for: date, schedule_order: maxOrder + 1 });
    if (updated) {
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      toast.success(`Task scheduled for ${format(new Date(date), "MMM dd, yyyy")}`);
    } else {
      toast.error("Failed to schedule task.");
    }
  };

  const handleReorderTasks = async (sourceId: string, targetId: string) => {
    setTasks(prev => {
      const source = prev.find(t => t.id === sourceId);
      const target = prev.find(t => t.id === targetId);
      if (!source || !target || source.scheduled_for !== target.scheduled_for) return prev;
      const date = source.scheduled_for!;
      const tasksForDate = prev
        .filter(t => t.scheduled_for === date)
        .sort((a, b) => (a.schedule_order || 0) - (b.schedule_order || 0));
      const fromIndex = tasksForDate.findIndex(t => t.id === sourceId);
      const toIndex = tasksForDate.findIndex(t => t.id === targetId);
      const moved = [...tasksForDate];
      const [item] = moved.splice(fromIndex, 1);
      moved.splice(toIndex, 0, item);
      moved.forEach((t, idx) => {
        t.schedule_order = idx + 1;
        updateTask(t.id, { schedule_order: t.schedule_order });
      });
      return prev.map(t => {
        const found = moved.find(m => m.id === t.id);
        return found ? { ...t, schedule_order: found.schedule_order } : t;
      });
    });
  };

  const todayTasks = tasks
    .filter(t => t.scheduled_for && isToday(new Date(t.scheduled_for)) && !t.completed)
    .sort((a, b) => (a.schedule_order || 0) - (b.schedule_order || 0));

  return (
    <TaskList
      tasks={todayTasks}
      onToggleTaskCompletion={handleToggleTaskCompletion}
      onDeleteTask={handleDeleteTask}
      onEditTask={handleEditTask}
      onScheduleTask={handleScheduleTask}
      enableDrag
      onReorderTasks={handleReorderTasks}
      disableAddTask
    />
  );
};

export default TodaysPlaygroundPage;
