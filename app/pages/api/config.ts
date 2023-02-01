import { createConfig } from "@/db/config";

import { api } from "../../server/nextkit";

import { getServerSideSession } from "./session";

const route = api({
  POST: async ({ req, res }) => {
    const session = await getServerSideSession(req, res);
    const userId = session?.user?.id;
    const { data } = req.body;
    const result = await createConfig({
      data,
      userId,
    });
    return result;
  },
});

export default route;
