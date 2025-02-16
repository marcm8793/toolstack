"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { DevTool, Category, EcoSystem, Like } from "@/types/index";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  increment,
  Timestamp,
} from "firebase/firestore";
import { ArrowLeft, ExternalLink, Github, Star, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CommentSection } from "@/components/CommentSection";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import ToolDetailsSkeleton from "../skeletons/ToolDetailsSkeleton";

interface ToolDetailsClientProps {
  slug: string;
}

export function ToolDetailsClient({ slug }: ToolDetailsClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [tool, setTool] = useState<DevTool | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [ecosystem, setEcosystem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const fetchToolDetails = useCallback(async () => {
    try {
      const [id] = slug.split("-");
      const toolDoc = await getDoc(doc(db, "tools", id));

      if (toolDoc.exists()) {
        const toolData = { id: toolDoc.id, ...toolDoc.data() } as DevTool;
        setTool(toolData);

        // Generate the correct slug
        const correctSlug = `${id}-${encodeURIComponent(
          toolData.name.toLowerCase().replace(/\s+/g, "-")
        )}`;

        // If the slug in the URL doesn't match the correct slug, update the URL
        if (slug !== correctSlug) {
          router.push(`/tools/${correctSlug}`);
        }

        // Fetch category
        if (toolData.category) {
          const categoryDoc = await getDoc(toolData.category);
          if (categoryDoc.exists()) {
            setCategory((categoryDoc.data() as Category).name);
          } else {
            setCategory("Uncategorized");
          }
        } else {
          setCategory("Uncategorized");
        }

        // Fetch ecosystem
        if (toolData.ecosystem) {
          const ecosystemDoc = await getDoc(toolData.ecosystem);
          if (ecosystemDoc.exists()) {
            setEcosystem((ecosystemDoc.data() as EcoSystem).name);
          } else {
            setEcosystem("Uncategorized");
          }
        } else {
          setEcosystem("Uncategorized");
        }

        // Check if the tool is liked by the current user
        if (user) {
          const likeDoc = await getDoc(doc(db, "likes", `${user.uid}_${id}`));
          setIsLiked(likeDoc.exists());
        } else {
          setIsLiked(false);
        }
      } else {
        setError("Tool not found");
      }
    } catch (err) {
      console.error("Error fetching tool details:", err);
      setError("Failed to fetch tool details");
    } finally {
      setLoading(false);
    }
  }, [slug, router, user]);

  useEffect(() => {
    fetchToolDetails();
  }, [fetchToolDetails]);

  useEffect(() => {
    if (!user) {
      setIsLiked(false);
    } else {
      fetchToolDetails();
    }
  }, [user, fetchToolDetails]);

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like this tool.",
        action: (
          <Button onClick={() => router.push("/signin")} variant="outline">
            Sign In
          </Button>
        ),
      });
      return;
    }

    if (!tool) return;

    try {
      const likeId = `${user.uid}_${tool.id}`;
      const likeRef = doc(db, "likes", likeId);
      const toolRef = doc(db, "tools", tool.id!);

      if (!isLiked) {
        const newLike: Like = {
          id: likeId,
          user_id: user.uid,
          tool_id: tool.id,
          liked_at: Timestamp.now(),
        };
        await setDoc(likeRef, newLike);
        await setDoc(toolRef, { like_count: increment(1) }, { merge: true });
        setIsLiked(true);
        setTool((prevTool) =>
          prevTool
            ? { ...prevTool, like_count: (prevTool.like_count || 0) + 1 }
            : null
        );
        toast({
          title: "Tool Liked",
          description: `You have liked ${tool.name}.`,
        });
      } else {
        await deleteDoc(likeRef);
        await setDoc(toolRef, { like_count: increment(-1) }, { merge: true });
        setIsLiked(false);
        setTool((prevTool) =>
          prevTool
            ? { ...prevTool, like_count: (prevTool.like_count || 1) - 1 }
            : null
        );
        toast({
          title: "Tool Unliked",
          description: `You have unliked ${tool.name}.`,
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description:
          "An error occurred while updating your like. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <ToolDetailsSkeleton />;
  if (error) return <div>Error: {error}</div>;
  if (!tool) return <div>Tool not found</div>;

  return (
    <>
      <Button
        onClick={() => router.push("/tools")}
        className="mb-6"
        variant="outline"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative w-24 h-24 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md">
              <Image
                src={tool.logo_url}
                alt={`${tool.name} logo`}
                height={100}
                width={100}
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            <div className="text-center sm:text-left flex-grow w-full">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start">
                <div>
                  <CardTitle className="text-2xl sm:text-3xl font-bold">
                    {tool.name}
                  </CardTitle>
                  <p className="text-muted-foreground">{category}</p>
                  <p className="text-muted-foreground">{ecosystem}</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 sm:mt-0"
                >
                  <Heart
                    className={`h-8 w-8 sm:h-6 sm:w-6 cursor-pointer ${
                      isLiked ? "text-red-500 fill-current" : "text-gray-300"
                    }`}
                    onClick={handleLikeToggle}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="mt-2">{tool.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Features</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {tool.badges.map((badge, index) => (
                  <Badge key={index} variant="secondary">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {tool.github_link ? (
                <Link
                  href={tool.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:underline"
                >
                  <Github className="mr-2" size={20} />
                  GitHub Repository
                  <ExternalLink size={16} className="ml-1" />
                </Link>
              ) : (
                <span>No GitHub Repository</span>
              )}
              {tool.github_stars && (
                <div className="flex items-center">
                  <Star className="mr-1 text-yellow-400" size={20} />
                  <span>{tool.github_stars.toLocaleString()} stars</span>
                </div>
              )}
            </div>

            {tool.website_url && (
              <div>
                <h3 className="text-lg font-semibold">Website</h3>
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline break-all"
                >
                  {tool.website_url}
                  <ExternalLink size={16} className="ml-1 inline" />
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <CommentSection toolId={tool.id!} />
    </>
  );
}
