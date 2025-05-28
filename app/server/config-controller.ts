import { getServerSession } from "next-auth";

import {
  createConfig,
  getConfig,
  removeConfig,
  updateConfig,
} from "@/db/config";
import { nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { controller } from "@/server/nextkit";

export const ConfigController = controller({
  create: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const userId = session?.user?.id;
    const { data, published_state } = req.body;

    return await createConfig({
      key: data.key,
      data,
      userId,
      published_state: published_state,
    });
  },

  remove: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const sessionUserId = session?.user?.id;
    const { key } = req.body;

    const config = await getConfig(key);
    if (sessionUserId !== config?.user_id) {
      throw Error("Unauthorized!");
    }

    return await removeConfig({ key });
  },

  update: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const sessionUserId = session?.user?.id;

    const { key, data, published_state } = req.body;
    if (!sessionUserId) {
      throw Error(
        "Could not update config: Not logged in users cannot update a chart"
      );
    }

    const config = await getConfig(key);
    if (!config) {
      throw Error("Could not update config: config not found");
    }

    if (config.user_id !== sessionUserId) {
      throw Error(
        `Could not update config: config must be edited by its author (config user id: ${config?.user_id}, server user id: ${sessionUserId})`
      );
    }

    return await updateConfig({
      key,
      data,
      published_state,
    });
  },
});
