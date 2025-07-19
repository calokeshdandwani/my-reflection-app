import React from "react";
import { loadState } from "@/lib/storage";
import { format } from "date-fns";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HourlyResponse {
  timestamp: string; // ISO string date
  response: string;
}

const HistoryPage: React.FC = () => {
  const [responses, setResponses] = React.useState<HourlyResponse[]>([]);

  React.useEffect(() => {
    const storedResponses = loadState<HourlyResponse[]>("hourlyResponses");
    if (storedResponses) {
      // Sort responses from newest to oldest
      const sortedResponses = [...storedResponses].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setResponses(sortedResponses);
    }
  }, []);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Your Reflection History</h1>

      <ScrollArea className="flex-1 mb-6 p-4 border rounded-md bg-background">
        {responses.length === 0 ? (
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