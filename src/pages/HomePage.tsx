import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { loadState, saveState } from "@/lib/storage";
import { format } from "date-fns";
import { MadeWithDyad } from "@/components/made-with-dyad";

interface HourlyResponse {
  timestamp: string; // ISO string date
  response: string;
}

const HomePage: React.FC = () => {
  const [currentResponse, setCurrentResponse] = React.useState("");
  const [responses, setResponses] = React.useState<HourlyResponse[]>([]);

  React.useEffect(() => {
    const storedResponses = loadState<HourlyResponse[]>("hourlyResponses");
    if (storedResponses) {
      setResponses(storedResponses);
    }
  }, []);

  React.useEffect(() => {
    saveState("hourlyResponses", responses);
  }, [responses]);

  const handleSendResponse = () => {
    if (currentResponse.trim()) {
      const newResponse: HourlyResponse = {
        timestamp: new Date().toISOString(),
        response: currentResponse.trim(),
      };
      setResponses((prevResponses) => [...prevResponses, newResponse]);
      setCurrentResponse("");
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Your Daily Reflection</h1>

      <div className="flex-1 overflow-y-auto mb-6 p-4 border rounded-md bg-background">
        <div className="flex flex-col items-start mb-4">
          <div className="bg-blue-100 text-blue-800 p-3 rounded-lg max-w-[80%] self-start">
            <p className="font-semibold">What you did in the last one hour?</p>
          </div>
        </div>

        {responses.length === 0 ? (
          <p className="text-muted-foreground text-center mt-8">No responses yet. Type your first reflection below!</p>
        ) : (
          <div className="space-y-4">
            {responses.map((entry, index) => (
              <div key={index} className="flex flex-col items-end">
                <div className="bg-green-100 text-green-800 p-3 rounded-lg max-w-[80%] self-end">
                  <p>{entry.response}</p>
                  <p className="text-xs text-green-700 mt-1 text-right">
                    {format(new Date(entry.timestamp), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Type your response here..."
          value={currentResponse}
          onChange={(e) => setCurrentResponse(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendResponse()}
          className="flex-1"
        />
        <Button onClick={handleSendResponse} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default HomePage;