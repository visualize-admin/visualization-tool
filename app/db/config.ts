/**
 * Server side methods to connect to the database
 */

import { Config, Prisma, User } from "@prisma/client";

import { ChartConfig, Config as ConfigType } from "@/configurator";
import { migrateChartConfig } from "@/utils/chart-config/versioning";

import { createChartId } from "../utils/create-chart-id";

import prisma from "./client";

type PublishedConfig = Omit<ConfigType, "activeField">;

/**
 * Store data in the DB.
 * If the user is logged, the chart is linked to the user.
 *
 * @param data Data to be stored as configuration
 */
export const createConfig = async ({
  data,
  userId,
}: {
  data: Prisma.ConfigCreateInput["data"];
  userId?: User["id"] | undefined;
}): Promise<{ key: string }> => {
  return await prisma.config.create({
    data: {
      key: createChartId(),
      data,
      user_id: userId,
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

type ChartJsonConfig = {
  dataSet: string;
  chartConfig: Prisma.JsonObject;
};

const parseDbConfig = (conf: Config) => {
  const data = conf.data as ChartJsonConfig;
  const migratedData = {
    ...data,
    dataSet: migrateDataSet(data.dataSet),
    chartConfig: ensureFiltersOrder(migrateChartConfig(data.chartConfig)),
  } as PublishedConfig;
  return {
    ...conf,
    data: migratedData,
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
      key: key,
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
  });
  return configs.map((c) => parseDbConfig(c));
};

export type ParsedConfig = ReturnType<typeof parseDbConfig>;
