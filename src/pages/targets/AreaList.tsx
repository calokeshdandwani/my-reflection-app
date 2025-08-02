import React from "react";
import { Area } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";

interface AreaListProps {
  areas: Area[];
  selectedAreaId: string | null;
  onSelectArea: (areaId: string) => void;
  onAddArea: (name: string) => void;
  onUpdateArea: (areaId: string, newName: string) => void;
  onDeleteArea: (areaId: string) => void;
}

const AreaList: React.FC<AreaListProps> = ({
  areas,
  selectedAreaId,
  onSelectArea,
  onAddArea,
  onUpdateArea,
  onDeleteArea,
}) => {
  const [newAreaName, setNewAreaName] = React.useState("");
  const [hoveredAreaId, setHoveredAreaId] = React.useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingArea, setEditingArea] = React.useState<Area | null>(null);
  const [editedName, setEditedName] = React.useState("");

  const handleAddArea = () => {
    if (newAreaName.trim()) {
      onAddArea(newAreaName.trim());
      setNewAreaName("");
    }
  };

  const handleEditClick = (area: Area) => {
    setEditingArea(area);
    setEditedName(area.name);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (editingArea && editedName.trim()) {
      onUpdateArea(editingArea.id, editedName.trim());
      setIsEditDialogOpen(false);
      setEditingArea(null);
      setEditedName("");
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
            <div
              key={area.id}
              className="flex items-center group"
              onMouseEnter={() => setHoveredAreaId(area.id)}
              onMouseLeave={() => setHoveredAreaId(null)}
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  selectedAreaId === area.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                onClick={() => onSelectArea(area.id)}
              >
                {area.name}
              </Button>
              {hoveredAreaId === area.id && (
                <div className="flex items-center ml-2">
                  <Dialog open={isEditDialogOpen && editingArea?.id === area.id} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(area)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Area</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditSubmit}>Save changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
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
                        <AlertDialogAction onClick={() => onDeleteArea(area.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default AreaList;