/**
 * Server side methods to connect to the database
 */

import {
  PUBLISHED_STATE,
  Prisma,
  Config as PrismaConfig,
  User,
} from "@prisma/client";

import {
  ChartConfig,
  Config,
  ConfiguratorState,
  ConfiguratorStatePublished,
} from "@/config-types";
import prisma from "@/db/client";
import { upgradeConfiguratorStateServerSide } from "@/utils/chart-config/upgrade-cube";
import { migrateConfiguratorState } from "@/utils/chart-config/versioning";

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
  published_state,
}: {
  key: string;
  data: Prisma.ConfigCreateInput["data"];
  userId?: User["id"] | undefined;
  published_state: PUBLISHED_STATE;
}): Promise<{ key: string }> => {
  return await prisma.config.create({
    data: {
      key,
      data,
      user_id: userId,
      published_state,
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
  published_state,
}: {
  key: string;
  data: Prisma.ConfigUpdateInput["data"];
  published_state: Prisma.ConfigUpdateInput["published_state"];
}): Promise<{ key: string }> => {
  return await prisma.config.update({
    where: {
      key,
    },
    data: {
      key,
      data,
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
  await prisma.configView
    .deleteMany({
      where: {
        config_key: key,
      },
    })
    .then(() => {
      return prisma.config.delete({
        where: {
          key,
        },
      });
    });
};

const migrateCubeIri = (iri: string): string => {
  if (iri.includes("https://environment.ld.admin.ch/foen/nfi")) {
    return iri.replace(/None-None-/, "");
  }

  return iri;
};

/** Ensure that filters are ordered by position */
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

/** Ensure that cube iris are migrated */
const ensureMigratedCubeIris = (chartConfig: ChartConfig) => {
  return {
    ...chartConfig,
    cubes: chartConfig.cubes.map((cube) => ({
      ...cube,
      iri: migrateCubeIri(cube.iri),
    })),
  };
};

const parseDbConfig = (d: PrismaConfig) => {
  const data = d.data;
  const state = migrateConfiguratorState(data) as ConfiguratorStatePublished;
  return {
    ...d,
    data: {
      ...state,
      chartConfigs: state.chartConfigs
        .map(ensureFiltersOrder)
        .map(ensureMigratedCubeIris),
    },
  };
};

const upgradeDbConfig = async (config: PrismaConfig) => {
  const state = config.data as Config;
  const dataSource = state.dataSource;
  return {
    ...config,
    data: await upgradeConfiguratorStateServerSide(state as ConfiguratorState, {
      dataSource,
    }),
  } as ReturnType<typeof parseDbConfig>;
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

  const dbConfig = parseDbConfig(config);
  return await upgradeDbConfig(dbConfig);
};

/**
 * Get all configs from DB.
 */
export const getAllConfigs = async ({
  limit,
}: {
  limit?: number;
} = {}) => {
  const configs = await prisma.config.findMany({
    orderBy: {
      created_at: "desc",
    },
    take: limit,
  });
  const parsedConfigs = configs.map(parseDbConfig);
  return await Promise.all(parsedConfigs.map(upgradeDbConfig));
};

export const getConfigViewCount = async (configKey: string) => {
  return await prisma.config
    .findFirstOrThrow({
      where: {
        key: configKey,
      },
      include: {
        _count: {
          select: {
            views: true,
          },
        },
      },
    })
    .then((config) => config._count.views)
    .catch(() => 0);
};

/**
 * Increase the view count of a config.
 */
export const increaseConfigViewCount = async (configKey: string) => {
  await prisma.configView.create({
    data: {
      config_key: configKey,
    },
  });
};

/**
 * Get all configs metadata from DB.
 */
export const getAllConfigsMetadata = async ({
  limit,
  orderByViewCount,
}: {
  limit?: number;
  orderByViewCount?: boolean;
} = {}) => {
  return await prisma.config.findMany({
    select: {
      key: true,
      created_at: true,
      updated_at: true,
      published_state: true,
      user_id: true,
    },
    orderBy: orderByViewCount
      ? { views: { _count: "desc" } }
      : { created_at: "desc" },
    take: limit,
  });
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
  const parsedConfigs = configs.map(parseDbConfig);
  return await Promise.all(parsedConfigs.map(upgradeDbConfig));
};

export type ParsedConfig = ReturnType<typeof parseDbConfig>;
