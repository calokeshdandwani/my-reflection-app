import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { supabase } from "@/lib/supabaseClient";
import { format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task } from "@/types";
import { toast } from "sonner";

interface HourlyResponse {
  id: string;
  timestamp: string; // ISO string date
  response: string;
}

const SummaryPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [allHourlyResponses, setAllHourlyResponses] = React.useState<HourlyResponse[]>([]);
  const [allTasks, setAllTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: responsesData, error: responsesError } = await supabase
        .from("hourly_responses")
        .select("*");

      if (responsesError) {
        console.error("Error fetching hourly responses:", responsesError);
        toast.error("Failed to load reflections for summary.");
      } else {
        setAllHourlyResponses(responsesData as HourlyResponse[]);
      }

      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*");

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        toast.error("Failed to load tasks for summary.");
      } else {
        setAllTasks(tasksData as Task[]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredResponses = React.useMemo(() => {
    if (!selectedDate) return [];
    return allHourlyResponses.filter(response =>
      isSameDay(new Date(response.timestamp), selectedDate)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [allHourlyResponses, selectedDate]);

  const filteredCompletedTasks = React.useMemo(() => {
    if (!selectedDate) return [];
    return allTasks.filter(task =>
      task.completed && task.completedAt && isSameDay(new Date(task.completedAt), selectedDate)
    ).sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());
  }, [allTasks, selectedDate]);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Daily Summary Report</h1>

      <div className="mb-6 flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
              disabled={loading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {loading ? (
            <p className="text-muted-foreground text-center mt-8">Loading summary data...</p>
          ) : (
            <>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Hourly Reflections</h2>
                {filteredResponses.length === 0 ? (
                  <p className="text-muted-foreground">No reflections recorded for this date.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredResponses.map((entry, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md border">
                        <p className="text-sm text-gray-600 mb-1">
                          {format(new Date(entry.timestamp), "HH:mm")}
                        </p>
                        <p>{entry.response}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">Completed Tasks</h2>
                {filteredCompletedTasks.length === 0 ? (
                  <p className="text-muted-foreground">No tasks completed on this date.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredCompletedTasks.map((task, index) => (
                      <div key={index} className="bg-green-50 p-3 rounded-md border border-green-200">
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Completed at: {task.completedAt ? format(new Date(task.completedAt), "HH:mm") : "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </ScrollArea>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default SummaryPage;