/* eslint-disable require-jsdoc */
/* eslint-disable object-curly-spacing */
import { defineSecret } from "firebase-functions/params";

const nodeEnv = defineSecret("NODE_ENV");

function getNodeEnv() {
  return nodeEnv.value();
}

export { getNodeEnv };
