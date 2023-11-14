// @ts-ignore
import { build, completionHandler } from "@cozy/cli-tree";
import { config } from "dotenv";
// @ts-ignore
import fetch from "node-fetch";
import { Client } from "urql";

import { DataSource } from "@/configurator";

import { GRAPHQL_ENDPOINT } from "../domain/env";
import {
  DataCubeMetadataDocument,
  DataCubeMetadataQuery,
  DataCubeMetadataQueryVariables,
  DataCubePreviewDocument,
  DataCubePreviewQuery,
  DataCubePreviewQueryVariables,
  DataCubesComponentsDocument,
  DataCubesComponentsQuery,
  DataCubesComponentsQueryVariables,
} from "../graphql/query-hooks";

config();

global.fetch = fetch;

type Args<T> = { client: Client; report: (x: any) => void } & T;

type CubeQueryOptions = {
  iri: string;
  sourceType: DataSource["type"];
  sourceUrl: string;
  locale: string;
  latest?: boolean;
};

const showCubeInfo = async ({
  client,
  iri,
  sourceType,
  sourceUrl,
  locale,
  latest,
  report,
}: Args<CubeQueryOptions>) => {
  const res = await client
    .query<DataCubeMetadataQuery, DataCubeMetadataQueryVariables>(
      DataCubeMetadataDocument,
      {
        iri,
        sourceType,
        sourceUrl,
        locale,
        latest,
      }
    )
    .toPromise();

  if (res.error) {
    throw new Error(res.error.message);
  }

  const cube = res.data?.dataCubeByIri;

  if (cube?.iri !== iri) {
    console.warn(
      "warn: Cube has been resolved to its latest version, pass --no-latest if you want the exact version"
    );
  }
  report(cube);
};

const showCubeComponents = async ({
  client,
  iri,
  sourceType,
  sourceUrl,
  locale,
  latest,
  report,
}: Args<CubeQueryOptions>) => {
  const res = await client
    .query<DataCubesComponentsQuery, DataCubesComponentsQueryVariables>(
      DataCubesComponentsDocument,
      {
        sourceType,
        sourceUrl,
        locale,
        filters: [{ iri, latest }],
      }
    )
    .toPromise();

  if (res.error) {
    throw new Error(res.error.message);
  }

  report(res.data?.dataCubesComponents);
};

const previewCube = async ({
  client,
  iri,
  sourceType,
  sourceUrl,
  locale,
  latest,
  report,
}: Args<CubeQueryOptions>) => {
  const { data: info, error } = await client
    .query<DataCubeMetadataQuery, DataCubeMetadataQueryVariables>(
      DataCubeMetadataDocument,
      {
        iri,
        sourceType,
        sourceUrl,
        locale,
        latest,
      }
    )
    .toPromise();

  if (error) {
    throw new Error(error.message);
  }

  if (!info || !info["dataCubeByIri"]) {
    throw new Error(`Could not find datacube ${iri}`);
  }

  const res = await client
    .query<DataCubePreviewQuery, DataCubePreviewQueryVariables>(
      DataCubePreviewDocument,
      {
        iri,
        sourceType,
        sourceUrl,
        locale,
        latest,
      }
    )
    .toPromise();

  if (res.error) {
    throw new Error(res.error.message);
  }

  report(res.data?.dataCubeByIri?.observations);
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
    defaultValue: "https://lindas.admin.ch/query",
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

  const noLatestArg = {
    help: "Resolves the cube to the latest version",
    argument: ["--no-latest"],
    action: "storeFalse",
    dest: "latest",
  };

  const commands = {
    info: {
      description: "Get info on the datacube",
      arguments: [
        iriArg,
        sourceTypeArg,
        sourceUrlArg,
        localeArg,
        jsonArg,
        noLatestArg,
      ],
      handler: showCubeInfo,
    },
    preview: {
      description: "Preview observations on the datacube",
      arguments: [
        iriArg,
        sourceTypeArg,
        sourceUrlArg,
        localeArg,
        jsonArg,
        noLatestArg,
      ],
      handler: previewCube,
    },
    components: {
      description: "Show cube components",
      arguments: [
        iriArg,
        sourceTypeArg,
        sourceUrlArg,
        localeArg,
        jsonArg,
        noLatestArg,
      ],
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
    fetch: fetch,
  });
  args.handler(args);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
