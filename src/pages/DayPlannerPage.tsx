import React, { useState, useEffect, useMemo } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Area, Task } from "@/types";
import { loadAreas, loadTasks, addTaskToDayPlanner, loadDayPlannerTasks, updateTask } from "@/lib/storage";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DayPlannerPage: React.FC = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [areas, setAreas] = useState<Area[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [dayPlannerTasks, setDayPlannerTasks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const storedAreas = await loadAreas();
      if (storedAreas) {
        setAreas(storedAreas);
      }
      const storedTasks = await loadTasks();
      if (storedTasks) {
        setTasks(storedTasks);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDayPlannerTasks = async () => {
      if (selectedDate) {
        const plannedTasks = await loadDayPlannerTasks(selectedDate);
        if (plannedTasks) {
          setDayPlannerTasks(plannedTasks);
        }
      }
    };
    fetchDayPlannerTasks();
  }, [selectedDate]);

  const pendingTasksForSelectedArea = useMemo(() => {
    if (!selectedAreaId) return [];
    return tasks.filter(task => task.area_id === selectedAreaId && !task.completed);
  }, [tasks, selectedAreaId]);

  const handleAddTaskToDayPlanner = async (taskId: string) => {
    if (selectedDate) {
      const addedTask = await addTaskToDayPlanner(taskId, selectedDate);
      if (addedTask) {
        toast.success("Task added to day planner!");
        const plannedTasks = await loadDayPlannerTasks(selectedDate);
        if (plannedTasks) {
          setDayPlannerTasks(plannedTasks);
        }
      }
    }
  };

  const handleToggleDayPlannerTask = async (taskId: string) => {
    const task = dayPlannerTasks.find(t => t.tasks.id === taskId)?.tasks;
    if (!task) return;
    const updated = await updateTask(taskId, { completed: !task.completed, completed_at: new Date().toISOString() });
    if (updated) {
      const plannedTasks = await loadDayPlannerTasks(selectedDate!);
      if (plannedTasks) {
        setDayPlannerTasks(plannedTasks);
      }
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Day Planner</h1>
      <div className="flex justify-center mb-6">
        <Button onClick={() => setShowCreator(!showCreator)}>
          {showCreator ? "Hide Planner Creator" : "Create a Planner"}
        </Button>
      </div>

      {showCreator && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Select Date</h2>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Select Area and Tasks</h2>
            <Select onValueChange={setSelectedAreaId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an area" />
              </SelectTrigger>
              <SelectContent>
                {areas.map(area => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ScrollArea className="h-64 mt-4 border rounded-md p-4">
              {pendingTasksForSelectedArea.length === 0 ? (
                <p className="text-muted-foreground">No pending tasks in this area.</p>
              ) : (
                <div className="space-y-2">
                  {pendingTasksForSelectedArea.map(task => (
                    <div key={task.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`planner-task-${task.id}`}
                        onCheckedChange={() => handleAddTaskToDayPlanner(task.id)}
                      />
                      <label htmlFor={`planner-task-${task.id}`}>{task.name}</label>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}

      <div className="flex-1 border-t pt-6">
        <h2 className="text-2xl font-semibold mb-4">
          Tasks for {selectedDate ? format(selectedDate, "PPP") : "today"}
        </h2>
        {dayPlannerTasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks planned for this date yet.</p>
        ) : (
          <div className="space-y-2">
            {dayPlannerTasks.map(plannedTask => (
              <div key={plannedTask.id} className="flex items-center gap-2">
                <Checkbox
                  id={`day-task-${plannedTask.tasks.id}`}
                  checked={plannedTask.tasks.completed}
                  onCheckedChange={() => handleToggleDayPlannerTask(plannedTask.tasks.id)}
                />
                <label htmlFor={`day-task-${plannedTask.tasks.id}`}>{plannedTask.tasks.name}</label>
              </div>
            ))}
          </div>
        )}
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default DayPlannerPage;
