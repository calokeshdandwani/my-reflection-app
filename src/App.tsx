import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";
import TargetsPage from "./pages/TargetsPage";
import RecentPage from "./pages/RecentPage";
import SummaryPage from "./pages/SummaryPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import NotificationScheduler from "./components/NotificationScheduler";
import { supabase } from "./lib/supabaseClient"; // Import supabase client
import React from "react"; // Import React for useEffect

const queryClient = new QueryClient();

const App = () => {
  React.useEffect(() => {
    // Simple check to see if Supabase client is initialized and can connect
    const checkSupabaseConnection = async () => {
      try {
        // Attempt a simple query (e.g., to a non-existent table) to trigger a connection
        // This will likely return an error, but it confirms the client is trying to connect
        await supabase.from('test_connection').select('*').limit(1);
        console.log('Supabase client initialized. Connection attempt made.');
      } catch (error) {
        console.error('Supabase connection check failed:', error);
        // If the error is "relation 'public.test_connection' does not exist", it means the client is working!
        // Otherwise, there might be an issue with URL/Key or network.
      }
    };
    checkSupabaseConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NotificationScheduler />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/history" element={<Layout><HistoryPage /></Layout>} />
            <Route path="/history/summary" element={<Layout><SummaryPage /></Layout>} />
            <Route path="/targets" element={<Layout><TargetsPage /></Layout>} />
            <Route path="/recent" element={<Layout><RecentPage /></Layout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;