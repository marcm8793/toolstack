/* eslint-disable object-curly-spacing */
import * as admin from "firebase-admin";
import { syncToolsToTypesense } from "./triggers/syncToolsToTypesense";
import { syncToolsToPinecone } from "./triggers/syncToolsToPinecone";
import { fullSyncToolsToTypesense } from "./triggers/fullSyncToolsToTypesense";
import { triggerDailySync } from "./triggers/dailySync";
import { generateChatResponse } from "./chatbot";
import { fullSyncToolsToPinecone } from "./triggers/fullSyncToolsToPinecone";

admin.initializeApp();
export {
  fullSyncToolsToPinecone,
  fullSyncToolsToTypesense,
  syncToolsToPinecone,
  syncToolsToTypesense,
  triggerDailySync,
  generateChatResponse,
};
