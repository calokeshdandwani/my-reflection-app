import React, { createContext, useContext, useState, useEffect } from "react";
import { Area, Task } from "@/types";
import {
  loadAreas,
  saveArea,
  updateArea,
  deleteArea,
  loadTasks,
  saveTask,
  updateTask,
  deleteTask,
} from "@/lib/storage";
import { toast } from "sonner";

interface TargetPageContextType {
  areas: Area[];
  tasks: Task[];
  selectedAreaId: string | null;
  onSelectArea: (areaId: string) => void;
  onAddArea: (name: string) => void;
  onEditArea: (areaId: string, newName: string) => void;
  onDeleteArea: (areaId: string) => void;
  onAddTask: (name: string, priority: number, parentId?: string) => void;
  onToggleTaskCompletion: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newName: string, newPriority: number) => void;
  filteredTasks: Task[];
}

const TargetPageContext = createContext<TargetPageContextType | undefined>(undefined);

export const TargetPageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const storedAreas = await loadAreas();
      if (storedAreas) {
        setAreas(storedAreas);
        if (storedAreas.length > 0 && !selectedAreaId) {
          setSelectedAreaId(storedAreas[0].id);
        }
      }
      const storedTasks = await loadTasks();
      if (storedTasks) {
        setTasks(storedTasks);
      }
    };
    fetchInitialData();
  }, [selectedAreaId]);

  const onAddArea = async (name: string) => {
    const newArea = await saveArea({ name });
    if (newArea) {
      setAreas(prev => [...prev, newArea]);
      if (!selectedAreaId) {
        setSelectedAreaId(newArea.id);
      }
      toast.success(`Area "${name}" added!`);
    } else {
      toast.error("Failed to add area.");
    }
  };

  const onEditArea = async (areaId: string, newName: string) => {
    const updatedArea = await updateArea(areaId, { name: newName });
    if (updatedArea) {
      setAreas(prev => prev.map(area => (area.id === areaId ? updatedArea : area)));
      toast.success("Area updated!");
    } else {
      toast.error("Failed to update area.");
    }
  };

  const onDeleteArea = async (areaId: string) => {
    const success = await deleteArea(areaId);
    if (success) {
      const newAreas = areas.filter(area => area.id !== areaId);
      setAreas(newAreas);
      if (selectedAreaId === areaId) {
        setSelectedAreaId(newAreas.length > 0 ? newAreas[0].id : null);
      }
      toast.success("Area deleted!");
    } else {
      toast.error("Failed to delete area.");
    }
  };

  const onAddTask = async (name: string, priority: number, parentId?: string) => {
    if (!selectedAreaId) {
      toast.error("Please select an area first.");
      return;
    }
    const newTask = await saveTask({ area_id: selectedAreaId, name, priority, parent_id: parentId });
    if (newTask) {
      setTasks(prev => [...prev, newTask]);
      toast.success(`Task "${name}" added!`);
    } else {
      toast.error("Failed to add task.");
    }
  };

  const onToggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newCompletedStatus = !task.completed;
    const updatedTask = await updateTask(taskId, {
      completed: newCompletedStatus,
      completed_at: newCompletedStatus ? new Date().toISOString() : null,
    });
    if (updatedTask) {
      setTasks(prev => prev.map(t => (t.id === taskId ? updatedTask : t)));
      toast.info(`Task "${updatedTask.name}" marked as ${updatedTask.completed ? "completed" : "pending"}!`);
    } else {
      toast.error("Failed to update task.");
    }
  };

  const onDeleteTask = async (taskId: string) => {
    const success = await deleteTask(taskId);
    if (success) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success("Task deleted!");
    } else {
      toast.error("Failed to delete task.");
    }
  };

  const onEditTask = async (taskId: string, newName: string, newPriority: number) => {
    const updatedTask = await updateTask(taskId, { name: newName, priority: newPriority });
    if (updatedTask) {
      setTasks(prev => prev.map(t => (t.id === taskId ? updatedTask : t)));
      toast.success("Task updated!");
    } else {
      toast.error("Failed to update task.");
    }
  };

  const filteredTasks = tasks.filter(task => task.area_id === selectedAreaId);

  const value = {
    areas,
    tasks,
    selectedAreaId,
    onSelectArea: setSelectedAreaId,
    onAddArea,
    onEditArea,
    onDeleteArea,
    onAddTask,
    onToggleTaskCompletion,
    onDeleteTask,
    onEditTask,
    filteredTasks,
  };

  return <TargetPageContext.Provider value={value}>{children}</TargetPageContext.Provider>;
};

export const useTargets = () => {
  const context = useContext(TargetPageContext);
  if (context === undefined) {
    throw new Error("useTargets must be used within a TargetPageProvider");
  }
  return context;
};
