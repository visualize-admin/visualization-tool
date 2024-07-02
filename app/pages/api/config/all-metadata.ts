import { getAllConfigsMetadata } from "../../../db/config";
import { api } from "../../../server/nextkit";

/**
 * Endpoint to read configuration from
 */
const route = api({
  GET: async ({ req }) => {
    return getAllConfigsMetadata({
      limit:
        req.query.limit && !Array.isArray(req.query.limit)
          ? parseInt(req.query.limit as string)
          : undefined,
      orderByViewCount: req.query.orderByViewCount === "true",
    });
  },
});

export default route;
