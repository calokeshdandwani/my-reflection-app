import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, ListTodo, History, FileText, Clock } from "lucide-react"; // Added Clock icon for Recent

const SidebarNav: React.FC = () => {
  return (
    <nav className="space-y-1">
      <NavLink
        to="/"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          )
        }
      >
        <Home className="h-4 w-4" />
        Home
      </NavLink>
      <NavLink
        to="/targets"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          )
        }
      >
        <ListTodo className="h-4 w-4" />
        Targets
      </NavLink>
      <NavLink
        to="/recent"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          )
        }
      >
        <Clock className="h-4 w-4" />
        Recent
      </NavLink>
      <NavLink
        to="/history"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          )
        }
      >
        <History className="h-4 w-4" />
        History
      </NavLink>
      <NavLink
        to="/history/summary"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ml-4", // Indent for sub-item
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          )
        }
      >
        <FileText className="h-4 w-4" />
        Summary
      </NavLink>
    </nav>
  );
};

export default SidebarNav;