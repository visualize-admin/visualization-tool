/**
 * Server side methods to connect to the database
 */

import { Config, Prisma, User } from "@prisma/client";

import { ChartConfig, ConfiguratorStatePublished } from "@/configurator";
import { migrateConfiguratorState } from "@/utils/chart-config/versioning";

import prisma from "./client";

/**
 * Store data in the DB.
 * If the user is logged, the chart is linked to the user.
 *
 * @param key Key of the config to be stored
 * @param data Data to be stored as configuration
 */
export const createConfig = async ({
  key,
  data,
  userId,
}: {
  key: string;
  data: Prisma.ConfigCreateInput["data"];
  userId?: User["id"] | undefined;
}): Promise<{ key: string }> => {
  return await prisma.config.create({
    data: {
      key,
      data,
      user_id: userId,
    },
  });
};

/**
 * Update config in the DB.
 * Only valid for logged in users.
 *
 * @param key Key of the config to be updated
 * @param data Data to be stored as configuration
 */
export const updateConfig = async ({
  key,
  data,
  userId,
}: {
  key: string;
  data: Prisma.ConfigCreateInput["data"];
  userId: User["id"];
}): Promise<{ key: string }> => {
  return await prisma.config.update({
    where: {
      key,
    },
    data: {
      key,
      data,
      user_id: userId,
    },
  });
};

/**
 * Remove config from the DB.
 * Only valid for logged in users.
 *
 * @param key Key of the config to be updated
 */
export const removeConfig = async ({
  key,
}: {
  key: string;
}): Promise<{ key: string }> => {
  return await prisma.config.delete({
    where: {
      key,
    },
  });
};

const migrateDataSet = (dataSet: string): string => {
  if (dataSet.includes("https://environment.ld.admin.ch/foen/nfi")) {
    return dataSet.replace(/None-None-/, "");
  }

  return dataSet;
};

const ensureFiltersOrder = (chartConfig: ChartConfig) => {
  return {
    ...chartConfig,
    filters: Object.fromEntries(
      Object.entries(chartConfig.filters)
        .sort(([, a], [, b]) => {
          return (a.position ?? 0) - (b.position ?? 0);
        })
        .map(([k, v]) => {
          const { position, ...rest } = v;
          return [k, rest];
        })
    ),
  };
};

const parseDbConfig = (
  d: Config
): {
  id: number;
  key: string;
  data: ConfiguratorStatePublished;
  created_at: Date;
  user_id: number | null;
} => {
  const data = d.data as ConfiguratorStatePublished;
  const migratedData = migrateConfiguratorState(data);

  return {
    ...d,
    data: {
      ...migratedData,
      dataSet: migrateDataSet(migratedData.dataSet),
      chartConfigs: migratedData.chartConfigs.map(ensureFiltersOrder),
    },
  };
};

/**
 * Get data from DB.
 *
 * @param key Get data from DB with this key
 */
export const getConfig = async (key: string) => {
  const config = await prisma.config.findFirst({
    where: {
      key,
    },
  });

  if (!config) {
    return;
  }

  return parseDbConfig(config);
};

/**
 * Get all keys from DB.
 */
export const getAllConfigs = async () => {
  const configs = await prisma.config.findMany();
  return configs.map((c) => parseDbConfig(c));
};

/**
 * Get config from a user.
 */
export const getUserConfigs = async (userId: number) => {
  const configs = await prisma.config.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return configs.map((c) => parseDbConfig(c));
};

export type ParsedConfig = ReturnType<typeof parseDbConfig>;
