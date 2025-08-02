import React, { useEffect, useState } from "react";
import { loadTasks, updateTask, deleteTask, saveTask } from "@/lib/storage";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Star, Pencil, Trash, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

const RecentPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskName, setEditedTaskName] = useState("");
  const [editedTaskPriority, setEditedTaskPriority] = useState(3);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [addingSubTaskFor, setAddingSubTaskFor] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState(3);

  const fetchTasks = async () => {
    const loadedTasks = await loadTasks();
    if (loadedTasks) {
      const sortedTasks = loadedTasks.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setTasks(sortedTasks.filter(task => !task.completed));
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onToggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = await updateTask(taskId, {
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : undefined,
      });
      if (updatedTask) {
        fetchTasks();
        toast.success(`Task ${updatedTask.completed ? "marked as completed" : "marked as incomplete"}.`);
      }
    }
  };

  const onDeleteTask = async (taskId: string) => {
    const success = await deleteTask(taskId);
    if (success) {
      fetchTasks();
      toast.success("Task deleted.");
    }
  };

  const onEditTask = async (taskId: string, newName: string, newPriority: number) => {
    const updatedTask = await updateTask(taskId, { name: newName, priority: newPriority });
    if (updatedTask) {
      fetchTasks();
      setEditingTaskId(null);
      toast.success("Task updated.");
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTaskName(task.name);
    setEditedTaskPriority(task.priority);
  };

  const handleSaveEdit = (taskId: string) => {
    if (editedTaskName.trim()) {
      onEditTask(taskId, editedTaskName.trim(), editedTaskPriority);
      setEditingTaskId(null);
      setEditedTaskName("");
      setEditedTaskPriority(3);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditedTaskName("");
    setEditedTaskPriority(3);
  };

  const handleAddTask = async (parentId?: string) => {
    if (newTaskName.trim()) {
      const task = {
        name: newTaskName.trim(),
        priority: newTaskPriority,
        parent_id: parentId,
        area_id: tasks.find(t => t.id === parentId)?.area_id || ''
      };
      const savedTask = await saveTask(task);
      if (savedTask) {
        fetchTasks();
        setNewTaskName("");
        setNewTaskPriority(3);
        setAddingSubTaskFor(null);
        if (parentId) {
          setExpandedTasks(prev => new Set(prev).add(parentId));
        }
        toast.success("Sub-task added.");
      }
    }
  };

  const handleAddSubTaskClick = (parentId: string) => {
    setAddingSubTaskFor(parentId);
    setNewTaskName("");
    setNewTaskPriority(3);
    setExpandedTasks(prev => new Set(prev).add(parentId));
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

  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;

      if (a.completed && b.completed) {
        return new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime();
      }

      if (!a.completed && !b.completed) {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });
  };

  const renderTaskItem = (task: Task, level: number = 0) => {
    const subTasks = sortTasks(tasks.filter(t => t.parent_id === task.id));
    const isExpanded = expandedTasks.has(task.id);
    const hasSubTasks = subTasks.length > 0;

    return (
      <React.Fragment key={task.id}>
        <div
          className={cn(
            "flex flex-col p-3 border rounded-md bg-card text-card-foreground",
            task.completed && "opacity-60",
            level > 0 && `ml-${level * 6} border-l-2 border-gray-200 pl-3`,
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 flex-1">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => onToggleTaskCompletion(task.id)}
              />
              {editingTaskId === task.id ? (
                <div className="flex items-center flex-1 gap-2">
                  <Input
                    value={editedTaskName}
                    onChange={(e) => setEditedTaskName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSaveEdit(task.id)}
                    className="flex-1"
                  />
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-5 w-5 cursor-pointer",
                          star <= editedTaskPriority ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
                        )}
                        onClick={() => setEditedTaskPriority(star)}
                      />
                    ))}
                  </div>
                </div>
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
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  {hasSubTasks && (
                    <Button variant="ghost" size="icon" onClick={() => toggleExpand(task.id)}>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          {task.completed && task.completed_at && (
            <span className="text-sm text-muted-foreground mt-1 self-end">
              Completed: {format(new Date(task.completed_at), "MMM dd, yyyy HH:mm")}
            </span>
          )}
        </div>
        {addingSubTaskFor === task.id && (
          <div className={`flex items-center gap-2 mt-2 ml-${(level + 1) * 6}`}>
            <Input
              placeholder="New Sub-task Name"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTask(task.id)}
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
            <Button onClick={() => handleAddTask(task.id)} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setAddingSubTaskFor(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {isExpanded && hasSubTasks && (
          <div className="space-y-4 mt-4">
            {subTasks.map(subTask => renderTaskItem(subTask, level + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  const topLevelTasks = sortTasks(tasks.filter(task => !task.parent_id));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recent Tasks</h1>
      <div className="space-y-4">
        {topLevelTasks.length === 0 && tasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks yet.</p>
        ) : (
          topLevelTasks.map(task => renderTaskItem(task))
        )}
      </div>
    </div>
  );
};

export default RecentPage;
