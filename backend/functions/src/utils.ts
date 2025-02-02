/* eslint-disable object-curly-spacing */
/* eslint-disable require-jsdoc */
import { getOpenAIClient } from "./config/openai";

export async function getEmbedding(text: string) {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}
