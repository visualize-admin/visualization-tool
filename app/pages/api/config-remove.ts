import { getServerSession } from "next-auth";

import { removeConfig } from "@/db/config";

import { api } from "../../server/nextkit";

import { nextAuthOptions } from "./auth/[...nextauth]";

const route = api({
  POST: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const serverUserId = session?.user?.id;
    const { key, userId } = req.body;
    console.log(key, userId, serverUserId);

    if (serverUserId !== userId) {
      throw new Error("Unauthorized!");
    }

    return await removeConfig({ key });
  },
});

export default route;
