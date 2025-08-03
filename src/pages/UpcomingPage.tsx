import React from "react";
import TaskList from "./targets/TaskList";
import { Task } from "@/types";
import { loadTasks, updateTask, deleteTask } from "@/lib/storage";
import { toast } from "sonner";
import { format, isFuture, parseISO } from "date-fns";

const UpcomingPage: React.FC = () => {
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

  const upcomingTasks = tasks.filter(t => t.scheduled_for && isFuture(new Date(t.scheduled_for)) && !t.completed);
  const grouped: Record<string, Task[]> = {};
  upcomingTasks.forEach(task => {
    const date = task.scheduled_for!;
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(task);
  });
  Object.values(grouped).forEach(list => list.sort((a, b) => (a.schedule_order || 0) - (b.schedule_order || 0)));
  const sortedDates = Object.keys(grouped).sort((a, b) => parseISO(a).getTime() - parseISO(b).getTime());

  return (
    <div className="space-y-8">
      {sortedDates.map(date => (
        <div key={date} className="space-y-4">
          <h3 className="text-xl font-semibold">{format(new Date(date), "MMM dd, yyyy")}</h3>
          <TaskList
            tasks={grouped[date]}
            onToggleTaskCompletion={handleToggleTaskCompletion}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onScheduleTask={handleScheduleTask}
            disableAddTask
          />
        </div>
      ))}
      {sortedDates.length === 0 && (
        <p className="text-muted-foreground">No upcoming tasks scheduled.</p>
      )}
    </div>
  );
};

export default UpcomingPage;
