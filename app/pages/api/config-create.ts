import { getServerSession } from "next-auth";

import { createConfig } from "@/db/config";

import { api } from "../../server/nextkit";

import { nextAuthOptions } from "./auth/[...nextauth]";

const route = api({
  POST: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const userId = session?.user?.id;
    const { data, publishedState } = req.body;

    return await createConfig({
      key: data.key,
      data,
      userId,
      publishedState: publishedState,
    });
  },
});

export default route;
