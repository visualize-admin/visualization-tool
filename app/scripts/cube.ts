// @ts-ignore
import { build, completionHandler } from "@cozy/cli-tree";
import { config } from "dotenv";
import fetch from "node-fetch";
import { Client } from "urql";

import { DataSource } from "@/configurator";

import { GRAPHQL_ENDPOINT } from "../domain/env";
import {
  DataCubeComponentsDocument,
  DataCubeComponentsQuery,
  DataCubeComponentsQueryVariables,
  DataCubeMetadataDocument,
  DataCubeMetadataQuery,
  DataCubeMetadataQueryVariables,
  DataCubePreviewDocument,
  DataCubePreviewQuery,
  DataCubePreviewQueryVariables,
} from "../graphql/query-hooks";

config();

// @ts-ignore
global.fetch = fetch;

type Args<T> = { client: Client; report: (x: any) => void } & T;

type CubeQueryOptions = {
  iri: string;
  sourceType: DataSource["type"];
  sourceUrl: string;
  locale: string;
};

const showCubeInfo = async ({
  client,
  iri,
  sourceType,
  sourceUrl,
  locale,
  report,
}: Args<CubeQueryOptions>) => {
  const res = await client
    .query<DataCubeMetadataQuery, DataCubeMetadataQueryVariables>(
      DataCubeMetadataDocument,
      {
        sourceType,
        sourceUrl,
        locale,
        cubeFilter: { iri },
      }
    )
    .toPromise();

  if (res.error) {
    throw Error(res.error.message);
  }

  const cube = res.data?.dataCubeMetadata;
  report(cube);
};

const showCubeComponents = async ({
  client,
  iri,
  sourceType,
  sourceUrl,
  locale,
  report,
}: Args<CubeQueryOptions>) => {
  const res = await client
    .query<DataCubeComponentsQuery, DataCubeComponentsQueryVariables>(
      DataCubeComponentsDocument,
      {
        sourceType,
        sourceUrl,
        locale,
        cubeFilter: { iri },
      }
    )
    .toPromise();

  if (res.error) {
    throw Error(res.error.message);
  }

  report(res.data?.dataCubeComponents);
};

const previewCube = async ({
  client,
  iri,
  sourceType,
  sourceUrl,
  locale,
  report,
}: Args<CubeQueryOptions>) => {
  const { data: info, error } = await client
    .query<DataCubeMetadataQuery, DataCubeMetadataQueryVariables>(
      DataCubeMetadataDocument,
      {
        sourceType,
        sourceUrl,
        locale,
        cubeFilter: { iri },
      }
    )
    .toPromise();

  if (error) {
    throw Error(error.message);
  }

  if (!info || !info.dataCubeMetadata) {
    throw Error(`Could not find cube with iri of ${iri}`);
  }

  const res = await client
    .query<DataCubePreviewQuery, DataCubePreviewQueryVariables>(
      DataCubePreviewDocument,
      {
        sourceType,
        sourceUrl,
        locale,
        cubeFilter: { iri },
      }
    )
    .toPromise();

  if (res.error) {
    throw Error(res.error.message);
  }

  report(res.data?.dataCubePreview?.observations);
};

const main = async () => {
  const iriArg = {
    argument: ["-i", "--iri"],
    help: "Datacube iri",
    required: true,
  };

  const sourceTypeArg = {
    argument: ["-l", "--sourceType"],
    defaultValue: "sparql",
    help: "DataSourceType",
  };

  const sourceUrlArg = {
    argument: ["-l", "--sourceUrl"],
    defaultValue: "https://lindas.cz-aws.net/query",
    help: "DataUrlType",
  };

  const localeArg = {
    argument: ["-l", "--locale"],
    defaultValue: "en",
    help: "Locale",
  };

  const jsonArg = {
    help: "Output result in JSON",
    argument: ["-j", "--json"],
    action: "storeTrue",
    defaultValue: false,
  };

  const commands = {
    info: {
      description: "Get info on the datacube",
      arguments: [iriArg, sourceTypeArg, sourceUrlArg, localeArg, jsonArg],
      handler: showCubeInfo,
    },
    preview: {
      description: "Preview observations on the datacube",
      arguments: [iriArg, sourceTypeArg, sourceUrlArg, localeArg, jsonArg],
      handler: previewCube,
    },
    components: {
      description: "Show cube components",
      arguments: [iriArg, sourceTypeArg, sourceUrlArg, localeArg, jsonArg],
      handler: showCubeComponents,
    },
  };

  await completionHandler(commands);
  const [parser] = build(commands);

  const args = parser.parseArgs();
  args.report = args.json
    ? (x: any) => console.log(JSON.stringify(x, null, 2))
    : console.log;
  args.client = new Client({
    url: `http://localhost:3000${GRAPHQL_ENDPOINT}`,
    // @ts-ignore
    fetch: fetch,
  });
  args.handler(args);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
