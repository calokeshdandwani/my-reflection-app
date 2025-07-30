import React from "react";
import { Area } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AreaListProps {
  areas: Area[];
  selectedAreaId: string | null;
  onSelectArea: (areaId: string) => void;
  onAddArea: (name: string) => void;
  onEditArea: (areaId: string, newName: string) => void;
  onDeleteArea: (areaId: string) => void;
}

const AreaList: React.FC<AreaListProps> = ({
  areas,
  selectedAreaId,
  onSelectArea,
  onAddArea,
  onEditArea,
  onDeleteArea,
}) => {
  const [newAreaName, setNewAreaName] = React.useState("");
  const [editingAreaId, setEditingAreaId] = React.useState<string | null>(null);
  const [editedAreaName, setEditedAreaName] = React.useState("");

  const handleAddArea = () => {
    if (newAreaName.trim()) {
      onAddArea(newAreaName.trim());
      setNewAreaName("");
    }
  };

  const handleEditClick = (area: Area) => {
    setEditingAreaId(area.id);
    setEditedAreaName(area.name);
  };

  const handleSaveEdit = () => {
    if (editingAreaId && editedAreaName.trim()) {
      onEditArea(editingAreaId, editedAreaName.trim());
      setEditingAreaId(null);
      setEditedAreaName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingAreaId(null);
    setEditedAreaName("");
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
            <div key={area.id} className="flex items-center gap-2">
              {editingAreaId === area.id ? (
                <>
                  <Input
                    value={editedAreaName}
                    onChange={(e) => setEditedAreaName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                    className="flex-1 bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border"
                  />
                  <Button onClick={handleSaveEdit} size="icon" variant="ghost">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleCancelEdit} size="icon" variant="ghost">
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      selectedAreaId === area.id && "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                    onClick={() => onSelectArea(area.id)}
                  >
                    {area.name}
                  </Button>
                  <div className="flex items-center">
                    <Button onClick={() => handleEditClick(area)} size="icon" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the area and all associated tasks.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteArea(area.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default AreaList;