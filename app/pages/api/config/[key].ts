import { NextkitError } from "nextkit";

import { getConfig, updateConfig } from "../../../db/config";
import { api } from "../../../server/nextkit";

const route = api({
  GET: async ({ req }) => {
    const result = await getConfig(req.query.key as string);
    if (result) {
      return result;
    } else {
      throw new NextkitError(404, "Not found");
    }
  },
  PATCH: async ({ req }) => {
    const key = req.query.key as string;
    const existing = await getConfig(key);

    if (existing) {
      if (!existing?.is_draft) {
        throw new NextkitError(401, "Cannot edit non draft config");
      }
    } else {
      throw new NextkitError(404, "Config not found");
    }

    const result = updateConfig(key, req.body);

    if (result) {
      return result;
    } else {
      throw new NextkitError(401, "Could not edit chart");
    }
  },
});

export default route;
