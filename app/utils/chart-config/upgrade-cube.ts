import ParsingClient from "sparql-http-client/ParsingClient";
import { Client } from "urql";

import { ConfiguratorState, DataSource } from "@/config-types";
import { hasChartConfigs } from "@/configurator";
import { getMaybeCachedSparqlUrl } from "@/graphql/caching-utils";
import {
  DataCubeLatestIriDocument,
  DataCubeLatestIriQuery,
  DataCubeLatestIriQueryVariables,
} from "@/graphql/query-hooks";
import { queryLatestCubeIri } from "@/rdf/query-latest-cube-iri";

const makeUpgradeConfiguratorState =
  <O>(cubeIriUpdateFn: (iri: string, options: O) => Promise<string>) =>
  async <V extends ConfiguratorState>(state: V, options: O): Promise<V> => {
    if (!hasChartConfigs(state)) {
      return state;
    }

    return {
      ...state,
      chartConfigs: await Promise.all(
        state.chartConfigs.map(async (chartConfig) => ({
          ...chartConfig,
          cubes: await Promise.all(
            chartConfig.cubes.map(async (cube) => ({
              ...cube,
              iri: await cubeIriUpdateFn(cube.publishIri, options),
            }))
          ),
        }))
      ),
    };
  };

/** Upgrades the cube's publishIri to the latest version. */
export const upgradeCubePublishIri = async (
  publishIri: string,
  options: {
    client: Client;
    dataSource: DataSource;
  }
) => {
  const { client, dataSource } = options;
  const { data } = await client
    .query<DataCubeLatestIriQuery, DataCubeLatestIriQueryVariables>(
      DataCubeLatestIriDocument,
      {
        sourceUrl: dataSource.url,
        sourceType: dataSource.type,
        cubeFilter: {
          iri: publishIri,
        },
      }
    )
    .toPromise();

  return data?.dataCubeLatestIri ?? publishIri;
};

export const upgradeConfiguratorState = makeUpgradeConfiguratorState(
  upgradeCubePublishIri
);

/** Upgrades the cube to the latest version. */
const upgradeCubePublishIriServerSide = async (
  publishIri: string,
  options: {
    dataSource: DataSource;
  }
) => {
  const { dataSource } = options;
  const client = new ParsingClient({
    endpointUrl: getMaybeCachedSparqlUrl({
      endpointUrl: dataSource.url,
      cubeIri: publishIri,
    }),
  });
  const iri = await queryLatestCubeIri(client, publishIri);
  return iri ?? publishIri;
};

export const upgradeConfiguratorStateServerSide = makeUpgradeConfiguratorState(
  upgradeCubePublishIriServerSide
);
