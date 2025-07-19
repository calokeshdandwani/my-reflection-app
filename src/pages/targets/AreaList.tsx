import React from "react";
import { Area } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AreaListProps {
  areas: Area[];
  selectedAreaId: string | null;
  onSelectArea: (areaId: string) => void;
  onAddArea: (name: string) => void;
}

const AreaList: React.FC<AreaListProps> = ({
  areas,
  selectedAreaId,
  onSelectArea,
  onAddArea,
}) => {
  const [newAreaName, setNewAreaName] = React.useState("");

  const handleAddArea = () => {
    if (newAreaName.trim()) {
      onAddArea(newAreaName.trim());
      setNewAreaName("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4">Areas</h2>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="New Area Name"
          value={newAreaName}
          onChange={(e) => setNewAreaName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddArea()}
          className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border"
        />
        <Button onClick={handleAddArea} size="icon" className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 pr-2">
        <nav className="space-y-1">
          {areas.map((area) => (
            <Button
              key={area.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                selectedAreaId === area.id && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
              onClick={() => onSelectArea(area.id)}
            >
              {area.name}
            </Button>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default AreaList;