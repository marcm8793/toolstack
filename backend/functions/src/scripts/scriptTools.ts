/* eslint-disable object-curly-spacing */
/* eslint-disable require-jsdoc */
import * as admin from "firebase-admin";
import * as fs from "fs";
import { Readable } from "stream";
import dotenv from "dotenv";
import { resolve } from "path";
import { readFile } from "fs/promises";
import path from "path";

dotenv.config();

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Define interface for Tool
interface Tool {
  tool_id: string;
  name: string;
  description: string;
  category_id: string;
  ecosystem_id: string;
  github_link: string;
  github_stars: number;
  logo_url: string;
  website_url: string;
  badges: string[];
}

// Function to upload image to Firebase Storage
async function uploadImage(imageUrl: string, toolId: string): Promise<string> {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `tool-logos/${toolId}${path.extname(imageUrl)}`;
  const file = bucket.file(filename);

  await new Promise((resolve, reject) => {
    const stream = Readable.from(buffer);
    stream
      .pipe(
        file.createWriteStream({
          metadata: {
            contentType: response.headers.get("content-type") || "image/png",
          },
        })
      )
      .on("error", reject)
      .on("finish", resolve);
  });

  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

// Function to add tools to Firestore
async function addTools(tools: Tool[]) {
  const batch = db.batch();
  for (const tool of tools) {
    // Upload image and get new URL
    const newLogoUrl = await uploadImage(tool.logo_url, tool.tool_id);

    const docRef = db.collection("tools").doc(tool.tool_id);
    batch.set(docRef, {
      ...tool,
      logo_url: newLogoUrl,
      category: db.doc(`categories/${tool.category_id}`),
      ecosystem: db.doc(`ecosystems/${tool.ecosystem_id}`),
    });
  }
  await batch.commit();
  console.log(`Added ${tools.length} tools to Firestore`);
}

// Function to validate category and ecosystem existence
async function validateReferences(tools: Tool[]): Promise<boolean> {
  const categoryIds = new Set(tools.map((tool) => tool.category_id));
  const ecosystemIds = new Set(tools.map((tool) => tool.ecosystem_id));

  const categoryDocs = await db
    .collection("categories")
    .where(
      admin.firestore.FieldPath.documentId(),
      "in",
      Array.from(categoryIds)
    )
    .get();
  const ecosystemDocs = await db
    .collection("ecosystems")
    .where(
      admin.firestore.FieldPath.documentId(),
      "in",
      Array.from(ecosystemIds)
    )
    .get();

  let isValid = true;

  const existingCategoryIds = new Set(categoryDocs.docs.map((doc) => doc.id));
  const missingCategoryIds = Array.from(categoryIds).filter(
    (id) => !existingCategoryIds.has(id)
  );
  if (missingCategoryIds.length > 0) {
    console.error("Missing category IDs:", missingCategoryIds);
    isValid = false;
  }

  const existingEcosystemIds = new Set(ecosystemDocs.docs.map((doc) => doc.id));
  const missingEcosystemIds = Array.from(ecosystemIds).filter(
    (id) => !existingEcosystemIds.has(id)
  );
  if (missingEcosystemIds.length > 0) {
    console.error("Missing ecosystem IDs:", missingEcosystemIds);
    isValid = false;
  }

  return isValid;
}

// Main function to populate the database with tools
async function populateTools() {
  try {
    const serviceAccountPath = resolve(__dirname, "../../pkFirebase-prod.json");
    const serviceAccount = JSON.parse(
      await readFile(serviceAccountPath, "utf-8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    // Read tools from JSON file
    const toolsData: string = fs.readFileSync("./data//tools.json", "utf-8");
    const tools: Tool[] = JSON.parse(toolsData);

    // Validate category and ecosystem references
    const isValid = await validateReferences(tools);
    if (!isValid) {
      console.error(
        "Validation failed. Please check your category and ecosystem IDs."
      );
      return;
    }

    // Add tools to Firestore (this will also upload images)
    await addTools(tools);

    console.log("Tools population completed successfully");
  } catch (error) {
    console.error("Error populating tools:", error);
  } finally {
    // Close the Firebase Admin SDK connection
    admin.app().delete();
  }
}

// Run the population script
populateTools();
