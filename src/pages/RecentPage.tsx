import React, { useEffect, useState } from "react";
import { loadTasks, updateTask } from "@/lib/storage";
import { Task } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const RecentPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const loadedTasks = await loadTasks();
      if (loadedTasks) {
        const sortedTasks = loadedTasks.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTasks(sortedTasks.filter(task => !task.completed));
      }
    };

    fetchTasks();
  }, []);

  const handleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = await updateTask(taskId, {
        completed: true,
        completed_at: new Date().toISOString(),
      });
      if (updatedTask) {
        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
        toast.success("Task marked as completed.");
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recent Tasks</h1>
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center justify-between p-2 border rounded-md">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={task.id}
                onCheckedChange={() => handleTaskCompletion(task.id)}
              />
              <label htmlFor={task.id}>{task.name}</label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentPage;
