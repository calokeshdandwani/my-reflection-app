import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { SidebarNav } from "./SidebarNav";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background text-foreground">
      <aside className="w-full md:w-64 border-r bg-sidebar text-sidebar-foreground p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-sidebar-primary">My App</h2>
        <SidebarNav />
        <div className="mt-auto">
          <MadeWithDyad />
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
};

export default Layout;