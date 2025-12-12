/* eslint-disable object-curly-spacing */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

export const triggerMonthlySync = onSchedule(
  {
    timeZone: "Europe/Paris",
    schedule: "0 12 1 * *",
    secrets: ["PROJECT_URL"],
  },
  async () => {
    try {
      const projectUrl = defineSecret("PROJECT_URL");

      const syncUrls = [
        `https://fullsynctoolstotypesense-${projectUrl.value()}`,
        `https://fullsynctoolstopinecone-${projectUrl.value()}`,
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
