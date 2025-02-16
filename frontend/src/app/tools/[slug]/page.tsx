import { Suspense } from "react";
import { ToolDetailsClient } from "@/components/toolpage/tool-page";
import ToolDetailsSkeleton from "@/components/skeletons/ToolDetailsSkeleton";
import { Metadata, ResolvingMetadata } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
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

    return {
      title: `${tool.name} - ToolStack`,
      description: tool.description,
      openGraph: {
        title: `${tool.name} - ToolStack`,
        description: tool.description,
        images: [tool.logo_url, ...previousImages],
      },
      twitter: {
        card: "summary_large_image",
        title: `${tool.name} - ToolStack`,
        description: tool.description,
        images: [tool.logo_url],
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

export default async function ToolDetails(params: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params.params;

  return (
    <div className="md:container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<ToolDetailsSkeleton />}>
        <ToolDetailsClient slug={slug} />
      </Suspense>
    </div>
  );
}
