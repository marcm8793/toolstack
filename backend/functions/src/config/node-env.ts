/* eslint-disable require-jsdoc */
/* eslint-disable object-curly-spacing */
import { defineSecret } from "firebase-functions/params";

const nodeEnv = defineSecret("NODE_ENV");

function getNodeEnv() {
  console.log("Raw nodeEnv value:", nodeEnv.value());
  console.log("Process env NODE_ENV:", process.env.NODE_ENV);

  const env = nodeEnv.value();
  console.log("Final environment value:", env);

  return env;
}

export { getNodeEnv };
