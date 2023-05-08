import { NextkitError } from "nextkit";

import { getConfig } from "../../../db/config";
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
});

export default route;
