import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import AreaList from "./targets/AreaList";
import TaskList from "./targets/TaskList";
import { Area, Task } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const TargetsPage = () => {
  const [areas, setAreas] = React.useState<Area[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [selectedAreaId, setSelectedAreaId] = React.useState<string | null>(null);
  const [loadingAreas, setLoadingAreas] = React.useState(true);
  const [loadingTasks, setLoadingTasks] = React.useState(true);

  // Load areas from Supabase
  React.useEffect(() => {
    const fetchAreas = async () => {
      setLoadingAreas(true);
      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching areas:", error);
        toast.error("Failed to load areas.");
      } else {
        setAreas(data as Area[]);
        if (data.length > 0 && selectedAreaId === null) {
          setSelectedAreaId(data[0].id);
        }
      }
      setLoadingAreas(false);
    };

    fetchAreas();
  }, []);

  // Load tasks from Supabase
  React.useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks.");
      } else {
        setTasks(data as Task[]);
      }
      setLoadingTasks(false);
    };

    fetchTasks();
  }, []);

  const handleAddArea = async (name: string) => {
    const { data, error } = await supabase
      .from("areas")
      .insert({ name })
      .select();

    if (error) {
      console.error("Error adding area:", error);
      toast.error("Failed to add area.");
    } else if (data && data.length > 0) {
      const newArea: Area = data[0];
      setAreas((prevAreas) => {
        const updatedAreas = [...prevAreas, newArea];
        if (selectedAreaId === null) {
          setSelectedAreaId(newArea.id);
        }
        return updatedAreas;
      });
      toast.success(`Area "${name}" added!`);
    }
  };

  const handleAddTask = async (name: string, priority: number, parentId?: string) => {
    if (!selectedAreaId) {
      toast.error("Please select an area first.");
      return;
    }
    const { data, error } = await supabase
      .from("tasks")
      .insert({ area_id: selectedAreaId, name, priority, parent_id: parentId || null })
      .select();

    if (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task.");
    } else if (data && data.length > 0) {
      const newTask: Task = data[0];
      setTasks((prevTasks) => [...prevTasks, newTask]);
      toast.success(`Task "${name}" added to selected area!`);
    }
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const newCompletedStatus = !taskToUpdate.completed;
    const newCompletedAt = newCompletedStatus ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("tasks")
      .update({ completed: newCompletedStatus, completed_at: newCompletedAt })
      .eq("id", taskId);

    if (error) {
      console.error("Error updating task completion:", error);
      toast.error("Failed to update task status.");
    } else {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                completed: newCompletedStatus,
                completedAt: newCompletedAt || undefined,
              }
            : task,
        ),
      );
      toast.info(`Task "${taskToUpdate.name}" marked as ${newCompletedStatus ? "completed" : "pending"}!`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    } else {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted!");
    }
  };

  const handleEditTask = async (taskId: string, newName: string, newPriority: number) => {
    const { error } = await supabase
      .from("tasks")
      .update({ name: newName, priority: newPriority })
      .eq("id", taskId);

    if (error) {
      console.error("Error editing task:", error);
      toast.error("Failed to update task.");
    } else {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, name: newName, priority: newPriority } : task,
        ),
      );
      toast.success("Task updated!");
    }
  };

  const filteredTasks = selectedAreaId
    ? tasks.filter((task) => task.areaId === selectedAreaId)
    : [];

  return (
    <div className="flex h-full">
      <aside className="w-64 border-r bg-sidebar text-sidebar-foreground p-4 flex flex-col">
        {loadingAreas ? (
          <p className="text-muted-foreground">Loading areas...</p>
        ) : (
          <AreaList
            areas={areas}
            selectedAreaId={selectedAreaId}
            onSelectArea={setSelectedAreaId}
            onAddArea={handleAddArea}
          />
        )}
      </aside>
      <main className="flex-1 p-6">
        {loadingTasks ? (
          <p className="text-muted-foreground text-center mt-8">Loading tasks...</p>
        ) : selectedAreaId ? (
          <TaskList
            tasks={filteredTasks}
            onAddTask={handleAddTask}
            onToggleTaskCompletion={handleToggleTaskCompletion}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold mb-4">No Area Selected</h2>
            <p className="text-muted-foreground">Please add a new area or select an existing one from the sidebar to view and add tasks.</p>
          </div>
        )}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default TargetsPage;