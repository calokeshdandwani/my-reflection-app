import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface HourlyResponse {
  id: string;
  timestamp: string; // ISO string date
  response: string;
}

const HomePage: React.FC = () => {
  const [currentResponse, setCurrentResponse] = React.useState("");
  const [responses, setResponses] = React.useState<HourlyResponse[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchResponses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("hourly_responses")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error fetching hourly responses:", error);
        toast.error("Failed to load reflections.");
      } else {
        setResponses(data as HourlyResponse[]);
      }
      setLoading(false);
    };

    fetchResponses();
  }, []);

  const handleSendResponse = async () => {
    if (currentResponse.trim()) {
      const { data, error } = await supabase
        .from("hourly_responses")
        .insert({ response: currentResponse.trim() })
        .select();

      if (error) {
        console.error("Error saving response:", error);
        toast.error("Failed to save your reflection.");
      } else if (data && data.length > 0) {
        const newResponse: HourlyResponse = data[0];
        setResponses((prevResponses) => [newResponse, ...prevResponses]);
        setCurrentResponse(""); // Clear input after sending
        toast.success("Reflection saved!");
      }
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Your Daily Reflection</h1>

      <div className="flex-1 mb-6 p-4 border rounded-md bg-background flex items-center justify-center">
        <div className="flex flex-col items-start">
          <div className="bg-blue-100 text-blue-800 p-3 rounded-lg max-w-[80%] self-start">
            <p className="font-semibold">What you did in the last one hour?</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Type your response here..."
          value={currentResponse}
          onChange={(e) => setCurrentResponse(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendResponse()}
          className="flex-1"
          disabled={loading}
        />
        <Button onClick={handleSendResponse} size="icon" disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default HomePage;