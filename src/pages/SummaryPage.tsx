import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { loadHourlyResponses, loadTasks } from "@/lib/storage"; // Updated imports
import { format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, HourlyResponse } from "@/types"; // Import Task and HourlyResponse interfaces

const SummaryPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [hourlyResponses, setHourlyResponses] = React.useState<HourlyResponse[]>([]);
  const [completedTasks, setCompletedTasks] = React.useState<Task[]>([]);

  const exportToCsv = (data: any[], filename: string, headers: string[]) => {
    const csvRows = [];
    csvRows.push(headers.join(',')); // Add headers

    for (const row of data) {
      const values = headers.map(header => {
        let value = row[header.replace(/\s/g, '')]; // Remove spaces from header to match key
        if (value === undefined || value === null) {
          value = '';
        } else if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          value = `"${value.replace(/"/g, '""')}"`; // Escape double quotes and wrap in quotes
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSummary = () => {
    if (!selectedDate) {
      alert("Please select a date to export the summary.");
      return;
    }

    const dataToExport = [
      ...filteredResponses.map(r => ({
        Time: format(new Date(r.timestamp), "HH:mm"),
        Type: "Reflection",
        Content: r.response,
      })),
      ...filteredCompletedTasks.map(t => ({
        Time: t.completed_at ? format(new Date(t.completed_at), "HH:mm") : "N/A",
        Type: "Completed Task",
        Content: t.name,
      })),
    ].sort((a, b) => a.Time.localeCompare(b.Time));

    if (dataToExport.length === 0) {
      alert("No data to export for the selected date.");
      return;
    }

    const filename = `summary_${format(selectedDate, "yyyy-MM-dd")}.csv`;
    exportToCsv(dataToExport, filename, ["Time", "Type", "Content"]);
  };

  React.useEffect(() => {
    const fetchSummaryData = async () => {
      const storedResponses = await loadHourlyResponses();
      if (storedResponses) {
        setHourlyResponses(storedResponses);
      }
      const storedTasks = await loadTasks();
      if (storedTasks) {
        setCompletedTasks(storedTasks);
      }
    };
    fetchSummaryData();
  }, []);

  const filteredResponses = React.useMemo(() => {
    if (!selectedDate) return [];
    return hourlyResponses.filter(response =>
      isSameDay(new Date(response.timestamp), selectedDate)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Sort by time
  }, [hourlyResponses, selectedDate]);

  const filteredCompletedTasks = React.useMemo(() => {
    if (!selectedDate) return [];
    return completedTasks.filter(task =>
      task.completed && task.completed_at && isSameDay(new Date(task.completed_at), selectedDate) // Use task.completed_at
    ).sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime()); // Sort by completion time
  }, [completedTasks, selectedDate]);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Daily Summary Report</h1>

      <div className="mb-6 flex justify-center items-center gap-4">
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
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button onClick={handleExportSummary}>Export to CSV</Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
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
                      Completed at: {task.completed_at ? format(new Date(task.completed_at), "HH:mm") : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </ScrollArea>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default SummaryPage;