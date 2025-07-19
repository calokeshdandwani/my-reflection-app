import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import AreaList from "@/pages/targets/AreaList";
import TaskList from "@/pages/targets/TaskList";
import { Area, Task } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const TargetsPage: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingAreas, setLoadingAreas] = useState<boolean>(true);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  const [errorAreas, setErrorAreas] = useState<string | null>(null);
  const [errorTasks, setErrorTasks] = useState<string | null>(null);

  // Fetch Areas
  useEffect(() => {
    const fetchAreas = async () => {
      setLoadingAreas(true);
      setErrorAreas(null);
      try {
        const { data, error } = await supabase.from("areas").select("*").order("created_at", { ascending: true });
        if (error) throw error;
        setAreas(data as Area[]);
        if (data.length > 0 && !selectedAreaId) {
          setSelectedAreaId(data[0].id); // Select the first area by default
        }
      } catch (err: any) {
        console.error("Error fetching areas:", err.message);
        setErrorAreas("Failed to load areas.");
        toast.error("Failed to load areas.");
      } finally {
        setLoadingAreas(false);
      }
    };
    fetchAreas();
  }, []);

  // Fetch Tasks for selected area
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedAreaId) {
        setTasks([]);
        return;
      }
      setLoadingTasks(true);
      setErrorTasks(null);
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("area_id", selectedAreaId)
          .order("created_at", { ascending: true }); // Order by creation to maintain subtask order
        if (error) throw error;
        setTasks(data as Task[]);
      } catch (err: any) {
        console.error("Error fetching tasks:", err.message);
        setErrorTasks("Failed to load tasks for this area.");
        toast.error("Failed to load tasks.");
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [selectedAreaId]);

  const handleAddArea = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from("areas")
        .insert([{ name }])
        .select();
      if (error) throw error;
      const newArea = data[0] as Area;
      setAreas((prev) => [...prev, newArea]);
      setSelectedAreaId(newArea.id); // Select the newly added area
      toast.success(`Area "${name}" added!`);
    } catch (err: any) {
      console.error("Error adding area:", err.message);
      toast.error("Failed to add area.");
    }
  };

  const handleAddTask = async (name: string, priority: number, parentId?: string) => {
    if (!selectedAreaId) {
      toast.error("Please select an area first.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ area_id: selectedAreaId, name, priority, parent_id: parentId || null }])
        .select();
      if (error) throw error;
      setTasks((prev) => [...prev, data[0] as Task]);
      toast.success("Task added!");
    } catch (err: any) {
      console.error("Error adding task:", err.message);
      toast.error("Failed to add task.");
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const completed_at = completed ? new Date().toISOString() : null;
      const { error } = await supabase
        .from("tasks")
        .update({ completed, completed_at })
        .eq("id", id);
      if (error) throw error;
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed, completed_at } : task
        )
      );
      toast.success(`Task ${completed ? "completed" : "reopened"}!`);
    } catch (err: any) {
      console.error("Error toggling task completion:", err.message);
      toast.error("Failed to update task status.");
    }
  };

  const handleEditTask = async (id: string, newName: string, newPriority: number) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ name: newName, priority: newPriority })
        .eq("id", id);
      if (error) throw error;
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, name: newName, priority: newPriority } : task
        )
      );
      toast.success("Task updated!");
    } catch (err: any) {
      console.error("Error editing task:", err.message);
      toast.error("Failed to edit task.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      setTasks((prev) => prev.filter((task) => task.id !== id && task.parent_id !== id)); // Also remove subtasks
      toast.success("Task deleted!");
    } catch (err: any) {
      console.error("Error deleting task:", err.message);
      toast.error("Failed to delete task.");
    }
  };

  return (
    <Layout>
      <div className="flex h-full">
        <div className="w-64 border-r bg-sidebar text-sidebar-foreground p-4">
          {loadingAreas && <p className="text-muted-foreground">Loading areas...</p>}
          {errorAreas && <p className="text-destructive">{errorAreas}</p>}
          {!loadingAreas && !errorAreas && (
            <AreaList
              areas={areas}
              selectedAreaId={selectedAreaId}
              onSelectArea={setSelectedAreaId}
              onAddArea={handleAddArea}
            />
          )}
        </div>
        <div className="flex-1 p-6">
          {selectedAreaId ? (
            <>
              <h1 className="text-3xl font-bold mb-6">
                Tasks for{" "}
                {areas.find((area) => area.id === selectedAreaId)?.name || "Selected Area"}
              </h1>
              {loadingTasks && <p className="text-muted-foreground">Loading tasks...</p>}
              {errorTasks && <p className="text-destructive">{errorTasks}</p>}
              {!loadingTasks && !errorTasks && (
                <TaskList
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onToggleComplete={handleToggleComplete}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl text-muted-foreground">
                Please select an area from the sidebar or add a new one to manage tasks.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TargetsPage;