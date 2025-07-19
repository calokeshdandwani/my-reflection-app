import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, isSameDay, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { HourlyResponse, Task } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const SummaryPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [hourlyResponses, setHourlyResponses] = useState<HourlyResponse[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      if (!selectedDate) {
        setHourlyResponses([]);
        setCompletedTasks([]);
        setLoading(false);
        return;
      }

      const startOfDay = format(selectedDate, "yyyy-MM-dd 00:00:00");
      const endOfDay = format(selectedDate, "yyyy-MM-dd 23:59:59");

      try {
        // Fetch hourly responses
        const { data: responsesData, error: responsesError } = await supabase
          .from("hourly_responses")
          .select("*")
          .gte("timestamp", startOfDay)
          .lte("timestamp", endOfDay)
          .order("timestamp", { ascending: true });

        if (responsesError) throw responsesError;
        setHourlyResponses(responsesData as HourlyResponse[]);

        // Fetch completed tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("completed", true)
          .gte("completed_at", startOfDay)
          .lte("completed_at", endOfDay)
          .order("completed_at", { ascending: true });

        if (tasksError) throw tasksError;
        setCompletedTasks(tasksData as Task[]);

      } catch (err: any) {
        console.error("Failed to load summary data:", err.message);
        setError("Failed to load summary data. Please try again.");
        toast.error("Failed to load summary data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Daily Summary Report</h1>

        <div className="mb-6 flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <span className="text-lg font-semibold">
            Summary for: {selectedDate ? format(selectedDate, "PPP") : "No date selected"}
          </span>
        </div>

        {loading && <p className="text-center text-muted-foreground">Loading summary...</p>}
        {error && <p className="text-center text-destructive">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Part 1: Summary of Hourly Inputs */}
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4">Hourly Reflections</h2>
              {hourlyResponses.length === 0 ? (
                <p className="text-muted-foreground">No reflections recorded for this date.</p>
              ) : (
                <ul className="space-y-3">
                  {hourlyResponses.map((response) => (
                    <li key={response.id} className="border-b border-border pb-2 last:border-b-0">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(response.timestamp), "p")}
                      </p>
                      <p className="text-base">{response.response}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Part 2: Completed Tasks */}
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4">Completed Tasks</h2>
              {completedTasks.length === 0 ? (
                <p className="text-muted-foreground">No tasks completed on this date.</p>
              ) : (
                <ul className="space-y-3">
                  {completedTasks.map((task) => (
                    <li key={task.id} className="border-b border-border pb-2 last:border-b-0">
                      <p className="text-base font-medium">{task.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Completed at: {task.completed_at ? format(new Date(task.completed_at), "p") : "N/A"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SummaryPage;