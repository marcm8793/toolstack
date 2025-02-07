import DevToolsSkeleton from "@/components/skeletons/DevToolsSkeleton";
import { DevToolsTable } from "@/components/tooltable/devtools-table";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function getInitialData(searchParamsData: {
  pageKey?: string;
  pageSize: number;
}) {
  try {
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000";

    // Construct URL with pagination parameters
    const url = new URL(`${baseUrl}/api/tools`);
    if (searchParamsData.pageKey) {
      url.searchParams.set("pageKey", searchParamsData.pageKey);
    }
    url.searchParams.set("pageSize", searchParamsData.pageSize.toString());

    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error("Failed to fetch data:", await response.text());
      return {
        tools: [],
        categories: [],
        ecosystems: [],
        pagination: {
          hasMore: false,
          nextPageKey: null,
          pageSize: searchParamsData.pageSize,
        },
      };
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      tools: [],
      categories: [],
      ecosystems: [],
      pagination: {
        hasMore: false,
        nextPageKey: null,
        pageSize: searchParamsData.pageSize,
      },
    };
  }
}

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ pageKey?: string; pageSize?: string }>;
}) {
  // Await the searchParams
  const params = await searchParams;

  // Parse the pageSize with a default value
  const pageSize = params.pageSize ? parseInt(params.pageSize) : 10;

  // Create a data object for the getInitialData function
  const searchParamsData = {
    pageKey: params.pageKey,
    pageSize,
  };

  return (
    <Suspense fallback={<DevToolsSkeleton />}>
      <DevToolsTable initialData={await getInitialData(searchParamsData)} />
    </Suspense>
  );
}
