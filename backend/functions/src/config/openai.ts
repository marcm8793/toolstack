/* eslint-disable require-jsdoc */
/* eslint-disable object-curly-spacing */
import { defineSecret } from "firebase-functions/params";
import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

const openaiApiKey = defineSecret("OPENAI_API_KEY");

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: openaiApiKey.value(),
    });
  }
  return openaiClient;
}

export { getOpenAIClient };
