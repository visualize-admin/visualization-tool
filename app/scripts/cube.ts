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

type ClientArg = { client: Client };
type Args<T> = { client: Client; report: (x: any) => void } & T;

const reportGraphqlResult = (res: OperationResult, root: string) => {
  if (res.data) {
    console.log(res.data[root]);
  } else if (res.error) {
    console.error(res.error);
  }
};

const showCubeInfo = async ({
  client,
  iri,
  locale,
  report,
}: Args<{
  iri: string;
  locale: string;
}>) => {
  const res = await client
    .query(DataCubeMetadataDocument, {
      iri,
      locale,
    })
    .toPromise();

  if (res.error) {
    throw new Error(res.error.message);
  }

  report(res.data?.dataCubeByIri);
};

const showCubeComponents = async ({
  client,
  iri,
  locale,
  report,
}: Args<{
  iri: string;
  locale: string;
}>) => {
  const res = await client
    .query(DataCubeMetadataWithComponentValuesDocument, {
      iri,
      locale,
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
  report,
}: Args<{
  iri: string;
  locale: string;
}>) => {
  const { data: info, error } = await client
    .query<DataCubeMetadataWithComponentValuesQuery>(
      DataCubeMetadataWithComponentValuesDocument,
      {
        iri,
        locale,
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

  const commands = {
    info: {
      description: "Get info on the datacube",
      arguments: [iriArg, localeArg, jsonArg],
      handler: showCubeInfo,
    },
    preview: {
      description: "Preview observations on the datacube",
      arguments: [iriArg, localeArg, jsonArg],
      handler: previewCube,
    },
    components: {
      description: "Show cube components",
      arguments: [iriArg, localeArg, jsonArg],
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
