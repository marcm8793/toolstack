/* eslint-disable indent */
/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-spacing */
/* eslint-disable require-jsdoc */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { pineconeClient } from "./config/pinecone";
import { getOpenAIClient } from "./config/openai";

export const generateChatResponse = onCall(
  { secrets: ["OPENAI_API_KEY", "PINECONE_API_KEY"] },
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
      // Generate embedding for the query
      const queryEmbedding = await getOpenAIClient().embeddings.create({
        model: "text-embedding-3-small",
        input: toolQuery,
        dimensions: 1536,
      });

      // Search Pinecone for relevant tools
      const searchResults = await pineconeClient.pineconeIndex().query({
        vector: queryEmbedding.data[0].embedding,
        topK: 5,
        includeMetadata: true,
      });

      // Prepare context from relevant tools
      const context = searchResults.matches
        .map((match) => {
          const tool = match.metadata;
          if (!tool) return "";
          return `Tool: ${tool.name}
              Description: ${tool.description}
              Category: ${tool.category}
              Ecosystem: ${tool.ecosystem}    ${
            tool.badges && Array.isArray(tool.badges)
              ? `Tags: ${tool.badges.join(", ")}`
              : ""
          }`;
        })
        .join("\n\n");

      // Generate OpenAI response
      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant for ToolStack, a platform for
                     discovering developer tools.
            Use the following context about tools to answer questions:
            ${context}

            If you don't find relevant information in the context, you can
            provide general guidance about developer tools.
            Always be friendly and concise in your responses.`,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return {
        message: response.choices[0].message.content,
      };
    } catch (error) {
      console.error("Error:", error);
      throw new HttpsError("internal", "Failed to generate response");
    }
  }
);
