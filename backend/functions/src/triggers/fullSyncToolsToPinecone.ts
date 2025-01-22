/* eslint-disable object-curly-spacing */
/* eslint-disable operator-linebreak */
/* eslint-disable require-jsdoc */
/* eslint-disable valid-jsdoc */
import { onRequest } from "firebase-functions/v2/https";
import { pineconeClient } from "../config/pinecone";
import * as admin from "firebase-admin";
import { sendTelegramMessage } from "../config/telegram";
import OpenAI from "openai";
import * as functions from "firebase-functions";

const INDEX_NAME =
  functions.config().environment.prod === "true"
    ? "toolstack-tools-prod"
    : "toolstack-tools-dev";

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// Helper function to chunk array into smaller batches
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export const fullSyncToolsToPinecone = onRequest(
  {
    memory: "2GiB",
    timeoutSeconds: 540,
  },
  async (req, res) => {
    console.log("Starting full sync to Pinecone");
    const index = pineconeClient.index(INDEX_NAME);
    const db = admin.firestore();

    try {
      const toolsSnapshot = await db.collection("tools").get();
      const totalTools = toolsSnapshot.size;
      let successCount = 0;
      let errorCount = 0;
      const logMessages: string[] = [];

      // Process tools in batches of 50
      const toolBatches = chunkArray(toolsSnapshot.docs, 50);

      for (const [batchIndex, batch] of toolBatches.entries()) {
        console.log(`Processing batch ${batchIndex + 1}/${toolBatches.length}`);

        // Process each batch with a delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Process tools in parallel within each batch
        const batchPromises = batch.map(async (doc) => {
          try {
            const toolData = doc.data();
            const toolId = doc.id;

            // Fetch related data in parallel
            const [categoryDoc, ecosystemDoc] = await Promise.all([
              toolData.category.get(),
              toolData.ecosystem.get(),
            ]);

            const categoryData = categoryDoc.data();
            const ecosystemData = ecosystemDoc.data();

            const textToEmbed = `
              Tool: ${toolData.name}
              Description: ${toolData.description}
              Category: ${categoryData.name}
              Ecosystem: ${ecosystemData.name}
              ${toolData.badges ? `Tags: ${toolData.badges.join(", ")}` : ""}
            `.trim();

            const embedding = await getEmbedding(textToEmbed);

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

            successCount++;
            return null;
          } catch (error) {
            errorCount++;
            console.error(`Error syncing tool ${doc.id}:`, error);
            return `❌ Error syncing tool: ${doc.id}`;
          }
        });

        // Wait for all tools in the batch to complete
        const batchResults = await Promise.all(batchPromises);
        logMessages.push(
          ...batchResults.filter((result): result is string => result !== null)
        );

        // Send intermediate progress update
        if (logMessages.length >= 100) {
          await sendTelegramMessage(logMessages.join("\n"));
          logMessages.length = 0; // Clear the array
        }
      }

      // Send any remaining log messages
      if (logMessages.length > 0) {
        await sendTelegramMessage(logMessages.join("\n"));
      }

      const summaryMessage = `
📊 Pinecone Sync Summary
Total tools processed: ${totalTools}
✅ Successful syncs: ${successCount}
❌ Failed syncs: ${errorCount}
Success rate: ${((successCount / totalTools) * 100).toFixed(1)}%
      `.trim();

      await sendTelegramMessage(summaryMessage);

      res.json({
        success: true,
        summary: summaryMessage,
        details: {
          totalTools,
          successCount,
          errorCount,
          successRate: ((successCount / totalTools) * 100).toFixed(1),
        },
      });
    } catch (error) {
      const errorMessage = `❌ Critical error in Pinecone sync: ${error}`;
      console.error(errorMessage);
      await sendTelegramMessage(errorMessage);
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
);
