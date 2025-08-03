import React from "react";
import { Tree } from "@/types";
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

interface TreeListProps {
  trees: Tree[];
  selectedTreeId: string | null;
  onSelectTree: (treeId: string) => void;
  onAddTree: (name: string) => void;
  onUpdateTree: (treeId: string, newName: string) => void;
  onDeleteTree: (treeId: string) => void;
  memberCountByTree: Record<string, number>;
}

const TreeList: React.FC<TreeListProps> = ({
  trees,
  selectedTreeId,
  onSelectTree,
  onAddTree,
  onUpdateTree,
  onDeleteTree,
  memberCountByTree,
}) => {
  const [newTreeName, setNewTreeName] = React.useState("");
  const [hoveredTreeId, setHoveredTreeId] = React.useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingTree, setEditingTree] = React.useState<Tree | null>(null);
  const [editedName, setEditedName] = React.useState("");

  const handleAddTree = () => {
    if (newTreeName.trim()) {
      onAddTree(newTreeName.trim());
      setNewTreeName("");
    }
  };

  const handleEditClick = (tree: Tree) => {
    setEditingTree(tree);
    setEditedName(tree.name);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (editingTree && editedName.trim()) {
      onUpdateTree(editingTree.id, editedName.trim());
      setIsEditDialogOpen(false);
      setEditingTree(null);
      setEditedName("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4">Trees</h2>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="New Tree Name"
          value={newTreeName}
          onChange={(e) => setNewTreeName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTree()}
          className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border"
        />
        <Button onClick={handleAddTree} size="icon" className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 pr-2">
        <nav className="space-y-1">
          {trees.map((tree) => (
            <div
              key={tree.id}
              className="flex items-center group"
              onMouseEnter={() => setHoveredTreeId(tree.id)}
              onMouseLeave={() => setHoveredTreeId(null)}
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  selectedTreeId === tree.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                onClick={() => onSelectTree(tree.id)}
              >
                {tree.name} ({memberCountByTree[tree.id] || 0})
              </Button>
              {hoveredTreeId === tree.id && (
                <div className="flex items-center ml-2">
                  <Dialog open={isEditDialogOpen && editingTree?.id === tree.id} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(tree)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Tree</DialogTitle>
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
                          This action cannot be undone. This will permanently delete the tree and all associated members.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteTree(tree.id)}>
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

export default TreeList;
