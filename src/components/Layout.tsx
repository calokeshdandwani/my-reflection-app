import React from "react";
import SidebarNav from "./SidebarNav"; // Import the new SidebarNav

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 border-r bg-sidebar text-sidebar-foreground p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Navigation</h2>
        <SidebarNav /> {/* Render the SidebarNav component */}
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;