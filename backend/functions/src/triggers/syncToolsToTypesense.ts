/* eslint-disable object-curly-spacing */
import { typesenseClient } from "../config/typesense";
import { onDocumentWritten } from "firebase-functions/firestore";

export const syncToolsToTypesense = onDocumentWritten(
  "tools/{toolId}",
  async (event) => {
    console.log("Syncing tool to Typesense");
    console.log("Change:", event.data?.after);
    console.log("Function triggered for document:", event.params.toolId);
    const toolData = event.data?.after.exists ? event.data?.after.data() : null;
    const toolId = event.params.toolId;
    console.log("Tool data:", toolData);
    console.log("Tool ID:", toolId);

    if (!toolData) {
      // Tool was deleted, remove from Typesense
      try {
        await typesenseClient
          .collections("dev_tools")
          .documents(toolId)
          .delete();
        console.log(`Deleted tool ${toolId} from Typesense`);
      } catch (error) {
        console.error(`Error deleting tool ${toolId} from Typesense:`, error);
      }
      return null;
    }

    try {
      // Fetch category data
      const categoryDoc = await toolData.category.get();
      const categoryData = categoryDoc.data();
      console.log("Category data:", categoryData);

      // Fetch ecosystem data
      const ecosystemDoc = await toolData.ecosystem.get();
      const ecosystemData = ecosystemDoc.data();
      console.log("Ecosystem data:", ecosystemData);

      // Prepare the object to be indexed in Typesense
      const objectToIndex = {
        id: toolId,
        name: toolData.name,
        description: toolData.description,
        category: categoryData.name,
        ecosystem: ecosystemData.name,
        badges: toolData.badges,
        github_link: toolData.github_link,
        github_stars: toolData.github_stars,
        logo_url: toolData.logo_url,
        website_url: toolData.website_url,
        like_count: toolData.like_count || 0,
      };

      // Add or update the tool in Typesense
      await typesenseClient
        .collections("dev_tools")
        .documents()
        .upsert(objectToIndex);

      console.log(`Synced tool ${toolId} to Typesense`);
    } catch (error) {
      console.error(`Error syncing tool ${toolId} to Typesense:`, error);
    }

    return null;
  }
);
