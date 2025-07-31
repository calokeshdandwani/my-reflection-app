import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import AreaList from "./targets/AreaList";
import TaskList from "./targets/TaskList";
import { Area, Task } from "@/types";
import { loadAreas, saveArea, loadTasks, saveTask, updateTask, deleteTask, updateArea, deleteArea, addTaskToDayPlanner } from "@/lib/storage"; // Updated imports
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const TargetsPage = () => {
  const [areas, setAreas] = React.useState<Area[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [selectedAreaId, setSelectedAreaId] = React.useState<string | null>(null);
  const [showAreaList, setShowAreaList] = React.useState(false);
  const isMobile = useIsMobile();

  // Load state from Supabase on initial render
  React.useEffect(() => {
    const fetchInitialData = async () => {
      const storedAreas = await loadAreas();
      if (storedAreas) {
        setAreas(storedAreas);
        if (storedAreas.length > 0) {
          setSelectedAreaId(storedAreas[0].id);
        }
      }
      const storedTasks = await loadTasks();
      if (storedTasks) {
        setTasks(storedTasks);
      }
    };
    fetchInitialData();
  }, []);

  const handleAddArea = async (name: string) => {
    const newArea: Omit<Area, "id" | "created_at"> = { // Use created_at as per Supabase schema
      name,
    };
    const savedArea = await saveArea(newArea);
    if (savedArea) {
      setAreas((prevAreas) => {
        const updatedAreas = [...prevAreas, savedArea];
        if (selectedAreaId === null) {
          setSelectedAreaId(savedArea.id);
        }
        return updatedAreas;
      });
      toast.success(`Area "${name}" added!`);
    } else {
      toast.error("Failed to add area.");
    }
  };

  const handleFollowUp = async (taskId: string) => {
    const originalTask = tasks.find(task => task.id === taskId);
    if (!originalTask) return;

    const newFollowUpTask: Omit<Task, "id" | "created_at" | "completed" | "completed_at"> & { completed: boolean; completed_at: string | null } = {
      area_id: originalTask.area_id,
      name: `${originalTask.name} (Follow-up)`,
      priority: originalTask.priority,
      parent_id: originalTask.parent_id,
      completed: true,
      completed_at: new Date().toISOString(),
    };

    const savedTask = await saveTask(newFollowUpTask);
    if (savedTask) {
      setTasks((prevTasks) => [...prevTasks, savedTask]);
      toast.success(`Follow-up task for "${originalTask.name}" created!`);
    } else {
      toast.error("Failed to create follow-up task.");
    }
  };

  const handleAddTask = async (name: string, priority: number, parentId?: string) => {
    if (!selectedAreaId) {
      toast.error("Please select an area first.");
      return;
    }
    const newTask: Omit<Task, "id" | "created_at" | "completed" | "completed_at"> = { // Use created_at, completed_at
      area_id: selectedAreaId, // Use area_id
      name,
      priority,
      parent_id: parentId, // Use parent_id
    };
    const savedTask = await saveTask(newTask);
    if (savedTask) {
      setTasks((prevTasks) => [...prevTasks, savedTask]);
      toast.success(`Task "${name}" added to selected area!`);
    } else {
      toast.error("Failed to add task.");
    }
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    const taskToToggle = tasks.find(task => task.id === taskId);
    if (!taskToToggle) return;

    const newCompletedStatus = !taskToToggle.completed;
    const updatedTask = await updateTask(taskId, {
      completed: newCompletedStatus,
      completed_at: newCompletedStatus ? new Date().toISOString() : null, // Use completed_at
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

  const handleEditArea = async (areaId: string, newName: string) => {
    const updatedArea = await updateArea(areaId, { name: newName });
    if (updatedArea) {
      setAreas((prevAreas) =>
        prevAreas.map((area) =>
          area.id === areaId ? updatedArea : area,
        ),
      );
      toast.success("Area updated!");
    } else {
      toast.error("Failed to update area.");
    }
  };

  const handleDeleteArea = async (areaId: string) => {
    const success = await deleteArea(areaId);
    if (success) {
      setAreas((prevAreas) => prevAreas.filter((area) => area.id !== areaId));
      if (selectedAreaId === areaId) {
        setSelectedAreaId(areas.length > 1 ? areas[0].id : null);
      }
      toast.success("Area deleted!");
    } else {
      toast.error("Failed to delete area.");
    }
  };

  const filteredTasks = selectedAreaId
    ? tasks.filter((task) => task.area_id === selectedAreaId) // Use area_id
    : [];

  const pendingTaskCounts = React.useMemo(() => {
    return areas.reduce((acc, area) => {
      const count = tasks.filter(task => task.area_id === area.id && !task.completed).length;
      acc[area.id] = count;
      return acc;
    }, {} as Record<string, number>);
  }, [areas, tasks]);

  const totalPendingTasks = React.useMemo(() => {
    return Object.values(pendingTaskCounts).reduce((acc, count) => acc + count, 0);
  }, [pendingTaskCounts]);

  const handleAreaSelect = (areaId: string) => {
    setSelectedAreaId(areaId);
    setShowAreaList(false);
  };

  if (isMobile) {
    return (
      <Sheet open={showAreaList} onOpenChange={setShowAreaList}>
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <SheetTrigger asChild>
              <Button variant="outline">Show Areas</Button>
            </SheetTrigger>
          </header>
          <main className="flex-1 p-6">
            {selectedAreaId ? (
              <TaskList
                tasks={filteredTasks}
                onAddTask={handleAddTask}
                onToggleTaskCompletion={handleToggleTaskCompletion}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                onFollowUp={handleFollowUp}
                onAddToDayPlanner={handleAddToDayPlanner}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-bold mb-4">No Area Selected</h2>
                <p className="text-muted-foreground">Please select an area to view and add tasks.</p>
              </div>
            )}
          </main>
          <SheetContent side="left" className="w-80 bg-sidebar text-sidebar-foreground p-4">
            <AreaList
              areas={areas}
              selectedAreaId={selectedAreaId}
              onSelectArea={handleAreaSelect}
              onAddArea={handleAddArea}
              onEditArea={handleEditArea}
              onDeleteArea={handleDeleteArea}
              pendingTaskCounts={pendingTaskCounts}
              totalPendingTasks={totalPendingTasks}
            />
          </SheetContent>
          <MadeWithDyad />
        </div>
      </Sheet>
    );
  }

  return (
    <div className="flex h-full">
      <aside className="w-80 border-r bg-sidebar text-sidebar-foreground p-4 flex flex-col">
        <AreaList
          areas={areas}
          selectedAreaId={selectedAreaId}
          onSelectArea={setSelectedAreaId}
          onAddArea={handleAddArea}
          onEditArea={handleEditArea}
          onDeleteArea={handleDeleteArea}
          pendingTaskCounts={pendingTaskCounts}
          totalPendingTasks={totalPendingTasks}
        />
      </aside>
      <main className="flex-1 p-6">
        {selectedAreaId ? (
          <TaskList
            tasks={filteredTasks}
            onAddTask={handleAddTask}
            onToggleTaskCompletion={handleToggleTaskCompletion}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onFollowUp={handleFollowUp}
            onAddToDayPlanner={handleAddToDayPlanner}
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