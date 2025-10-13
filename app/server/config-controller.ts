import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { NextkitHandler } from "nextkit";

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
  create: withAuth(async ({ userId }, req) => {
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
  }),
  remove: withAuth(async ({ userId }, req) => {
    const { key } = req.body;
    const config = await getConfig(key);

    if (userId !== config?.user_id) {
      throw Error("Unauthorized!");
    }

    return await removeConfig({ key });
  }),
  update: withAuth(async ({ userId }, req) => {
    const { key, data, published_state } = req.body;

    if (!userId) {
      throw Error(
        "Could not update config: Not logged in users cannot update a chart"
      );
    }

    const config = await getConfig(key);

    if (!config) {
      throw Error("Could not update config: config not found");
    }

    if (userId !== config.user_id) {
      throw Error(
        `Could not update config: config must be edited by its author (config user id: ${config?.user_id}, server user id: ${userId})`
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
  }),
});

function withAuth<T>(
  handler: (
    ctx: {
      userId: number | undefined;
    },
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<T>
): NextkitHandler<null, T> {
  return async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const userId = session?.user?.id;
    return handler({ userId }, req, res);
  };
}
