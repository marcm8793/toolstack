/* eslint-disable object-curly-spacing */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { HttpsError } from "firebase-functions/v2/https";
import * as functions from "firebase-functions";

export const triggerDailySync = onSchedule(
  {
    timeZone: "Europe/Paris",
    schedule: "0 12 * * *",
  },
  async () => {
    try {
      const region = functions.config().project.region;
      const projectId = functions.config().project.id;

      // Call both sync endpoints
      const syncUrls = [
        `https://${region}-${projectId}.cloudfunctions.net/fullSyncToolsToTypesense`,
        `https://${region}-${projectId}.cloudfunctions.net/fullSyncToolsToPinecone`,
      ];

      for (const url of syncUrls) {
        logger.log(`Calling sync URL: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
          throw new HttpsError("internal", `Sync failed for ${url}`, {
            status: response.status,
            statusText: response.statusText,
          });
        }

        logger.log(`Response status: ${response.status}`);
        logger.log(`Response text: ${await response.text()}`);
      }
    } catch (error) {
      logger.error("Error in triggerDailySync:", error);
      throw error;
    }
  }
);
