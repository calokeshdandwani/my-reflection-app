import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import TaskList from "./targets/TaskList";
import { useTargets } from "@/contexts/TargetPageContext";

const TargetsPage = () => {
  const {
    selectedAreaId,
    filteredTasks,
    onAddTask,
    onToggleTaskCompletion,
    onDeleteTask,
    onEditTask,
  } = useTargets();

  return (
    <div className="flex h-full">
      <main className="flex-1 p-6">
        {selectedAreaId ? (
          <TaskList
            tasks={filteredTasks}
            onAddTask={onAddTask}
            onToggleTaskCompletion={onToggleTaskCompletion}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
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