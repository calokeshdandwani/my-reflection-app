import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import TaskList from "./targets/TaskList";
import { Task } from "@/types";
import { loadTasks, updateTask, deleteTask, saveTask } from "@/lib/storage";
import { toast } from "sonner";
import { isToday } from "date-fns";
import { DropResult } from "react-beautiful-dnd";

const TodaysPlaygroundPage: React.FC = () => {
  const [tasks, setTasks] = React.useState<Task[]>([]);

  React.useEffect(() => {
    const fetchTasks = async () => {
      const storedTasks = await loadTasks();
      if (storedTasks) {
        const todaysTasks = storedTasks.filter(task => task.scheduled_date && isToday(new Date(task.scheduled_date)));
        setTasks(todaysTasks);
      }
    };
    fetchTasks();
  }, []);

  const handleToggleTaskCompletion = async (taskId: string) => {
    const taskToToggle = tasks.find(task => task.id === taskId);
    if (!taskToToggle) return;

    const newCompletedStatus = !taskToToggle.completed;
    const updatedTask = await updateTask(taskId, {
      completed: newCompletedStatus,
      completed_at: newCompletedStatus ? new Date().toISOString() : null,
    });

    if (updatedTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? updatedTask : task,
        ),
      );
      toast.info(`Task "${updatedTask.name}" marked as ${updatedTask.completed ? "completed" : "pending"}!`);
    } else {
      toast.error("Failed to update task completion status.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const success = await deleteTask(taskId);
    if (success) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted!");
    } else {
      toast.error("Failed to delete task.");
    }
  };

  const handleEditTask = async (taskId: string, newName: string, newPriority: number) => {
    const updatedTask = await updateTask(taskId, { name: newName, priority: newPriority });
    if (updatedTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? updatedTask : task,
        ),
      );
      toast.success("Task updated!");
    } else {
      toast.error("Failed to update task.");
    }
  };

  const handleAddFollowUpTask = async (originalTask: Task) => {
    const newTask: Omit<Task, "id" | "created_at" | "completed" | "completed_at"> = {
      area_id: originalTask.area_id,
      name: `${originalTask.name} - follow up`,
      priority: originalTask.priority,
    };
    const savedTask = await saveTask(newTask);
    if (savedTask) {
      const completedTask = await updateTask(savedTask.id, {
        completed: true,
        completed_at: new Date().toISOString(),
      });
      if (completedTask) {
        setTasks((prevTasks) => [...prevTasks, { ...completedTask, area_id: originalTask.area_id }]);
        toast.success(`Follow-up task for "${originalTask.name}" added!`);
      } else {
        toast.error("Failed to mark follow-up task as completed.");
      }
    } else {
      toast.error("Failed to add follow-up task.");
    }
  };

  const handleScheduleTask = async (taskId: string, date: Date) => {
    const updatedTask = await updateTask(taskId, { scheduled_date: date.toISOString() });
    if (updatedTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? updatedTask : task
        )
      );
      toast.success("Task scheduled!");
    } else {
      toast.error("Failed to schedule task.");
    }
  };

  // This is a placeholder for the onAddTask function.
  // In the context of "Today's Playground", we might not want to add new tasks directly,
  // but rather schedule them from the "Targets" page.
  // For now, we'll just log a message.
  const handleAddTask = (name: string, priority: number, parentId?: string) => {
    console.log("Adding tasks is not implemented on this page.", { name, priority, parentId });
    toast.info("New tasks should be added from the 'Targets' page.");
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newTasks = Array.from(tasks);
    const [removed] = newTasks.splice(source.index, 1);
    newTasks.splice(destination.index, 0, removed);

    setTasks(newTasks);
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Today's Playground</h1>
      <div className="flex-1 overflow-hidden">
        <TaskList
          tasks={tasks}
          onAddTask={handleAddTask}
          onToggleTaskCompletion={handleToggleTaskCompletion}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
          onAddFollowUpTask={handleAddFollowUpTask}
          onScheduleTask={handleScheduleTask}
          onDragEnd={onDragEnd}
        />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default TodaysPlaygroundPage;
