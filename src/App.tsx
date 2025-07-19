import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage"; // New Home page
import TasksPage from "./pages/TasksPage"; // Renamed Index to TasksPage
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout"; // Import Layout
import NotificationScheduler from "./components/NotificationScheduler"; // Import NotificationScheduler

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NotificationScheduler /> {/* Global notification scheduler */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} /> {/* New Home page as default */}
          <Route path="/tasks" element={<Layout><TasksPage /></Layout>} /> {/* Existing tasks page */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;