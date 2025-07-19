import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, ListTodo, History } from "lucide-react"; // ListTodo icon is suitable for Targets

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
    </nav>
  );
};

export default SidebarNav;