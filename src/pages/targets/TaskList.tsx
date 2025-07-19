import React, { useState } from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Plus, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskListProps {
  tasks: Task[];
  onAddTask: (name: string, priority: number, parentId?: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEditTask: (id: string, newName: string, newPriority: number) => void;
  onDeleteTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onAddTask,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState(3);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskName, setEditedTaskName] = useState("");
  const [editedTaskPriority, setEditedTaskPriority] = useState(3);
  const [addingSubTaskFor, setAddingSubTaskFor] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const sortedTasks = [...tasks].sort((a, b) => {
    // Completed tasks go to the bottom, sorted by completion time
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    if (a.completed && b.completed) {
      return new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime();
    }
    // Incomplete tasks sorted by priority (descending)
    return b.priority - a.priority;
  });

  const topLevelTasks = sortedTasks.filter((task) => !task.parent_id);

  const getSubTasks = (parentId: string) => {
    return sortedTasks.filter((task) => task.parent_id === parentId);
  };

  const handleAddTask = (parentId?: string) => {
    if (newTaskName.trim()) {
      onAddTask(newTaskName.trim(), newTaskPriority, parentId);
      setNewTaskName("");
      setNewTaskPriority(3);
      setAddingSubTaskFor(null);
      if (parentId) {
        setExpandedTasks((prev) => new Set(prev).add(parentId));
      }
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTaskName(task.name);
    setEditedTaskPriority(task.priority);
  };

  const handleSaveEdit = () => {
    if (editingTaskId && editedTaskName.trim()) {
      onEditTask(editingTaskId, editedTaskName.trim(), editedTaskPriority);
      setEditingTaskId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  const handleAddSubTaskClick = (taskId: string) => {
    setAddingSubTaskFor(taskId);
    setNewTaskName(""); // Clear input for new subtask
    setNewTaskPriority(3);
    setExpandedTasks((prev) => new Set(prev).add(taskId)); // Expand parent when adding subtask
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const renderStarRating = (currentRating: number, setRating: (rating: number) => void) => (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4 cursor-pointer",
            star <= currentRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
          )}
          onClick={() => setRating(star)}
        />
      ))}
    </div>
  );

  const renderTaskItem = (task: Task, indentationLevel: number = 0) => {
    const isEditing = editingTaskId === task.id;
    const isExpanded = expandedTasks.has(task.id);
    const subTasks = getSubTasks(task.id);

    return (
      <div
        key={task.id}
        className={cn(
          "flex flex-col p-3 rounded-md shadow-sm border",
          task.completed ? "bg-muted text-muted-foreground line-through" : "bg-card text-card-foreground",
          `ml-${indentationLevel * 4}` // Tailwind's ml-4, ml-8, etc.
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => onToggleComplete(task.id, checked as boolean)}
              className="mr-3"
              disabled={isEditing}
            />
            {isEditing ? (
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  value={editedTaskName}
                  onChange={(e) => setEditedTaskName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                  className="flex-1"
                />
                {renderStarRating(editedTaskPriority, setEditedTaskPriority)}
              </div>
            ) : (
              <span className="flex-1 break-words mr-2">{task.name}</span>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            {!isEditing && (
              <>
                {renderStarRating(task.priority, () => {})} {/* Display only, not interactive */}
                <Button variant="ghost" size="icon" onClick={() => handleEditClick(task)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAddSubTaskClick(task.id)}
                  className="text-primary-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                {subTasks.length > 0 && (
                  <Button variant="ghost" size="icon" onClick={() => toggleExpand(task.id)}>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </>
            )}
            {isEditing && (
              <>
                <Button onClick={handleSaveEdit} size="sm">Save</Button>
                <Button variant="outline" onClick={handleCancelEdit} size="sm">Cancel</Button>
              </>
            )}
          </div>
        </div>
        {task.completed && task.completed_at && (
          <p className="text-xs text-right mt-1">
            Completed: {format(new Date(task.completed_at), "MMM dd, yyyy HH:mm")}
          </p>
        )}
        {addingSubTaskFor === task.id && (
          <div className="flex space-x-2 mt-2 ml-7">
            <Input
              placeholder="New Sub-task Name"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTask(task.id)}
              className="flex-1"
            />
            {renderStarRating(newTaskPriority, setNewTaskPriority)}
            <Button onClick={() => handleAddTask(task.id)}>Add</Button>
            <Button variant="outline" onClick={() => setAddingSubTaskFor(null)}>Cancel</Button>
          </div>
        )}
        {isExpanded && subTasks.length > 0 && (
          <div className="mt-2 space-y-2">
            {subTasks.map((subTask) => renderTaskItem(subTask, indentationLevel + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="New Task Name"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
          className="flex-1"
        />
        {renderStarRating(newTaskPriority, setNewTaskPriority)}
        <Button onClick={() => handleAddTask()}>Add Task</Button>
      </div>
      <div className="space-y-2">
        {topLevelTasks.length === 0 && (
          <p className="text-center text-muted-foreground">No tasks yet. Add one above!</p>
        )}
        {topLevelTasks.map((task) => renderTaskItem(task))}
      </div>
    </div>
  );
};

export default TaskList;