import { getServerSession } from "next-auth";

import {
  createConfig,
  getConfig,
  removeConfig,
  updateConfig,
} from "@/db/config";
import { nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { controller } from "@/server/nextkit";

const ConfigController = controller({
  create: async ({ req, res }) => {
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

  remove: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const sessionUserId = session?.user?.id;
    const { key } = req.body;

    const config = await getConfig(key);
    if (sessionUserId !== config?.user_id) {
      throw new Error("Unauthorized!");
    }

    return await removeConfig({ key });
  },

  update: async ({ req, res }) => {
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

export default ConfigController;
