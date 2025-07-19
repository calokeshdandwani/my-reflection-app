import React from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Star, Pencil, Trash, Check, X, ChevronDown, ChevronRight } from "lucide-react"; // Import new icons
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskListProps {
  tasks: Task[];
  onAddTask: (name: string, priority: number, parentId?: string) => void;
  onToggleTaskCompletion: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newName: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onAddTask,
  onToggleTaskCompletion,
  onDeleteTask,
  onEditTask,
}) => {
  const [newTaskName, setNewTaskName] = React.useState("");
  const [newTaskPriority, setNewTaskPriority] = React.useState(3);
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [editedTaskName, setEditedTaskName] = React.useState("");
  const [addingSubTaskFor, setAddingSubTaskFor] = React.useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = React.useState<Set<string>>(new Set()); // State for expanded parent tasks

  const handleAddTask = (parentId?: string) => {
    if (newTaskName.trim()) {
      onAddTask(newTaskName.trim(), newTaskPriority, parentId);
      setNewTaskName("");
      setNewTaskPriority(3);
      setAddingSubTaskFor(null);
      if (parentId) {
        setExpandedTasks(prev => new Set(prev).add(parentId)); // Expand parent if sub-task added
      }
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTaskName(task.name);
  };

  const handleSaveEdit = (taskId: string) => {
    if (editedTaskName.trim()) {
      onEditTask(taskId, editedTaskName.trim());
      setEditingTaskId(null);
      setEditedTaskName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditedTaskName("");
  };

  const handleAddSubTaskClick = (parentId: string) => {
    setAddingSubTaskFor(parentId);
    setNewTaskName("");
    setNewTaskPriority(3);
    setExpandedTasks(prev => new Set(prev).add(parentId)); // Ensure parent is expanded when adding sub-task
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Sort tasks: 5-star pending, then other pending by creation, then completed by completion date
  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;

      if (a.completed && b.completed) {
        return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
      }

      if (!a.completed && !b.completed) {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });
  };

  const renderTaskItem = (task: Task, level: number = 0) => {
    const subTasks = sortTasks(tasks.filter(t => t.parentId === task.id));
    const isExpanded = expandedTasks.has(task.id);
    const hasSubTasks = subTasks.length > 0;

    return (
      <React.Fragment key={task.id}>
        <div
          className={cn(
            "flex flex-col p-3 border rounded-md bg-card text-card-foreground",
            task.completed && "opacity-60",
            level > 0 && `ml-${level * 6} border-l-2 border-gray-200 pl-3`, // Indentation for sub-tasks
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 flex-1">
              {hasSubTasks && (
                <Button variant="ghost" size="icon" onClick={() => toggleExpand(task.id)} className="mr-1">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => onToggleTaskCompletion(task.id)}
              />
              {editingTaskId === task.id ? (
                <Input
                  value={editedTaskName}
                  onChange={(e) => setEditedTaskName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSaveEdit(task.id)}
                  className="flex-1"
                />
              ) : (
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    "text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    task.completed && "line-through text-muted-foreground",
                  )}
                >
                  {task.name}
                </label>
              )}
              {!task.completed && editingTaskId !== task.id && (
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
            <div className="flex items-center gap-1 ml-auto">
              {editingTaskId === task.id ? (
                <>
                  <Button variant="ghost" size="icon" onClick={() => handleSaveEdit(task.id)}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(task)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task.id)}>
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleAddSubTaskClick(task.id)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          {task.completed && task.completedAt && (
            <span className="text-sm text-muted-foreground mt-1 self-end">
              Completed: {format(new Date(task.completedAt), "MMM dd, yyyy HH:mm")}
            </span>
          )}
        </div>
        {isExpanded && hasSubTasks && (
          <div className="space-y-4 mt-4"> {/* Add margin-top for spacing between parent and first sub-task */}
            {subTasks.map(subTask => renderTaskItem(subTask, level + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  const topLevelTasks = sortTasks(tasks.filter(task => !task.parentId));

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6">Tasks</h2>
      <div className="flex items-center gap-2 mb-6">
        <Input
          placeholder={addingSubTaskFor ? "New Sub-task Name" : "New Task Name"}
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTask(addingSubTaskFor || undefined)}
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
        <Button onClick={() => handleAddTask(addingSubTaskFor || undefined)} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
        {addingSubTaskFor && (
          <Button variant="ghost" size="icon" onClick={() => setAddingSubTaskFor(null)}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {topLevelTasks.length === 0 && tasks.length === 0 ? ( // Check if no tasks at all
          <p className="text-muted-foreground">No tasks yet. Add one above!</p>
        ) : (
          topLevelTasks.map(task => renderTaskItem(task))
        )}
      </div>
    </div>
  );
};

export default TaskList;