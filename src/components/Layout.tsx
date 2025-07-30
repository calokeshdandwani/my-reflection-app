import React from "react";
import { useLocation } from "react-router-dom";
import SidebarNav from "./SidebarNav";
import MobileSidebar from "./MobileSidebar";
import AreaList from "@/pages/targets/AreaList";
import { useIsMobile } from "@/hooks/use-mobile";
import { TargetPageProvider, useTargets } from "@/contexts/TargetPageContext";

interface LayoutProps {
  children: React.ReactNode;
}

const TargetsSidebar: React.FC = () => {
  const { areas, selectedAreaId, onSelectArea, onAddArea, onEditArea, onDeleteArea } = useTargets();
  return (
    <div className="mt-4">
      <AreaList
        areas={areas}
        selectedAreaId={selectedAreaId}
        onSelectArea={onSelectArea}
        onAddArea={onAddArea}
        onEditArea={onEditArea}
        onDeleteArea={onDeleteArea}
      />
    </div>
  );
};

const LayoutComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isTargetsPage = location.pathname === "/targets";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-80 border-r bg-sidebar text-sidebar-foreground p-4 flex-col hidden md:flex">
        <h2 className="text-lg font-semibold mb-4">Navigation</h2>
        <SidebarNav />
        {isTargetsPage && <TargetsSidebar />}
      </aside>
      <div className="flex flex-col flex-1">
        {isMobile && (
          <header className="flex items-center p-4 border-b md:hidden">
            <MobileSidebar />
            <h2 className="text-lg font-semibold ml-4">Menu</h2>
          </header>
        )}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <TargetPageProvider>
      <LayoutComponent>{children}</LayoutComponent>
    </TargetPageProvider>
  );
};

export default Layout;