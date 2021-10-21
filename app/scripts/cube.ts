// @ts-ignore
import { build, completionHandler } from "@cozy/cli-tree";
import { Client, OperationResult } from "urql";
import { GRAPHQL_ENDPOINT } from "../domain/env";
import {
  DataCubeMetadataDocument,
  DataCubeMetadataWithComponentValuesDocument,
  DataCubeMetadataWithComponentValuesQuery,
  DataCubePreviewObservationsDocument,
  DataCubePreviewObservationsQuery,
} from "../graphql/query-hooks";

// @ts-ignore
import fetch from "node-fetch";
import { config } from "dotenv";

config();

global.fetch = fetch;

type Args<T> = { client: Client; report: (x: any) => void } & T;

type CubeQueryOptions = {
  iri: string;
  locale: string;
  latest?: boolean;
};

const showCubeInfo = async ({
  client,
  iri,
  locale,
  latest,
  report,
}: Args<CubeQueryOptions>) => {
  const res = await client
    .query(DataCubeMetadataDocument, {
      iri,
      locale,
      latest,
    })
    .toPromise();

  if (res.error) {
    throw new Error(res.error.message);
  }

  const cube = res.data?.dataCubeByIri;

  if (cube.iri !== iri) {
    console.warn(
      "warn: Cube has been resolved to its latest version, pass --no-latest if you want the exact version"
    );
  }
  report(cube);
};

const showCubeComponents = async ({
  client,
  iri,
  locale,
  latest,
  report,
}: Args<CubeQueryOptions>) => {
  const res = await client
    .query(DataCubeMetadataWithComponentValuesDocument, {
      iri,
      locale,
      latest,
    })
    .toPromise();

  if (res.error) {
    throw new Error(res.error.message);
  }

  report(res.data?.dataCubeByIri);
};

const previewCube = async ({
  client,
  iri,
  locale,
  latest,
  report,
}: Args<CubeQueryOptions>) => {
  const { data: info, error } = await client
    .query<DataCubeMetadataWithComponentValuesQuery>(
      DataCubeMetadataWithComponentValuesDocument,
      {
        iri,
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

  const { measures } = info["dataCubeByIri"];
  const res = await client
    .query<DataCubePreviewObservationsQuery>(
      DataCubePreviewObservationsDocument,
      {
        iri,
        locale,
        latest,
        measures: measures.map((m) => m.iri),
      }
    )
    .toPromise();

  if (res.error) {
    throw new Error(res.error.message);
  }

  report(res.data?.dataCubeByIri?.observations);
};

const main = async () => {
  const localeArg = {
    argument: ["-l", "--locale"],
    defaultValue: "en",
    help: "Locale",
  };

  const iriArg = {
    argument: ["-i", "--iri"],
    help: "Datacube iri",
    required: true,
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
      arguments: [iriArg, localeArg, jsonArg, noLatestArg],
      handler: showCubeInfo,
    },
    preview: {
      description: "Preview observations on the datacube",
      arguments: [iriArg, localeArg, jsonArg, noLatestArg],
      handler: previewCube,
    },
    components: {
      description: "Show cube components",
      arguments: [iriArg, localeArg, jsonArg, noLatestArg],
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
