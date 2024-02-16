import { getServerSession } from "next-auth";

import { updateConfig } from "@/db/config";

import { api } from "../../server/nextkit";

import { nextAuthOptions } from "./auth/[...nextauth]";

const route = api({
  POST: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const serverUserId = session?.user?.id;
    const { key, user_id, data, published_state } = req.body;

    if (serverUserId !== user_id) {
      throw new Error("Unauthorized!");
    }

    return await updateConfig({
      key,
      data,
      user_id,
      published_state,
    });
  },
});

export default route;
