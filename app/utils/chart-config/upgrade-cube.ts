import ParsingClient from "sparql-http-client/ParsingClient";
import { Client } from "urql";

import { ConfiguratorState, DataSource } from "@/config-types";
import { hasChartConfigs } from "@/configurator";
import { getMaybeCachedSparqlUrl } from "@/graphql/caching-utils";
import {
  DataCubeLatestIriDocument,
  DataCubeLatestIriQuery,
  DataCubeLatestIriQueryVariables,
  DataCubeUnversionedIriDocument,
  DataCubeUnversionedIriQuery,
  DataCubeUnversionedIriQueryVariables,
} from "@/graphql/query-hooks";
import { queryCubeUnversionedIri } from "@/rdf/query-cube-unversioned-iri";
import { queryLatestCubeIri } from "@/rdf/query-latest-cube-iri";

const makeUpgradeConfiguratorState =
  <O>({
    cubeIriUpdateFn,
  }: {
    cubeIriUpdateFn: (iri: string, options: O) => Promise<string>;
  }) =>
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
              iri: await cubeIriUpdateFn(cube.iri, options),
            }))
          ),
        }))
      ),
    };
  };

export const getLatestCubeIri = async (
  iri: string,
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
        cubeFilter: { iri },
      }
    )
    .toPromise();

  return data?.dataCubeLatestIri ?? iri;
};

export const getUnversionedCubeIri = async (
  iri: string,
  options: {
    client: Client;
    dataSource: DataSource;
  }
) => {
  const { client, dataSource } = options;
  const { data } = await client
    .query<DataCubeUnversionedIriQuery, DataCubeUnversionedIriQueryVariables>(
      DataCubeUnversionedIriDocument,
      {
        sourceUrl: dataSource.url,
        sourceType: dataSource.type,
        cubeFilter: { iri },
      }
    )
    .toPromise();

  return data?.dataCubeUnversionedIri ?? iri;
};

export const upgradeConfiguratorState = makeUpgradeConfiguratorState({
  cubeIriUpdateFn: getLatestCubeIri,
});

const getLatestCubeIriServerSide = async (
  iri: string,
  options: {
    dataSource: DataSource;
  }
) => {
  const { dataSource } = options;
  const client = new ParsingClient({
    endpointUrl: getMaybeCachedSparqlUrl({
      endpointUrl: dataSource.url,
      cubeIri: iri,
    }),
  });
  return (await queryLatestCubeIri(client, iri)) ?? iri;
};

export const getUnversionedCubeIriServerSide = async (
  cubeIri: string,
  options: {
    dataSource: DataSource;
  }
) => {
  const { dataSource } = options;
  const client = new ParsingClient({
    endpointUrl: getMaybeCachedSparqlUrl({
      endpointUrl: dataSource.url,
      cubeIri,
    }),
  });
  const iri = await queryCubeUnversionedIri(client, cubeIri);
  return iri ?? cubeIri;
};

export const upgradeConfiguratorStateServerSide = makeUpgradeConfiguratorState({
  cubeIriUpdateFn: getLatestCubeIriServerSide,
});
