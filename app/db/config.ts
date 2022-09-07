/**
 * Server side methods to connect to the database
 */

import { Prisma, Config, User } from "@prisma/client";

import { migrateChartConfig } from "@/utils/chart-config/versioning";

import { createChartId } from "../utils/create-chart-id";

import prisma from "./client";

/**
 * Store data in the DB.
 *
 * @param data Data to be stored as configuration
 */
export const createConfig = async (
  data: Prisma.ConfigCreateInput["data"]
): Promise<{ key: string }> => {
  const result = await prisma.config.create({
    data: {
      key: createChartId(),
      data: data,
    },
  });

  return result;
};

const migrateDataSet = (dataSet: string): string => {
  if (dataSet.includes("https://environment.ld.admin.ch/foen/nfi")) {
    return dataSet.replace(/None-None-/, "");
  }

  return dataSet;
};

type ChartJsonConfig = {
  dataSet: string;
  chartConfig: Prisma.JsonObject;
};

const parseDbConfig = (conf: Config) => {
  const data = conf.data as ChartJsonConfig;
  return {
    ...conf,
    data: {
      ...data,
      dataSet: migrateDataSet(data.dataSet as string),
      chartConfig: migrateChartConfig(data.chartConfig),
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
