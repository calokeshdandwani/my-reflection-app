import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Tree, Member } from "@/types";
import { loadTrees, saveTree, updateTree, deleteTree, loadMembers, saveMember, updateMember, deleteMember } from "@/lib/storage";
import { toast } from "sonner";
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

const TaxPlannerPage: React.FC = () => {
  const [trees, setTrees] = React.useState<Tree[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [newTreeName, setNewTreeName] = React.useState("");
  const [newMemberName, setNewMemberName] = React.useState("");
  const [addingMemberTo, setAddingMemberTo] = React.useState<string | null>(null);
  const [editingItem, setEditingItem] = React.useState<{ type: "tree" | "member"; item: Tree | Member } | null>(null);
  const [editedName, setEditedName] = React.useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchInitialData = async () => {
      const storedTrees = await loadTrees();
      if (storedTrees) {
        setTrees(storedTrees);
      }
      const storedMembers = await loadMembers();
      if (storedMembers) {
        setMembers(storedMembers);
      }
    };
    fetchInitialData();
  }, []);

  const handleAddTree = async () => {
    if (newTreeName.trim()) {
      const newTree: Omit<Tree, "id" | "created_at"> = {
        name: newTreeName.trim(),
      };
      const savedTree = await saveTree(newTree);
      if (savedTree) {
        setTrees((prevTrees) => [...prevTrees, savedTree]);
        setNewTreeName("");
        toast.success(`Tree "${savedTree.name}" added!`);
      } else {
        toast.error("Failed to add tree.");
      }
    }
  };

  const handleAddMember = async (treeId: string) => {
    if (newMemberName.trim()) {
      const newMember: Omit<Member, "id" | "created_at"> = {
        tree_id: treeId,
        name: newMemberName.trim(),
      };
      const savedMember = await saveMember(newMember);
      if (savedMember) {
        setMembers((prevMembers) => [...prevMembers, savedMember]);
        setNewMemberName("");
        setAddingMemberTo(null);
        toast.success(`Member "${savedMember.name}" added!`);
      } else {
        toast.error("Failed to add member.");
      }
    }
  };

  const handleEditClick = (item: Tree | Member, type: "tree" | "member") => {
    setEditingItem({ type, item });
    setEditedName(item.name);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (editingItem) {
      const { type, item } = editingItem;
      if (type === "tree") {
        const updatedTree = await updateTree(item.id, { name: editedName });
        if (updatedTree) {
          setTrees((prevTrees) =>
            prevTrees.map((tree) =>
              tree.id === item.id ? updatedTree : tree
            )
          );
          toast.success("Tree updated!");
        } else {
          toast.error("Failed to update tree.");
        }
      } else {
        const updatedMember = await updateMember(item.id, { name: editedName });
        if (updatedMember) {
          setMembers((prevMembers) =>
            prevMembers.map((member) =>
              member.id === item.id ? updatedMember : member
            )
          );
          toast.success("Member updated!");
        } else {
          toast.error("Failed to update member.");
        }
      }
      setIsEditDialogOpen(false);
      setEditingItem(null);
      setEditedName("");
    }
  };

  const handleDelete = async (item: Tree | Member, type: "tree" | "member") => {
    if (type === "tree") {
      const success = await deleteTree(item.id);
      if (success) {
        setTrees((prevTrees) => prevTrees.filter((tree) => tree.id !== item.id));
        setMembers((prevMembers) => prevMembers.filter((member) => member.tree_id !== item.id));
        toast.success("Tree deleted!");
      } else {
        toast.error("Failed to delete tree.");
      }
    } else {
      const success = await deleteMember(item.id);
      if (success) {
        setMembers((prevMembers) => prevMembers.filter((member) => member.id !== item.id));
        toast.success("Member deleted!");
      } else {
        toast.error("Failed to delete member.");
      }
    }
  };

  const memberCountByTree = members.reduce((acc, member) => {
    acc[member.tree_id] = (acc[member.tree_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Tax Planner</h1>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="New Tree Name"
          value={newTreeName}
          onChange={(e) => setNewTreeName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTree()}
        />
        <Button onClick={handleAddTree}>Add Tree</Button>
      </div>
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {trees.map((tree) => (
            <div key={tree.id} className="p-3 border rounded-md bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setAddingMemberTo(addingMemberTo === tree.id ? null : tree.id)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold">{tree.name} ({memberCountByTree[tree.id] || 0})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(tree, "tree")}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
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
                        <AlertDialogAction onClick={() => handleDelete(tree, "tree")}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {addingMemberTo === tree.id && (
                <div className="flex gap-2 mt-2 ml-10">
                  <Input
                    placeholder="New Member Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddMember(tree.id)}
                  />
                  <Button onClick={() => handleAddMember(tree.id)}>Add Member</Button>
                </div>
              )}
              <div className="ml-10 mt-2 space-y-2">
                {members
                  .filter((member) => member.tree_id === tree.id)
                  .map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <span>{member.name}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(member, "member")}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the member.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(member, "member")}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingItem?.type}</DialogTitle>
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
      <MadeWithDyad />
    </div>
  );
};

export default TaxPlannerPage;
