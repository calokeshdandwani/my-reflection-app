import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import Layout from "@/components/Layout";
import AreaList from "@/components/AreaList";
import TaskList from "@/components/TaskList";
import { Area, Task } from "@/types";
import { loadState, saveState } from "@/lib/storage";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

const Index = () => {
  const [areas, setAreas] = React.useState<Area[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [selectedAreaId, setSelectedAreaId] = React.useState<string | null>(null);

  // Load state from localStorage on initial render
  React.useEffect(() => {
    const storedAreas = loadState<Area[]>("areas");
    const storedTasks = loadState<Task[]>("tasks");
    if (storedAreas) {
      setAreas(storedAreas);
      if (storedAreas.length > 0) {
        setSelectedAreaId(storedAreas[0].id); // Select the first area by default
      }
    }
    if (storedTasks) {
      setTasks(storedTasks);
    }
  }, []);

  // Save state to localStorage whenever areas or tasks change
  React.useEffect(() => {
    saveState("areas", areas);
  }, [areas]);

  React.useEffect(() => {
    saveState("tasks", tasks);
  }, [tasks]);

  const handleAddArea = (name: string) => {
    const newArea: Area = {
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString(),
    };
    setAreas((prevAreas) => {
      const updatedAreas = [...prevAreas, newArea];
      if (selectedAreaId === null) {
        setSelectedAreaId(newArea.id); // Select the new area if none was selected
      }
      return updatedAreas;
    });
    toast.success(`Area "${name}" added!`);
  };

  const handleAddTask = (name: string, priority: number) => {
    if (!selectedAreaId) {
      toast.error("Please select an area first.");
      return;
    }
    const newTask: Task = {
      id: uuidv4(),
      areaId: selectedAreaId,
      name,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    toast.success(`Task "${name}" added to selected area!`);
  };

  const handleToggleTaskCompletion = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task,
      ),
    );
    const toggledTask = tasks.find(task => task.id === taskId);
    if (toggledTask) {
      toast.info(`Task "${toggledTask.name}" marked as ${toggledTask.completed ? "pending" : "completed"}!`);
    }
  };

  const filteredTasks = selectedAreaId
    ? tasks.filter((task) => task.areaId === selectedAreaId)
    : [];

  return (
    <Layout
      sidebar={
        <AreaList
          areas={areas}
          selectedAreaId={selectedAreaId}
          onSelectArea={setSelectedAreaId}
          onAddArea={handleAddArea}
        />
      }
    >
      {selectedAreaId ? (
        <TaskList
          tasks={filteredTasks}
          onAddTask={handleAddTask}
          onToggleTaskCompletion={handleToggleTaskCompletion}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-2xl font-bold mb-4">No Area Selected</h2>
          <p className="text-muted-foreground">Please add a new area or select an existing one from the sidebar to view and add tasks.</p>
        </div>
      )}
      <MadeWithDyad />
    </Layout>
  );
};

export default Index;