import React from "react";
import { Member } from "@/types";
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

interface MemberListProps {
  members: Member[];
  onAddMember: (name: string) => void;
  onUpdateMember: (memberId: string, newName: string) => void;
  onDeleteMember: (memberId: string) => void;
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}) => {
  const [newMemberName, setNewMemberName] = React.useState("");
  const [hoveredMemberId, setHoveredMemberId] = React.useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<Member | null>(null);
  const [editedName, setEditedName] = React.useState("");

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      onAddMember(newMemberName.trim());
      setNewMemberName("");
    }
  };

  const handleEditClick = (member: Member) => {
    setEditingMember(member);
    setEditedName(member.name);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (editingMember && editedName.trim()) {
      onUpdateMember(editingMember.id, editedName.trim());
      setIsEditDialogOpen(false);
      setEditingMember(null);
      setEditedName("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4">Members</h2>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="New Member Name"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddMember()}
          className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border"
        />
        <Button onClick={handleAddMember} size="icon" className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 pr-2">
        <nav className="space-y-1">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center group"
              onMouseEnter={() => setHoveredMemberId(member.id)}
              onMouseLeave={() => setHoveredMemberId(null)}
            >
              <div className="w-full justify-start text-sidebar-foreground p-2">
                {member.name}
              </div>
              {hoveredMemberId === member.id && (
                <div className="flex items-center ml-2">
                  <Dialog open={isEditDialogOpen && editingMember?.id === member.id} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(member)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Member</DialogTitle>
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
                          This action cannot be undone. This will permanently delete the member.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteMember(member.id)}>
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

export default MemberList;
