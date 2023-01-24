import { createConfig } from "@/db/config";

import { api } from "../../server/nextkit";

import { getServerSideSession } from "./session";

const route = api({
  POST: async ({ req, res }) => {
    const session = await getServerSideSession(req, res);
    const userId = session?.user?.id;
    const { data, isDraft } = req.body;
    const result = await createConfig({
      isDraft,
      data,
      userId,
    });
    return result;
  },
});

export default route;
