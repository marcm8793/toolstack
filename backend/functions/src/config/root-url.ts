/* eslint-disable object-curly-spacing */
/* eslint-disable require-jsdoc */
import { defineSecret } from "firebase-functions/params";

const projectEnv = defineSecret("PROJECT_ENV");

function getRootUrl() {
  const projectEnvValue = projectEnv.value();
  if (projectEnvValue === "PROD") {
    return "https://www.toolstack.pro/";
  }
  return "http://localhost:3000";
}

export { getRootUrl };
