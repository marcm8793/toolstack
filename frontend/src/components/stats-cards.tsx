"use client";

import { Card } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";

export function CompactStatsCard() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const toolsColl = collection(db, "tools");
      const categoriesColl = collection(db, "categories");
      const ecosystemsColl = collection(db, "ecosystems");

      const [toolsSnapshot, categoriesSnapshot, ecosystemsSnapshot] =
        await Promise.all([
          getCountFromServer(toolsColl),
          getCountFromServer(categoriesColl),
          getCountFromServer(ecosystemsColl),
        ]);

      return {
        tools: toolsSnapshot.data().count,
        categories: categoriesSnapshot.data().count,
        ecosystems: ecosystemsSnapshot.data().count,
      };
    },
  });

  if (error) {
    console.error("Error fetching stats:", error);
  }

  return (
    <Card className="p-2 dark:bg-neutral-900/50">
      <div className="grid grid-cols-3 text-center">
        {/* Tools Stat */}
        <div className="flex flex-col space-y-1">
          <span className="font-bold dark:text-neutral-100">
            {isLoading ? (
              <Skeleton className="h-7 w-10 mx-auto" />
            ) : (
              stats?.tools
            )}
          </span>
          <span className="text-sm text-muted-foreground">Tools</span>
        </div>

        {/* Categories Stat */}
        <div className="flex flex-col space-y-1 border-x dark:border-neutral-800">
          <span className="font-bold dark:text-neutral-100">
            {isLoading ? (
              <Skeleton className="h-7 w-10 mx-auto" />
            ) : (
              stats?.categories
            )}
          </span>
          <span className="text-sm text-muted-foreground">Categories</span>
        </div>

        {/* Ecosystems Stat */}
        <div className="flex flex-col space-y-1">
          <span className="font-bold dark:text-neutral-100">
            {isLoading ? (
              <Skeleton className="h-7 w-10 mx-auto" />
            ) : (
              stats?.ecosystems
            )}
          </span>
          <span className="text-sm text-muted-foreground">Ecosystems</span>
        </div>
      </div>
    </Card>
  );
}
