import React from "react";
import { Task } from "@/types";
import { loadTasks } from "@/lib/storage";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MadeWithDyad } from "@/components/made-with-dyad";

const RecentPage: React.FC = () => {
  const [pendingTasks, setPendingTasks] = React.useState<Task[]>([]);

  React.useEffect(() => {
    const fetchTasks = async () => {
      const allTasks = await loadTasks();
      if (allTasks) {
        const pending = allTasks
          .filter(task => !task.completed)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setPendingTasks(pending);
      }
    };
    fetchTasks();
  }, []);

  const renderTaskItem = (task: Task) => {
    return (
      <div
        key={task.id}
        className="flex flex-col p-3 border rounded-md bg-card text-card-foreground"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              disabled // Read-only
            />
            <label
              htmlFor={`task-${task.id}`}
              className="text-lg font-medium leading-none"
            >
              {task.name}
            </label>
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
          </div>
        </div>
        <span className="text-sm text-muted-foreground mt-1 self-end">
          Created: {format(new Date(task.created_at), "MMM dd, yyyy HH:mm")}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Recent Pending Tasks</h1>
      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {pendingTasks.length === 0 ? (
            <p className="text-muted-foreground text-center mt-8">No pending tasks.</p>
          ) : (
            pendingTasks.map(task => renderTaskItem(task))
          )}
        </div>
      </ScrollArea>
      <MadeWithDyad />
    </div>
  );
};

export default RecentPage;
