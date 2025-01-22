/* eslint-disable object-curly-spacing */
/* eslint-disable quotes */
/* eslint-disable require-jsdoc */
import * as admin from "firebase-admin";
import * as fs from "fs/promises";
import { Parser } from "json2csv";
import { resolve } from "path";
import { readFile } from "fs/promises";

const db = admin.firestore();

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  ecosystem: string;
  badges: string;
  github_link: string;
  github_stars: number;
  logo_url: string;
  website_url: string;
  like_count: number;
  created_at: string;
  updated_at: string;
}

async function extractTools() {
  try {
    const serviceAccountPath = resolve(__dirname, "../../pkFirebase-prod.json");
    const serviceAccount = JSON.parse(
      await readFile(serviceAccountPath, "utf-8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    const toolsRef = db.collection("tools");
    const snapshot = await toolsRef.get();
    const tools: Tool[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const categoryDoc = await data.category.get();
      const ecosystemDoc = await data.ecosystem.get();

      const tool: Tool = {
        id: doc.id,
        name: data.name,
        description: data.description.replace(/\r?\n|\r/g, " "),
        category: categoryDoc.data().name,
        ecosystem: ecosystemDoc.data().name,
        badges: data.badges.join(", "), // Join badges into a single string
        github_link: data.github_link || null,
        github_stars: data.github_stars || null,
        logo_url: data.logo_url,
        website_url: data.website_url,
        like_count: data.like_count || 0,
        created_at: data.created_at.toDate().toISOString(),
        updated_at: data.updated_at.toDate().toISOString(),
      };

      tools.push(tool);
    }

    // Use json2csv to create CSV content with proper escaping and quoting
    const parser = new Parser({
      delimiter: ",",
      header: true,
      eol: "\r\n",
      quote: '"',
      escapedQuote: '""',
    });
    const csvContent = parser.parse(tools);

    // Write CSV content to file using fs.promises
    await fs.writeFile("extractedTools.csv", csvContent, "utf8");
    console.log("CSV file has been saved.");
  } catch (error) {
    console.error("Error extracting tools:", error);
  } finally {
    // Close the Firebase Admin SDK connection
    admin.app().delete();
  }
}

extractTools();
