import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import TaskList from "./targets/TaskList";
import AreaList from "./targets/AreaList";
import { useTargets } from "@/contexts/TargetPageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TargetsPage = () => {
  const {
    areas,
    selectedAreaId,
    onSelectArea,
    onAddArea,
    onEditArea,
    onDeleteArea,
    filteredTasks,
    onAddTask,
    onToggleTaskCompletion,
    onDeleteTask,
    onEditTask,
  } = useTargets();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {selectedAreaId ? (
          <>
            <div className="flex items-center p-4 border-b">
              <Button variant="ghost" size="icon" onClick={() => onSelectArea(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold ml-4">Tasks</h2>
            </div>
            <div className="flex-1 p-6">
              <TaskList
                tasks={filteredTasks}
                onAddTask={onAddTask}
                onToggleTaskCompletion={onToggleTaskCompletion}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
              />
            </div>
          </>
        ) : (
          <div className="p-4">
            <AreaList
              areas={areas}
              selectedAreaId={selectedAreaId}
              onSelectArea={onSelectArea}
              onAddArea={onAddArea}
              onEditArea={onEditArea}
              onDeleteArea={onDeleteArea}
            />
          </div>
        )}
        <MadeWithDyad />
      </div>
    );
  }

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