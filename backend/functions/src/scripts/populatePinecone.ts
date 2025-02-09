/* eslint-disable object-curly-spacing */
/* eslint-disable require-jsdoc */
import * as admin from "firebase-admin";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { resolve } from "path";
import { readFile } from "fs/promises";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

const INDEX_NAME = "toolstack-tools-dev";

async function createIndexIfNotExists() {
  try {
    const serviceAccountPath = resolve(__dirname, "../../pkFirebase-dev.json");
    const serviceAccount = JSON.parse(
      await readFile(serviceAccountPath, "utf-8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    await pinecone.createIndex({
      name: INDEX_NAME,
      dimension: 1536, // dimension for text-embedding-3-small
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
    console.log("Index created successfully");
  } catch (error: unknown) {
    if (error instanceof Error && error.message?.includes("already exists")) {
      console.log("Index already exists");
    } else {
      throw error;
    }
  }
}

async function populatePinecone() {
  const index = pinecone.index(INDEX_NAME);
  const db = admin.firestore();

  try {
    const toolsSnapshot = await db.collection("tools").get();
    console.log(`Processing ${toolsSnapshot.size} tools...`);

    for (const doc of toolsSnapshot.docs) {
      const toolData = doc.data();
      const toolId = doc.id;

      const categoryDoc = await toolData.category.get();
      const ecosystemDoc = await toolData.ecosystem.get();
      const categoryData = categoryDoc.data();
      const ecosystemData = ecosystemDoc.data();

      const textToEmbed = `
        Tool: ${toolData.name}
        Description: ${toolData.description}
        Category: ${categoryData.name}
        Ecosystem: ${ecosystemData.name}
        ${toolData.badges ? `Tags: ${toolData.badges.join(", ")}` : ""}
        Github Link: ${toolData.github_link ? toolData.github_link : ""}
        Github Stars: ${toolData.github_stars ? toolData.github_stars : ""}
        Website URL: ${toolData.website_url}
      `.trim();

      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: textToEmbed,
      });

      await index.upsert([
        {
          id: toolId,
          values: embedding.data[0].embedding,
          metadata: {
            name: toolData.name,
            description: toolData.description,
            category: categoryData.name,
            ecosystem: ecosystemData.name,
            badges: toolData.badges,
            github_link: toolData.github_link ? toolData.github_link : "",
            github_stars: toolData.github_stars ? toolData.github_stars : "",
            website_url: toolData.website_url,
          },
        },
      ]);

      console.log(`Processed tool: ${toolData.name}`);
    }

    console.log("Pinecone population completed successfully");
  } catch (error) {
    console.error("Error populating Pinecone:", error);
  } finally {
    admin.app().delete();
  }
}

const main = async () => {
  await createIndexIfNotExists();
  await populatePinecone();
};

main().catch(console.error);
