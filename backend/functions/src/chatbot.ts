/* eslint-disable indent */
/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-spacing */
/* eslint-disable require-jsdoc */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { pineconeClient } from "./config/pinecone";
import { getOpenAIClient } from "./config/openai";
import { RecordMetadata } from "@pinecone-database/pinecone";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import { getRootUrl } from "./config/root-url";

function generateContext(
  matches: ScoredPineconeRecord<RecordMetadata>[]
): string {
  return matches
    .map((match) => {
      const tool = match.metadata;
      const toolSlug = tool?.name
        ? encodeURIComponent(
            tool.name.toString().toLowerCase().replace(/\s+/g, "-")
          )
        : "";
      const toolLink = `${getRootUrl()}/tools/${match.id}-${toolSlug}`;
      if (!tool) return "";
      return `Tool: ${tool.name}
Description: ${tool.description}
Website: ${toolLink}
Category: ${tool.category}
Ecosystem: ${tool.ecosystem}
${
  tool.badges && Array.isArray(tool.badges)
    ? `Tags: ${tool.badges.join(", ")}`
    : ""
}`;
    })
    .join("\n\n");
}

export const generateChatResponse = onCall(
  { secrets: ["OPENAI_API_KEY", "PINECONE_API_KEY", "PROJECT_ENV"] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    // Input validation
    const { messages, toolQuery } = request.data;
    if (!messages || !toolQuery) {
      throw new HttpsError(
        "invalid-argument",
        "Messages and toolQuery are required"
      );
    }

    try {
      // Timing the embedding generation for monitoring
      console.time("Generate Embedding");
      const embeddingResponse = await getOpenAIClient().embeddings.create({
        model: "text-embedding-3-small",
        input: toolQuery,
        dimensions: 1536,
      });
      console.timeEnd("Generate Embedding");

      const queryEmbedding = embeddingResponse.data[0].embedding;

      // Timing the Pinecone query for monitoring
      console.time("Pinecone Query");
      const searchResults = await pineconeClient.pineconeIndex().query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
      });
      console.timeEnd("Pinecone Query");

      // Prepare context from search results
      const context = generateContext(searchResults.matches);

      // Build system message with the context
      const systemMessage = {
        role: "system",
        content: `You are a helpful assistant for ToolStack, a platform for
        discovering developer tools.
Use the following context about tools to answer questions:
${context}

Whenever you propose a developer tool, please include its website link
provided in the context. If you don't find relevant information in the
context, provide general guidance about developer tools.
Always be friendly and concise.`,
      };

      console.time("Chat Completion");
      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      });
      console.timeEnd("Chat Completion");

      return {
        message: response.choices[0].message.content,
      };
    } catch (error) {
      console.error("Error:", error);
      throw new HttpsError("internal", "Failed to generate response");
    }
  }
);
