import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Task } from "@/types";
import { loadTasks } from "@/lib/storage";
import { format, isFuture } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const UpcomingPage: React.FC = () => {
  const [tasks, setTasks] = React.useState<Task[]>([]);

  React.useEffect(() => {
    const fetchTasks = async () => {
      const storedTasks = await loadTasks();
      if (storedTasks) {
        const upcomingTasks = storedTasks.filter(task => task.scheduled_date && isFuture(new Date(task.scheduled_date)));
        setTasks(upcomingTasks);
      }
    };
    fetchTasks();
  }, []);

  const groupedTasks = React.useMemo(() => {
    return tasks.reduce((acc, task) => {
      const date = format(new Date(task.scheduled_date!), "PPP");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Upcoming Tasks</h1>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {Object.keys(groupedTasks).length === 0 ? (
            <p className="text-muted-foreground">No upcoming tasks scheduled.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTasks).map(([date, tasks]) => (
                <section key={date}>
                  <h2 className="text-2xl font-semibold mb-4 text-primary">{date}</h2>
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="bg-gray-50 p-3 rounded-md border">
                        <p>{task.name}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default UpcomingPage;
