import {
  getConfigViewCount,
  increaseConfigViewCount,
} from "../../../db/config";
import { api } from "../../../server/nextkit";

const route = api({
  GET: async ({ req }) => {
    const { id } = req.query;

    if (typeof id !== "string") {
      throw new Error("Invalid config id");
    }

    const viewCount = await getConfigViewCount(id);

    return viewCount;
  },
  POST: async ({ req }) => {
    const { type } = JSON.parse(req.body);

    if (type === "preview") {
      await increaseConfigViewCount();
    }
  },
});

export default route;
