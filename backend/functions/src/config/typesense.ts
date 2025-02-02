/* eslint-disable require-jsdoc */
/* eslint-disable object-curly-spacing */
import Typesense from "typesense";
import { defineSecret } from "firebase-functions/params";

const typesenseHost = defineSecret("TYPESENSE_HOST");
const typesenseApiKey = defineSecret("TYPESENSE_API_KEY");

export function getTypesenseClient() {
  const host = typesenseHost.value();
  const apiKey = typesenseApiKey.value();

  if (!host || !apiKey) {
    throw new Error("Typesense configuration is missing.");
  }

  return new Typesense.Client({
    nodes: [
      {
        host: host,
        port: 443,
        protocol: "https",
      },
    ],
    apiKey: apiKey,
    connectionTimeoutSeconds: 2,
  });
}
