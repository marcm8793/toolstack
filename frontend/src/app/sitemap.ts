import { DevTool } from "@/types";
import { MetadataRoute } from "next";

const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

async function getTools() {
  try {
    const response = await fetch(`${baseUrl}/api/tools`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch tools for sitemap:",
        await response.text()
      );
      return [];
    }

    const data = await response.json();
    return data.tools;
  } catch (error) {
    console.error("Error fetching tools for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tools = await getTools();

  // Base URLs
  const baseUrls = [
    {
      url: "https://toolstack.pro",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://toolstack.pro/tools",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ] as const;

  // Tool URLs
  const toolUrls = tools.map((tool: DevTool) => {
    return {
      url: `${baseUrl}/tools/${tool.id}-${encodeURIComponent(
        tool.name.toLowerCase().replace(/\s+/g, "-")
      )}`,
      lastModified: new Date(tool.updated_at.seconds * 1000).toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [
        tool.logo_url
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;"),
      ],
    };
  });

  return [...baseUrls, ...toolUrls];
}
