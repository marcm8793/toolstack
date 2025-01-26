import { DevToolsTable } from "@/components/tooltable/devtools-table";

export const dynamic = "force-dynamic";

async function getInitialData() {
  try {
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/tools`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error("Failed to fetch data:", await response.text());
      return [];
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

export default async function ToolsPage() {
  const initialData = await getInitialData();

  return <DevToolsTable initialData={initialData} />;
}
