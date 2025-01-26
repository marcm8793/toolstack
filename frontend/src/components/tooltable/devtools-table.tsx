"use client";

import { useCallback, useState, useEffect } from "react";
import { columns } from "@/components/tooltable/Columns";
import { DataTable } from "@/components/tooltable/data-table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { Category, DevTool, EcoSystem, Like } from "@/types/index";
import {
  doc,
  setDoc,
  deleteDoc,
  increment,
  query,
  where,
  getDocs,
  collection,
  Timestamp,
} from "firebase/firestore";

interface DevToolsTableProps {
  initialData: {
    tools: DevTool[];
    categories: Category[];
    ecosystems: EcoSystem[];
  };
}

export function DevToolsTable({ initialData }: DevToolsTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tools, setTools] = useState(initialData.tools);
  const [likedTools, setLikedTools] = useState<string[]>([]);

  const fetchLikedTools = useCallback(async () => {
    if (!user) {
      setLikedTools([]);
      return;
    }

    try {
      const likesRef = collection(db, "likes");
      const q = query(likesRef, where("user_id", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const likedToolIds = querySnapshot.docs.map((doc) => doc.data().tool_id);
      setLikedTools(likedToolIds);
    } catch (error) {
      console.error("Error fetching liked tools:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchLikedTools();
  }, [fetchLikedTools]);

  const handleLikeToggle = useCallback(
    async (toolId: string, toolName: string, isLiked: boolean) => {
      if (!user) return;

      try {
        const likeId = `${user.uid}_${toolId}`;
        const likeRef = doc(db, "likes", likeId);
        const toolRef = doc(db, "tools", toolId);

        if (isLiked) {
          const newLike: Like = {
            id: likeId,
            user_id: user.uid,
            tool_id: toolId,
            liked_at: Timestamp.now(),
          };
          await setDoc(likeRef, newLike);
          await setDoc(toolRef, { like_count: increment(1) }, { merge: true });
          setLikedTools((prev) => [...prev, toolId]);
          toast({
            title: "Tool Liked",
            description: `You have liked ${toolName}.`,
          });
        } else {
          await deleteDoc(likeRef);
          await setDoc(toolRef, { like_count: increment(-1) }, { merge: true });
          setLikedTools((prev) => prev.filter((id) => id !== toolId));
          toast({
            title: "Tool Unliked",
            description: `You have unliked ${toolName}.`,
          });
        }

        setTools((prevTools) =>
          prevTools.map((tool) =>
            tool.id === toolId
              ? {
                  ...tool,
                  like_count: (tool.like_count || 0) + (isLiked ? 1 : -1),
                }
              : tool
          )
        );
      } catch (error) {
        console.error("Error toggling like:", error);
        toast({
          title: "Error",
          description:
            "An error occurred while updating your like. Please try again.",
          variant: "destructive",
        });
      }
    },
    [user, toast]
  );

  const updatedColumns = columns({
    categories: initialData.categories,
    ecosystems: initialData.ecosystems,
    likedTools,
    onLikeToggle: handleLikeToggle,
    currentUser: user,
  });

  return (
    <div className="container h-full flex-1 flex-col space-y-8 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Discover the best tools for developers
          </h2>
          <p className="text-muted-foreground hidden md:flex">
            Find your next package to help you build faster and smarter. Filter
            and click on a tool to learn more!
          </p>
        </div>
      </div>
      <DataTable
        data={tools}
        columns={updatedColumns}
        categories={initialData.categories}
        ecosystems={initialData.ecosystems}
        likedTools={likedTools}
      />
    </div>
  );
}
