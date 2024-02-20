import { getServerSession } from "next-auth";

import { getConfig, removeConfig } from "@/db/config";

import { api } from "../../server/nextkit";

import { nextAuthOptions } from "./auth/[...nextauth]";

const route = api({
  POST: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const sessionUserId = session?.user?.id;
    const { key } = req.body;

    const config = await getConfig(key);
    if (sessionUserId !== config?.user_id) {
      throw new Error("Unauthorized!");
    }

    return await removeConfig({ key });
  },
});

export default route;
