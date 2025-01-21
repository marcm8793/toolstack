/* eslint-disable object-curly-spacing */

import * as functions from "firebase-functions";
import { Pinecone } from "@pinecone-database/pinecone";

const pineconeConfig = functions.config().pinecone;

if (!pineconeConfig) {
  console.error(
    "Pinecone config missing. Please set using Firebase Functions config."
  );
}

export const pineconeClient = new Pinecone({
  apiKey: pineconeConfig.apikey,
});
