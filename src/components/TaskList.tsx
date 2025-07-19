import React from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskListProps {
  tasks: Task[];
  onAddTask: (name: string, priority: number) => void;
  onToggleTaskCompletion: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onAddTask,
  onToggleTaskCompletion,
}) => {
  const [newTaskName, setNewTaskName] = React.useState("");
  const [newTaskPriority, setNewTaskPriority] = React.useState(3); // Default priority

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      onAddTask(newTaskName.trim(), newTaskPriority);
      setNewTaskName("");
      setNewTaskPriority(3); // Reset to default
    }
  };

  // Sort tasks: 5-star pending, then other pending by creation, then completed by completion date
  const sortedTasks = [...tasks].sort((a, b) => {
    // Completed tasks go to the bottom
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;

    // If both are completed, sort by completedAt (newest first)
    if (a.completed && b.completed) {
      return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
    }

    // If both are pending, sort by priority (descending), then by creation date (oldest first)
    if (!a.completed && !b.completed) {
      if (b.priority !== a.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Oldest first
    }

    return 0; // Should not be reached
  });

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6">Tasks</h2>
      <div className="flex items-center gap-2 mb-6">
        <Input
          placeholder="New Task Name"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
          className="flex-1"
        />
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-5 w-5 cursor-pointer",
                star <= newTaskPriority ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
              )}
              onClick={() => setNewTaskPriority(star)}
            />
          ))}
        </div>
        <Button onClick={handleAddTask} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks yet. Add one above!</p>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center justify-between p-3 border rounded-md bg-card text-card-foreground",
                task.completed && "opacity-60",
              )}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => onToggleTaskCompletion(task.id)}
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    "text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    task.completed && "line-through text-muted-foreground",
                  )}
                >
                  {task.name}
                </label>
                {!task.completed && (
                  <div className="flex items-center ml-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= task.priority ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
              {task.completed && task.completedAt && (
                <span className="text-sm text-muted-foreground">
                  Completed: {format(new Date(task.completedAt), "MMM dd, yyyy HH:mm")}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;