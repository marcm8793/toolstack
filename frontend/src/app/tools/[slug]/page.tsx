import { Suspense } from "react";
import { ToolDetailsClient } from "@/components/toolpage/tool-page";
import ToolDetailsSkeleton from "@/components/skeletons/ToolDetailsSkeleton";
import { Metadata, ResolvingMetadata } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  // Get the tool ID from the slug
  const [id] = slug.split("-");

  try {
    // Fetch tool data from Firestore
    const toolDoc = await getDoc(doc(db, "tools", id));
    const tool = toolDoc.exists() ? toolDoc.data() : null;

    // Get parent metadata (from root layout.tsx)
    const previousImages = (await parent).openGraph?.images || [];

    if (!tool) {
      return {
        title: "Tool Not Found - ToolStack",
        description: "The requested tool could not be found.",
      };
    }

    // Fix: Use a more robust method to create slugs
    const correctSlug = `${id}-${tool.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special chars except whitespace and dash
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/-+/g, "-") // Replace multiple dashes with single dash
      .trim()}`; // Trim leading/trailing whitespace

    // Redirect if the slug does not match the canonical slug
    if (slug !== correctSlug) {
      redirect(`/tools/${correctSlug}`);
    }

    // Get category name if it exists
    let categoryName = "";
    if (tool.category && tool.category.id) {
      try {
        const categoryDoc = await getDoc(
          doc(db, "categories", tool.category.id)
        );
        if (categoryDoc.exists()) {
          categoryName = categoryDoc.data().name || "";
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    }

    // Get ecosystem name if it exists
    let ecosystemName = "";
    if (tool.ecosystem && tool.ecosystem.id) {
      try {
        const ecosystemDoc = await getDoc(
          doc(db, "ecosystems", tool.ecosystem.id)
        );
        if (ecosystemDoc.exists()) {
          ecosystemName = ecosystemDoc.data().name || "";
        }
      } catch (error) {
        console.error("Error fetching ecosystem:", error);
      }
    }

    // Create dynamic OG Image URL
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000";

    const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(
      tool.name
    )}&description=${encodeURIComponent(
      tool.description
    )}&logo=${encodeURIComponent(tool.logo_url)}&category=${encodeURIComponent(
      categoryName
    )}&ecosystem=${encodeURIComponent(
      ecosystemName
    )}&github_stars=${encodeURIComponent(
      tool.github_stars ? tool.github_stars.toString() : ""
    )}`;

    return {
      title: `${tool.name} - ToolStack`,
      description: tool.description,
      openGraph: {
        title: `${tool.name} - ToolStack`,
        description: tool.description,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${tool.name} - ToolStack`,
          },
          ...previousImages,
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${tool.name} - ToolStack`,
        description: tool.description,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Tool Details - ToolStack",
      description: "View detailed information about this developer tool.",
    };
  }
}

export default async function ToolDetails({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="md:container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<ToolDetailsSkeleton />}>
        <ToolDetailsClient slug={slug} />
      </Suspense>
    </div>
  );
}
