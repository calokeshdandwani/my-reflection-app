import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { loadHourlyResponses, loadTasks } from "@/lib/storage"; // Updated imports
import { format, isSameDay, isWithinInterval, endOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, HourlyResponse } from "@/types"; // Import Task and HourlyResponse interfaces
import { DateRange } from "react-day-picker";

const SummaryPage: React.FC = () => {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [hourlyResponses, setHourlyResponses] = React.useState<HourlyResponse[]>([]);
  const [completedTasks, setCompletedTasks] = React.useState<Task[]>([]);
  const [filteredResponses, setFilteredResponses] = React.useState<HourlyResponse[]>([]);
  const [filteredCompletedTasks, setFilteredCompletedTasks] = React.useState<Task[]>([]);

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

  const handleExport = (exportType: "reflections" | "tasks" | "all") => {
    if (!date?.from || !date?.to) {
      alert("Please select a date range to export the summary.");
      return;
    }

    let dataToExport: any[] = [];
    let headers: string[] = [];
    let filename = `summary_${format(date.from, "yyyy-MM-dd")}_to_${format(date.to, "yyyy-MM-dd")}`;

    if (exportType === "reflections" || exportType === "all") {
      dataToExport.push(...filteredResponses.map(r => ({
        Time: format(new Date(r.timestamp), "yyyy-MM-dd HH:mm"),
        Type: "Reflection",
        Content: r.response,
      })));
    }

    if (exportType === "tasks" || exportType === "all") {
      dataToExport.push(...filteredCompletedTasks.map(t => ({
        Time: t.completed_at ? format(new Date(t.completed_at), "yyyy-MM-dd HH:mm") : "N/A",
        Type: "Completed Task",
        Content: t.name,
      })));
    }

    if (dataToExport.length === 0) {
      alert("No data to export for the selected date range and type.");
      return;
    }

    dataToExport.sort((a, b) => a.Time.localeCompare(b.Time));
    headers = ["Time", "Type", "Content"];
    filename = `${filename}_${exportType}.csv`;

    exportToCsv(dataToExport, filename, headers);
  };

  React.useEffect(() => {
    const fetchAndFilterData = async () => {
      const storedResponses = await loadHourlyResponses() || [];
      setHourlyResponses(storedResponses);
      const storedTasks = await loadTasks() || [];
      setCompletedTasks(storedTasks);
    };
    fetchAndFilterData();
  }, []);

  React.useEffect(() => {
    if (date?.from && date?.to) {
      const interval = { start: date.from, end: endOfDay(date.to) };
      const filteredResp = hourlyResponses.filter(response =>
        isWithinInterval(new Date(response.timestamp), interval)
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setFilteredResponses(filteredResp);

      const filteredTasks = completedTasks.filter(task =>
        task.completed && task.completed_at && isWithinInterval(new Date(task.completed_at), interval)
      ).sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime());
      setFilteredCompletedTasks(filteredTasks);
    }
  }, [date, hourlyResponses, completedTasks]);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Daily Summary Report</h1>

      <div className="mb-6 flex justify-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Export to CSV</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleExport("reflections")}>Reflections</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleExport("tasks")}>Completed Tasks</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleExport("all")}>All</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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