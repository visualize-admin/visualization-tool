import { increaseConfigViewCount } from "../../../db/config";
import { api } from "../../../server/nextkit";

const route = api({
  POST: async ({ req }) => {
    const { type } = JSON.parse(req.body);

    if (type === "preview") {
      await increaseConfigViewCount();
    }
  },
});

export default route;
