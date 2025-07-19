import React from "react";

interface LayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ sidebar, children }) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 border-r bg-sidebar text-sidebar-foreground p-4 flex flex-col">
        {sidebar}
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;