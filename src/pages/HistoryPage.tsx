import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { HourlyResponse } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const HistoryPage: React.FC = () => {
  const [hourlyResponses, setHourlyResponses] = useState<HourlyResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHourlyResponses = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("hourly_responses")
          .select("*")
          .order("timestamp", { ascending: false });

        if (error) {
          throw error;
        }
        setHourlyResponses(data as HourlyResponse[]);
      } catch (err: any) {
        console.error("Failed to load reflections:", err.message);
        setError("Failed to load reflections. Please try again.");
        toast.error("Failed to load reflections.");
      } finally {
        setLoading(false);
      }
    };

    fetchHourlyResponses();
  }, []);

  const exportToCsv = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.info(`No data to export for ${filename}.`);
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((fieldName) => JSON.stringify(row[fieldName], (key, value) => value === null ? '' : value))
          .join(",")
      ),
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${filename} successfully!`);
    }
  };

  const handleExportReflections = () => {
    exportToCsv(hourlyResponses, "hourly_reflections.csv");
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Reflection History</h1>

        <div className="mb-4 flex justify-end">
          <Button onClick={handleExportReflections}>Export Reflections CSV</Button>
        </div>

        {loading && <p className="text-center text-muted-foreground">Loading reflections...</p>}
        {error && <p className="text-center text-destructive">{error}</p>}
        {!loading && !error && hourlyResponses.length === 0 && (
          <p className="text-center text-muted-foreground">No reflections recorded yet.</p>
        )}

        <div className="space-y-4">
          {hourlyResponses.map((response) => (
            <div
              key={response.id}
              className="bg-card text-card-foreground p-4 rounded-lg shadow-sm border border-border"
            >
              <p className="text-sm text-muted-foreground mb-2">
                {format(new Date(response.timestamp), "PPP p")}
              </p>
              <p className="text-base">{response.response}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default HistoryPage;