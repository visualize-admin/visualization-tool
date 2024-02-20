/**
 * Server side methods to connect to the database
 */

import { Config, Prisma, PUBLISHED_STATE, User } from "@prisma/client";

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
  publishedState,
}: {
  key: string;
  data: Prisma.ConfigCreateInput["data"];
  userId?: User["id"] | undefined;
  publishedState: PUBLISHED_STATE;
}): Promise<{ key: string }> => {
  return await prisma.config.create({
    data: {
      key,
      data,
      user_id: userId,
      published_state: publishedState,
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
  user_id,
  published_state,
}: {
  key: string;
  data: Prisma.ConfigUpdateInput["data"];
  user_id: User["id"];
  published_state: Prisma.ConfigUpdateInput["published_state"];
}): Promise<{ key: string }> => {
  return await prisma.config.update({
    where: {
      key,
    },
    data: {
      key,
      data,
      user_id,
      updated_at: new Date(),
      published_state: published_state,
    },
  });
};

/**
 * Remove config from the DB.
 * Only valid for logged in users.
 *
 * @param key Key of the config to be updated
 */
export const removeConfig = async ({ key }: { key: string }) => {
  return await prisma.config.delete({
    where: {
      key,
    },
  });
};

const migrateCubeIri = (iri: string): string => {
  if (iri.includes("https://environment.ld.admin.ch/foen/nfi")) {
    return iri.replace(/None-None-/, "");
  }

  return iri;
};

const ensureFiltersOrder = (chartConfig: ChartConfig) => {
  return {
    ...chartConfig,
    cubes: chartConfig.cubes.map((cube) => {
      return {
        ...cube,
        filters: Object.fromEntries(
          Object.entries(cube.filters)
            .sort(([, a], [, b]) => {
              return (a.position ?? 0) - (b.position ?? 0);
            })
            .map(([k, v]) => {
              const { position, ...rest } = v;
              return [k, rest];
            })
        ),
      };
    }),
  };
};

const parseDbConfig = (d: Config) => {
  const data = d.data as ConfiguratorStatePublished;
  const migratedData = migrateConfiguratorState(data);

  return {
    ...d,
    data: {
      ...migratedData,
      chartConfigs: migratedData.chartConfigs
        .map(ensureFiltersOrder)
        .map((chartConfig: ChartConfig) => ({
          ...chartConfig,
          cubes: chartConfig.cubes.map((cube) => ({
            ...cube,
            iri: migrateCubeIri(cube.iri),
          })),
        })),
    } as ConfiguratorStatePublished,
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
