import "isomorphic-unfetch";

let fetchConfig = async (
  chartId: string
): Promise<undefined | { key: string; data: $Unexpressable }> =>
  fetch(`/api/config/${chartId}`).then(result => result.json());
let fetchAllConfigs = async (): Promise<{
  key: string;
  data: $Unexpressable;
}[]> => fetch(`/api/config/all`).then(result => result.json());

// On the server side, we replace `fetch` calls with direct calls to the DB, so we circumvent the (local) network.
// Next.js will optimize this section away for the client bundle.
// https://nextjs.org/blog/next-9#dead-code-elimination-for-typeof-window-branches
if (typeof window === "undefined") {
  const dbconfig = require("../db/config");

  fetchAllConfigs = dbconfig.getAllConfigs;
  fetchConfig = dbconfig.getConfig;
}

export { fetchConfig, fetchAllConfigs };
