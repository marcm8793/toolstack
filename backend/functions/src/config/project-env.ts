/* eslint-disable require-jsdoc */
/* eslint-disable object-curly-spacing */
import { defineSecret } from "firebase-functions/params";

const projectEnv = defineSecret("PROJECT_ENV");

function getProjectEnv() {
  const projectEnvValue = projectEnv.value();
  console.log("Process env PROJECT_ENV:", process.env.PROJECT_ENV);
  console.log("Raw project env value:", projectEnvValue);
  console.log("Final environment value:", projectEnvValue);

  return projectEnvValue;
}

export { getProjectEnv };
