import { DevToolsTable } from "@/components/tooltable/devtools-table";

async function getInitialData() {
  const response = await fetch(
    // TODO: change to use env variable
    `${
      process.env.VERCEL_PROJECT_PRODUCTION_URL || "http://localhost:3000"
    }/api/tools`,
    {
      next: { revalidate: 60 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
}

export default async function ToolsPage() {
  const initialData = await getInitialData();

  return <DevToolsTable initialData={initialData} />;
}
