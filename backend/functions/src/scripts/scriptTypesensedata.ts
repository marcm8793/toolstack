/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
/* eslint-disable object-curly-spacing */
import * as admin from "firebase-admin";
import Typesense from "typesense";
import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";
import { resolve } from "path";
import { readFileSync } from "fs";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import readline from "readline";

let db: admin.firestore.Firestore;
let app: admin.app.App | undefined;

const promptEnvironment = async (): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "Which environment do you want to use? (dev/prod): ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase());
      }
    );
  });
};

async function initialize() {
  const env = await promptEnvironment();
  const serviceAccountPath = resolve(__dirname, `../../pkFirebase-${env}.json`);
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

  if (!app) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  db = admin.firestore();

  const projectId = serviceAccount.project_id;
  console.log("projectId", projectId);

  return { projectId };
}

const getEnvironmentConfig = async (projectId: string) => {
  const client = new SecretManagerServiceClient();

  const [nodeEnvResponse] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/NODE_ENV/versions/latest`,
  });
  const [typesenseHostResponse] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/TYPESENSE_HOST/versions/latest`,
  });
  const [typesenseApiKeyResponse] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/TYPESENSE_API_KEY/versions/latest`,
  });

  const environment = nodeEnvResponse.payload?.data?.toString() || "dev";
  const typesenseHost = typesenseHostResponse.payload?.data?.toString() || "";
  const typesenseApiKey =
    typesenseApiKeyResponse.payload?.data?.toString() || "";

  return {
    environment,
    collectionName: environment === "prod" ? "dev_tools" : "dev_tools",
    typesenseHost,
    typesenseApiKey,
  };
};

const initTypesenseClient = async () => {
  const { projectId } = await initialize();
  const config = await getEnvironmentConfig(projectId);
  return new Typesense.Client({
    nodes: [
      {
        host: config.typesenseHost,
        port: 443,
        protocol: "https",
      },
    ],
    apiKey: config.typesenseApiKey,
    connectionTimeoutSeconds: 10,
    retryIntervalSeconds: 1,
    numRetries: 5,
  });
};

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
    const typesenseClient = await initTypesenseClient();

    console.log("Testing Typesense connection...");
    const health = await typesenseClient.health.retrieve();
    console.log(`Typesense health: ${JSON.stringify(health)}`);

    await typesenseClient.collections("dev_tools").delete();
    console.log("Deleted existing collection");

    await typesenseClient.collections().create(schema);
    console.log("Created new collection" + schema.name);

    return typesenseClient;
  } catch (error) {
    console.error("Connection failed. Verify:");
    console.log("- TYPESENSE_HOST:", process.env.TYPESENSE_HOST);
    console.log("- TYPESENSE_PORT:", process.env.TYPESENSE_PORT);
    throw error;
  }
}

async function syncDataToTypesense() {
  const typesenseClient = await createCollectionIfNotExists();

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
