import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import TreeList from "./tax-planner/TreeList";
import MemberList from "./tax-planner/MemberList";
import { Tree, Member } from "@/types";
import { loadTrees, saveTree, updateTree, deleteTree, loadMembers, saveMember, updateMember, deleteMember } from "@/lib/storage";
import { toast } from "sonner";

const TaxPlannerPage: React.FC = () => {
  const [trees, setTrees] = React.useState<Tree[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [selectedTreeId, setSelectedTreeId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchInitialData = async () => {
      const storedTrees = await loadTrees();
      if (storedTrees) {
        setTrees(storedTrees);
        if (storedTrees.length > 0) {
          setSelectedTreeId(storedTrees[0].id);
        }
      }
      const storedMembers = await loadMembers();
      if (storedMembers) {
        setMembers(storedMembers);
      }
    };
    fetchInitialData();
  }, []);

  const handleAddTree = async (name: string) => {
    const newTree: Omit<Tree, "id" | "created_at"> = {
      name,
    };
    const savedTree = await saveTree(newTree);
    if (savedTree) {
      setTrees((prevTrees) => {
        const updatedTrees = [...prevTrees, savedTree];
        if (selectedTreeId === null) {
          setSelectedTreeId(savedTree.id);
        }
        return updatedTrees;
      });
      toast.success(`Tree "${name}" added!`);
    } else {
      toast.error("Failed to add tree.");
    }
  };

  const handleUpdateTree = async (treeId: string, newName: string) => {
    const updatedTree = await updateTree(treeId, { name: newName });
    if (updatedTree) {
      setTrees((prevTrees) =>
        prevTrees.map((tree) =>
          tree.id === treeId ? updatedTree : tree
        )
      );
      toast.success("Tree updated!");
    } else {
      toast.error("Failed to update tree.");
    }
  };

  const handleDeleteTree = async (treeId: string) => {
    const success = await deleteTree(treeId);
    if (success) {
      setTrees((prevTrees) => prevTrees.filter((tree) => tree.id !== treeId));
      setMembers((prevMembers) => prevMembers.filter((member) => member.tree_id !== treeId));
      if (selectedTreeId === treeId) {
        setSelectedTreeId(trees.length > 1 ? trees.filter(t => t.id !== treeId)[0].id : null);
      }
      toast.success("Tree deleted!");
    } else {
      toast.error("Failed to delete tree.");
    }
  };

  const handleAddMember = async (name: string) => {
    if (!selectedTreeId) {
      toast.error("Please select a tree first.");
      return;
    }
    const newMember: Omit<Member, "id" | "created_at"> = {
      tree_id: selectedTreeId,
      name,
    };
    const savedMember = await saveMember(newMember);
    if (savedMember) {
      setMembers((prevMembers) => [...prevMembers, savedMember]);
      toast.success(`Member "${name}" added to selected tree!`);
    } else {
      toast.error("Failed to add member.");
    }
  };

  const handleUpdateMember = async (memberId: string, newName: string) => {
    const updatedMember = await updateMember(memberId, { name: newName });
    if (updatedMember) {
      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === memberId ? updatedMember : member
        )
      );
      toast.success("Member updated!");
    } else {
      toast.error("Failed to update member.");
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    const success = await deleteMember(memberId);
    if (success) {
      setMembers((prevMembers) => prevMembers.filter((member) => member.id !== memberId));
      toast.success("Member deleted!");
    } else {
      toast.error("Failed to delete member.");
    }
  };

  const filteredMembers = selectedTreeId
    ? members.filter((member) => member.tree_id === selectedTreeId)
    : [];

  const memberCountByTree = members.reduce((acc, member) => {
    acc[member.tree_id] = (acc[member.tree_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex h-full">
      <aside className="w-80 border-r bg-sidebar text-sidebar-foreground p-4 flex flex-col">
        <TreeList
          trees={trees}
          selectedTreeId={selectedTreeId}
          onSelectTree={setSelectedTreeId}
          onAddTree={handleAddTree}
          onUpdateTree={handleUpdateTree}
          onDeleteTree={handleDeleteTree}
          memberCountByTree={memberCountByTree}
        />
      </aside>
      <main className="flex-1 p-6">
        {selectedTreeId ? (
          <MemberList
            members={filteredMembers}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold mb-4">No Tree Selected</h2>
            <p className="text-muted-foreground">Please add a new tree or select an existing one from the sidebar to view and add members.</p>
          </div>
        )}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default TaxPlannerPage;
