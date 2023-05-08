import { getAllConfigs } from "../../../db/config";
import { api } from "../../../server/nextkit";

/**
 * Endpoint to read configuration from
 */
const route = api({
  GET: async () => {
    return getAllConfigs();
  },
});

export default route;
