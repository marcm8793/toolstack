/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
/* eslint-disable object-curly-spacing */
import * as admin from "firebase-admin";
import Typesense from "typesense";
import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";
import dotenv from "dotenv";
import { resolve } from "path";
import { readFile } from "fs/promises";

dotenv.config();

let db: admin.firestore.Firestore;

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || "",
      port: parseInt(process.env.TYPESENSE_PORT || ""),
      protocol: process.env.TYPESENSE_PROTOCOL || "",
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || "",
  connectionTimeoutSeconds: 2,
  retryIntervalSeconds: 1,
  numRetries: 3,
});

const schema: CollectionCreateSchema = {
  name: "dev_tools",
  fields: [
    { name: "name", type: "string" },
    { name: "description", type: "string" },
    { name: "category", type: "string" },
    { name: "ecosystem", type: "string" },
    { name: "badges", type: "string[]" },
    { name: "github_link", type: "string", optional: true },
    { name: "github_stars", type: "int32", optional: true },
    { name: "logo_url", type: "string" },
    { name: "website_url", type: "string" },
    { name: "like_count", type: "int32" },
  ],
};

async function createCollectionIfNotExists() {
  try {
    const serviceAccountPath = resolve(__dirname, "../../pkFirebase-dev.json");
    const serviceAccount = JSON.parse(
      await readFile(serviceAccountPath, "utf-8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    db = admin.firestore();

    console.log("Testing Typesense connection...");
    const health = await typesenseClient.health.retrieve();
    console.log(`Typesense health: ${JSON.stringify(health)}`);

    await typesenseClient.collections("dev_tools").delete();
    console.log("Deleted existing collection");
  } catch (error) {
    if (error instanceof Typesense.Errors.ObjectNotFound) {
      await typesenseClient.collections().create(schema);
      console.log("Created new collection");
    } else {
      console.error("Connection failed. Verify:");
      console.log("- TYPESENSE_HOST:", process.env.TYPESENSE_HOST);
      console.log("- TYPESENSE_PORT:", process.env.TYPESENSE_PORT);
      throw error;
    }
  }
}

async function syncDataToTypesense() {
  await createCollectionIfNotExists();

  const toolsRef = db.collection("tools");
  const snapshot = await toolsRef.get();

  const batchSize = 50;
  let documents = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();

    if (!data.category || !data.ecosystem) {
      console.warn(`Skipping document ${doc.id} - missing category/ecosystem`);
      continue;
    }

    const [categoryDoc, ecosystemDoc] = await Promise.all([
      data.category.get(),
      data.ecosystem.get(),
    ]);

    documents.push({
      id: doc.id,
      name: data.name,
      description: data.description,
      category: categoryDoc.data().name,
      ecosystem: ecosystemDoc.data().name,
      badges: data.badges,
      github_link: data.github_link,
      github_stars: data.github_stars,
      logo_url: data.logo_url,
      website_url: data.website_url,
      like_count: data.like_count || 0,
    });

    if (documents.length >= batchSize) {
      await typesenseClient
        .collections("dev_tools")
        .documents()
        .import(documents);
      documents = [];
    }
  }

  if (documents.length > 0) {
    await typesenseClient
      .collections("dev_tools")
      .documents()
      .import(documents);
  }
}

async function main() {
  try {
    await syncDataToTypesense();
    console.log("Sync completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Sync failed:", error);
    process.exit(1);
  }
}

main();
