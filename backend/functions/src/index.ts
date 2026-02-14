/* eslint-disable object-curly-spacing */
import * as admin from "firebase-admin";
import { syncToolsToPinecone } from "./triggers/syncToolsToPinecone";
import { triggerMonthlySync } from "./triggers/dailySync";
import { generateChatResponse } from "./chatbot";
import { fullSyncToolsToPinecone } from "./triggers/fullSyncToolsToPinecone";

admin.initializeApp();
export {
  fullSyncToolsToPinecone,
  syncToolsToPinecone,
  triggerMonthlySync,
  generateChatResponse,
};
