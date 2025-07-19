import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Area } from "@/types";
import { cn } from "@/lib/utils";

interface AreaListProps {
  areas: Area[];
  selectedAreaId: string | null;
  onSelectArea: (id: string) => void;
  onAddArea: (name: string) => void;
}

const AreaList: React.FC<AreaListProps> = ({
  areas,
  selectedAreaId,
  onSelectArea,
  onAddArea,
}) => {
  const [newAreaName, setNewAreaName] = useState("");

  const handleAddArea = () => {
    if (newAreaName.trim()) {
      onAddArea(newAreaName.trim());
      setNewAreaName("");
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-sidebar-foreground">Areas</h3>
      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="New Area Name"
          value={newAreaName}
          onChange={(e) => setNewAreaName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddArea()}
          className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border focus:ring-sidebar-ring"
        />
        <Button onClick={handleAddArea} size="icon" className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="space-y-2">
        {areas.map((area) => (
          <li key={area.id}>
            <Button
              variant="ghost"
              onClick={() => onSelectArea(area.id)}
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                selectedAreaId === area.id && "bg-sidebar-accent font-semibold"
              )}
            >
              {area.name}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AreaList;