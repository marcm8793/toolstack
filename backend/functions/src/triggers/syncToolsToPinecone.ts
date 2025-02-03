/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-spacing */
/* eslint-disable require-jsdoc */
import { pineconeClient } from "../config/pinecone";
import { getEmbedding } from "../utils";
import { onDocumentWritten } from "firebase-functions/v2/firestore";

export const syncToolsToPinecone = onDocumentWritten(
  {
    document: "tools/{toolId}",
    secrets: ["OPENAI_API_KEY", "PINECONE_API_KEY", "NODE_ENV"],
  },
  async (event) => {
    const toolData = event.data?.after.exists ? event.data.after.data() : null;
    const toolId = event.params.toolId;
    const index = pineconeClient.pineconeIndex();
    let countTool = 0;

    try {
      if (!toolData) {
        // Tool was deleted, remove from Pinecone
        await index.deleteOne(toolId);
        return null;
      }

      // Fetch category and ecosystem data
      const categoryDoc = await toolData.category.get();
      const ecosystemDoc = await toolData.ecosystem.get();
      const categoryData = categoryDoc.data();
      const ecosystemData = ecosystemDoc.data();

      // Create the text to be embedded
      const textToEmbed = `
        Tool: ${toolData.name}
        Description: ${toolData.description}
        Category: ${categoryData.name}
        Ecosystem: ${ecosystemData.name}
        ${toolData.badges ? `Tags: ${toolData.badges.join(", ")}` : ""}
      `.trim();

      // Generate embedding
      const embedding = await getEmbedding(textToEmbed);

      // Upsert to Pinecone
      await index.upsert([
        {
          id: toolId,
          values: embedding,
          metadata: {
            name: toolData.name,
            description: toolData.description,
            category: categoryData.name,
            ecosystem: ecosystemData.name,
            badges: toolData.badges,
            github_link: toolData.github_link || "",
            github_stars: toolData.github_stars || "",
            website_url: toolData.website_url,
          },
        },
      ]);

      countTool++;
      console.log(`Successfully synced tool ${countTool} to Pinecone`);
    } catch (error) {
      console.error(`Error syncing tool ${toolId} to Pinecone:`, error);
    }

    return null;
  }
);
