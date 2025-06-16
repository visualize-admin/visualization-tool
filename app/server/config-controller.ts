import { getServerSession } from "next-auth";

import { ConfiguratorState } from "@/config-types";
import {
  createConfig,
  getConfig,
  removeConfig,
  updateConfig,
} from "@/db/config";
import { isDataSourceUrlAllowed } from "@/domain/data-source";
import { nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { controller } from "@/server/nextkit";

export const ConfigController = controller({
  create: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const userId = session?.user?.id;
    const { data, published_state } = req.body;

    if (!isDataSourceUrlAllowed((data as ConfiguratorState).dataSource.url)) {
      throw Error("Invalid data source!");
    }

    return await createConfig({
      key: data.key,
      data,
      userId,
      published_state: published_state,
    });
  },
  remove: async ({ req, res }) => {
    const { key } = req.body;
    const session = await getServerSession(req, res, nextAuthOptions);
    const sessionUserId = session?.user?.id;
    const config = await getConfig(key);

    if (sessionUserId !== config?.user_id) {
      throw Error("Unauthorized!");
    }

    return await removeConfig({ key });
  },
  update: async ({ req, res }) => {
    const { key, data, published_state } = req.body;
    const session = await getServerSession(req, res, nextAuthOptions);
    const sessionUserId = session?.user?.id;

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

    if (!isDataSourceUrlAllowed((data as ConfiguratorState).dataSource.url)) {
      throw Error("Invalid data source!");
    }

    return await updateConfig({
      key,
      data,
      published_state,
    });
  },
});
