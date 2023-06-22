import { sleep } from "k6";
import http from "k6/http";

import { PROJECT_ID } from "../../utils.js";
import { query, variables } from "../observations.js";
import { headers } from "../utils.js";

import { url } from "./utils.js";

/** @type {import("k6/options").Options} */
export const options = {
  duration: "60s",
  vus: 50,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1250"],
  },
  ext: {
    loadimpact: {
      projectId: PROJECT_ID,
      name: "GraphQL - Observations (PROD)",
    },
  },
};

export default function Observations() {
  http.post(url, JSON.stringify({ query, variables }), { headers });
  sleep(1);
}
