import { getServerSession } from "next-auth";

import { updateConfig } from "@/db/config";

import { api } from "../../server/nextkit";

import { nextAuthOptions } from "./auth/[...nextauth]";

const route = api({
  POST: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const serverUserId = session?.user?.id;
    const { key, userId, data } = req.body;

    if (serverUserId !== userId) {
      throw new Error("Unauthorized!");
    }

    return await updateConfig({
      key,
      data,
      userId,
    });
  },
});

export default route;
