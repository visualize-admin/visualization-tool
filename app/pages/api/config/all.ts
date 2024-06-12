import { getAllConfigs } from "../../../db/config";
import { api } from "../../../server/nextkit";

/**
 * Endpoint to read configuration from
 */
const route = api({
  GET: async ({ req }) => {
    return getAllConfigs({
      limit:
        req.query.limit && !Array.isArray(req.query.limit)
          ? parseInt(req.query.limit as string)
          : undefined,
    });
  },
});

export default route;
