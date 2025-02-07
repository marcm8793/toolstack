/* eslint-disable object-curly-spacing */
/* eslint-disable require-jsdoc */
/* eslint-disable operator-linebreak */
import { Pinecone } from "@pinecone-database/pinecone";
import { defineSecret } from "firebase-functions/params";
import { getNodeEnv } from "./node-env";

let pineconeClientInstance: Pinecone | null = null;

const pineconeApiKey = defineSecret("PINECONE_API_KEY");

function getPineconeClient(): Pinecone {
  if (!pineconeClientInstance) {
    pineconeClientInstance = new Pinecone({
      apiKey: pineconeApiKey.value(),
    });
  }
  return pineconeClientInstance;
}
export const pineconeIndexName = () => {
  console.log("getNodeEnv()", getNodeEnv());
  if (getNodeEnv() === "production") {
    return "toolstack-tools-prod";
  } else if (getNodeEnv() === "dev") {
    return "toolstack-tools-dev";
  } else {
    throw new Error("Invalid environment");
  }
};

export const pineconeClient = {
  pineconeIndex: () => getPineconeClient().index(pineconeIndexName()),
};
