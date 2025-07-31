import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, ListTodo, History, FileText, Clock, CalendarCheck } from "lucide-react";

interface SidebarNavProps {
  closeSidebar?: () => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ closeSidebar }) => {
  const handleLinkClick = () => {
    if (closeSidebar) {
      closeSidebar();
    }
  };

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
        onClick={handleLinkClick}
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
        onClick={handleLinkClick}
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
        onClick={handleLinkClick}
      >
        <Clock className="h-4 w-4" />
        Recent
      </NavLink>
      <NavLink
        to="/day-planner"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          )
        }
        onClick={handleLinkClick}
      >
        <CalendarCheck className="h-4 w-4" />
        Day Planner
      </NavLink>
      <NavLink
        to="/history"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          )
        }
        onClick={handleLinkClick}
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
        onClick={handleLinkClick}
      >
        <FileText className="h-4 w-4" />
        Summary
      </NavLink>
    </nav>
  );
};

export default SidebarNav;