import React from "react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Task } from "@/types";
import { toast } from "sonner";

interface HourlyResponse {
  id: string;
  timestamp: string; // ISO string date
  response: string;
}

const HistoryPage: React.FC = () => {
  const [responses, setResponses] = React.useState<HourlyResponse[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: responsesData, error: responsesError } = await supabase
        .from("hourly_responses")
        .select("*")
        .order("timestamp", { ascending: false });

      if (responsesError) {
        console.error("Error fetching hourly responses:", responsesError);
        toast.error("Failed to load reflections history.");
      } else {
        setResponses(responsesData as HourlyResponse[]);
      }

      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        toast.error("Failed to load tasks history.");
      } else {
        setTasks(tasksData as Task[]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const exportToCsv = (data: any[], filename: string, headers: string[]) => {
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        let value = row[header.replace(/\s/g, '')];
        if (value === undefined || value === null) {
          value = '';
        } else if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          value = `"${value.replace(/"/g, '""')}"`;
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

  const handleExportResponses = () => {
    const dataToExport = responses.map(r => ({
      Timestamp: format(new Date(r.timestamp), "yyyy-MM-dd HH:mm:ss"),
      Response: r.response,
    }));
    exportToCsv(dataToExport, "hourly_reflections.csv", ["Timestamp", "Response"]);
  };

  const handleExportTasks = () => {
    const dataToExport = tasks.map(t => ({
      ID: t.id,
      AreaID: t.areaId,
      Name: t.name,
      Priority: t.priority,
      Completed: t.completed ? 'Yes' : 'No',
      CompletedAt: t.completedAt ? format(new Date(t.completedAt), "yyyy-MM-dd HH:mm:ss") : '',
      CreatedAt: format(new Date(t.createdAt), "yyyy-MM-dd HH:mm:ss"),
      ParentID: t.parentId || '',
    }));
    exportToCsv(dataToExport, "all_tasks.csv", ["ID", "AreaID", "Name", "Priority", "Completed", "CompletedAt", "CreatedAt", "ParentID"]);
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Your Reflection History</h1>

      <div className="flex justify-center gap-4 mb-6">
        <Button onClick={handleExportResponses} disabled={loading}>Export Reflections (CSV)</Button>
        <Button onClick={handleExportTasks} disabled={loading}>Export Tasks (CSV)</Button>
      </div>

      <ScrollArea className="flex-1 mb-6 p-4 border rounded-md bg-background">
        {loading ? (
          <p className="text-muted-foreground text-center mt-8">Loading history...</p>
        ) : responses.length === 0 ? (
          <p className="text-muted-foreground text-center mt-8">No reflections recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {responses.map((entry, index) => (
              <div key={index} className="flex flex-col items-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-[80%] self-start">
                  <p>{entry.response}</p>
                  <p className="text-xs text-gray-600 mt-1 text-right">
                    {format(new Date(entry.timestamp), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <MadeWithDyad />
    </div>
  );
};

export default HistoryPage;