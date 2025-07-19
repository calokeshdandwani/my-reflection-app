import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { HourlyResponse } from "@/types";

const HomePage: React.FC = () => {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) {
      toast.error("Please enter your reflection before submitting.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("hourly_responses")
        .insert([{ response: response.trim() }])
        .select();

      if (error) {
        throw error;
      }

      toast.success("Reflection saved successfully!");
      setResponse(""); // Clear the input after submission
    } catch (error: any) {
      console.error("Error saving reflection:", error.message);
      toast.error("Failed to save reflection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="w-full max-w-2xl bg-card text-card-foreground rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Your Daily Reflection
          </h1>
          <p className="text-lg text-muted-foreground mb-8 text-center">
            What did you do in the last hour?
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Type your reflection here..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={6}
              className="w-full resize-none"
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Submit Reflection"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;