import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { saveHourlyResponse } from "@/lib/storage"; // Updated import
import { MadeWithDyad } from "@/components/made-with-dyad";
import { HourlyResponse } from "@/types"; // Import HourlyResponse interface

const HomePage: React.FC = () => {
  const [currentResponse, setCurrentResponse] = React.useState("");

  const handleSendResponse = async () => {
    if (currentResponse.trim()) {
      const newResponse: Omit<HourlyResponse, "id" | "timestamp"> = {
        response: currentResponse.trim(),
      };
      const savedResponse = await saveHourlyResponse(newResponse);
      if (savedResponse) {
        setCurrentResponse(""); // Clear input after sending
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