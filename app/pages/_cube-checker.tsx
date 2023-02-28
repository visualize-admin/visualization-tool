import { t, Trans } from "@lingui/macro";
import { Button, Link, Stack, TextField, Typography } from "@mui/material";
import { DESCRIBE } from "@tpluscode/sparql-builder";
import clownface, { AnyPointer } from "clownface";
import DataLoader from "dataloader";
import omit from "lodash/omit";
import { GetServerSideProps, NextPage } from "next";
import NextLink from "next/link";
import rdf from "rdf-ext";
import React from "react";
import StreamClient from "sparql-http-client";
import ParsingClient from "sparql-http-client/ParsingClient";

import { ContentLayout } from "@/components/layout";
import { DataSource } from "@/configurator/config-types";
import {
  DEFAULT_DATA_SOURCE,
  parseDataSource,
  sourceToLabel,
  useDataSourceState,
} from "@/domain/datasource";
import { SOURCES_BY_LABEL } from "@/domain/datasource/constants";
import { getRawCube } from "@/graphql/context";
import { ResolvedDimension } from "@/graphql/shared-types";
import { getCubeDimensions as _getCubeDimensions } from "@/rdf/queries";
import { fromStream } from "@/rdf/sparql-client";

import * as ns from "../rdf/namespace";

type CheckResult = {
  ok: boolean;
  message: string;
  link?: string;
};

type CheckRunContext = {
  cubeIri: string;
  loaders: {
    describeCubes: DataLoader<string, AnyPointer, unknown>;
    getCubeDimensions: DataLoader<
      string,
      ResolvedDimension[] | undefined,
      unknown
    >;
  };
};

type Check = {
  name: string;
  description: string;
  run: (ctx: CheckRunContext) => Promise<CheckResult>;
};

type PageProps = {
  cubeIri?: string;
  checks: { check: Omit<Check, "run">; result: CheckResult }[];
};

const describeCubes = async (
  sparqlClientStream: StreamClient,
  cubeIris: readonly string[]
) => {
  return Promise.all(
    cubeIris.map(async (cubeIri) => {
      const query = DESCRIBE`<${cubeIri}>`;
      const stream = await query.execute(sparqlClientStream.query);
      const dataset = await fromStream(rdf.dataset(), stream);
      return clownface({ dataset });
    })
  );
};

const getCubeDimensions = async (
  sparqlClient: ParsingClient,
  sourceUrl: string,
  cubeIris: readonly string[]
) => {
  return Promise.all(
    cubeIris.map(async (cubeIri) => {
      const rawCube = await getRawCube(sourceUrl, cubeIri);

      if (rawCube) {
        return await _getCubeDimensions({
          cube: rawCube,
          locale: "en",
          sparqlClient,
          cache: undefined,
        });
      }
    })
  );
};

const checks: Check[] = [
  {
    name: "Has a shape",
    description: "Should have a shape through cube:observationConstraint",
    run: async ({ cubeIri, loaders }) => {
      const cube = await loaders.describeCubes.load(cubeIri);
      const shape = cube.out(ns.cube.observationConstraint).value;
      if (shape) {
        return { ok: true, message: "Has shape" };
      } else {
        return { ok: false, message: "No shape" };
      }
    },
  },
  {
    name: "Has a creator",
    description: "Should have a shape through dcterms:creator",
    run: async ({ cubeIri, loaders }) => {
      const cube = await loaders.describeCubes.load(cubeIri);
      const creator = cube.out(ns.dcterms.creator).values;
      if (creator) {
        return { ok: true, message: "Has creator" };
      } else {
        return { ok: false, message: "No creator" };
      }
    },
  },
  {
    name: "Has a theme",
    description: "Should have a shape through dcat:theme",
    run: async ({ cubeIri, loaders }) => {
      const cube = await loaders.describeCubes.load(cubeIri);
      const themes = cube.out(ns.dcat.theme).values;
      if (themes) {
        return { ok: true, message: "Has a theme" };
      } else {
        return { ok: false, message: "No theme" };
      }
    },
  },
  {
    name: "Has a description",
    description: "Should have a description through schema:description",
    run: async ({ cubeIri, loaders }) => {
      const cube = await loaders.describeCubes.load(cubeIri);
      const desc = cube.out(ns.schema.description).values;
      if (desc) {
        return { ok: true, message: "Has a description" };
      } else {
        return { ok: false, message: "No description" };
      }
    },
  },
  {
    name: "Number of dimensions",
    description: "Should have a number of dimensions",
    run: async ({ cubeIri, loaders }) => {
      const dimensions = await loaders.getCubeDimensions.load(cubeIri);
      console.log(dimensions);
      return { ok: true, message: `Has ${dimensions?.length} dimensions` };
    },
  },
  {
    name: "Is published",
    description:
      "Should have a status (schema:creativeWorkStatus: [Published, Draft])",
    run: async ({ cubeIri, loaders }) => {
      const cube = await loaders.describeCubes.load(cubeIri);
      const status = cube.out(ns.schema.creativeWorkStatus).value;
      if (
        status === "https://ld.admin.ch/vocabulary/CreativeWorkStatus/Published"
      ) {
        return { ok: true, message: "Is published" };
      } else if (
        status === "https://ld.admin.ch/vocabulary/CreativeWorkStatus/Draft"
      ) {
        return { ok: true, message: "Is draft" };
      } else {
        return { ok: false, message: `Unknown status ${status}` };
      }
    },
  },
  {
    name: "Is set to be viewable on visualize.admin",
    description:
      "Should have a predicate schema:workExample <https://ld.admin.ch/application/visualize>",
    run: async ({ cubeIri, loaders }) => {
      const cube = await loaders.describeCubes.load(cubeIri);
      const workExamples = cube.out(ns.schema.workExample).values;
      if (
        workExamples &&
        workExamples.includes("https://ld.admin.ch/application/visualize")
      ) {
        return { ok: true, message: "Is viewable on visualize.admin.ch" };
      } else {
        return {
          ok: false,
          message: `Cube lacks the predicate schema:workExample <https://ld.admin.ch/application/visualize>`,
        };
      }
    },
  },
  {
    name: "Has correct scale type for Temporal dimensions",
    description:
      "All Temporal dimensions should have Interval scale type (qudt:scaleType)",
    run: async ({ cubeIri, loaders }) => {
      const dimensions = await loaders.getCubeDimensions.load(cubeIri);
      const temporalDimensions = dimensions?.filter(
        (d) => d.data.dataKind === "Time"
      );

      if (temporalDimensions) {
        const ok = temporalDimensions.every(
          (d) => d.data.scaleType === "Interval"
        );

        if (ok) {
          return {
            ok,
            message: "All Temporal dimensions have Interval scale type",
          };
        } else {
          return {
            ok,
            message: "Not all Temporal dimensions have Interval scale type",
          };
        }
      } else {
        return { ok: true, message: "No Temporal dimensions in cube" };
      }
    },
  },
  {
    name: "Has timeFormat defined for Temporal dimensions",
    description:
      "All Temporal dimensions must have timeFormat defined (Time precision)",
    run: async ({ cubeIri, loaders }) => {
      const dimensions = await loaders.getCubeDimensions.load(cubeIri);
      const temporalDimensions = dimensions?.filter(
        (d) => d.data.dataKind === "Time"
      );

      if (temporalDimensions) {
        const ok = temporalDimensions.every(
          (d) => d.data.timeFormat !== undefined
        );

        if (ok) {
          return {
            ok,
            message: "All Temporal dimensions have time format defined",
          };
        } else {
          return {
            ok,
            message: "Not all Temporal dimensions have time format defined",
          };
        }
      } else {
        return { ok: true, message: "No Temporal dimensions in cube" };
      }
    },
  },
];

const Page: NextPage<PageProps> = ({ checks, cubeIri }) => {
  const [datasource] = useDataSourceState();
  return (
    <>
      <ContentLayout>
        <Stack maxWidth={1024} mx="auto" mt={8} spacing={4}>
          <Stack spacing={3}>
            <Typography variant="h1">
              <Trans id="cube-checker.cube-checker">Cube checker</Trans>
            </Typography>
            <div>
              <Typography variant="body1" gutterBottom>
                <Trans id="cube-checker.description">
                  Cube checker helps you understand if a cube has all the
                  necessary attributes and properties to be viewable in
                  visualize.admin.ch.
                </Trans>
              </Typography>
              <NextLink
                href="/docs/charts/rdf-to-visualize#cube-checker"
                passHref
              >
                <Link variant="body2">
                  ℹ️{" "}
                  <Trans id="cube-checker.help">More information here.</Trans>
                </Link>
              </NextLink>
            </div>
            <form>
              <Stack spacing={1} alignItems="start">
                <TextField
                  type="text"
                  name="cubeIri"
                  defaultValue={cubeIri}
                  inputProps={{
                    size: 50,
                    placeholder: t({
                      id: "cube-checker.field-placeholder",
                      message: "Cube IRI",
                    }),
                  }}
                />
                <div>
                  <input
                    type="hidden"
                    name="dataSource"
                    value={sourceToLabel(datasource)}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ mt: 4, display: "block" }}
                  >
                    Check
                  </Button>
                </div>
              </Stack>
            </form>
          </Stack>
          <Stack spacing={3}>
            {checks.map((check) => {
              return (
                <div key={check.check.name}>
                  <Typography variant="h5">{check.check.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {check.check.description}
                  </Typography>
                  <Typography
                    variant="body1"
                    color={check.result.ok ? "success" : "error"}
                  >
                    {check.result.ok ? "✅" : "❌"} {check.result.message}
                  </Typography>
                  {check.result.link ? (
                    <Link color="primary" href={check.result.link}>
                      Query
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </Stack>
        </Stack>
      </ContentLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (query.cubeIri) {
    const cubeIri = query.cubeIri as string;
    const datasourceLabel = query.dataSource as string;
    let datasource: DataSource;
    if (datasourceLabel && SOURCES_BY_LABEL[datasourceLabel]) {
      datasource = parseDataSource(SOURCES_BY_LABEL[datasourceLabel].value);
    } else {
      datasource = DEFAULT_DATA_SOURCE;
    }

    console.log({ datasource });
    if (datasource.type !== "sparql") {
      throw new Error(
        `Cannot yet use cubeChecker with datasource of type ${datasource.type}`
      );
    }

    const sparqlClient = new ParsingClient({
      endpointUrl: datasource.url,
    });
    const sparqlClientStream = new StreamClient({
      endpointUrl: datasource.url,
    });
    console.log("created stream with", datasource.url);
    const context = {
      cubeIri,
      loaders: {
        describeCubes: new DataLoader<string, AnyPointer>((cubeIri) =>
          describeCubes(sparqlClientStream, cubeIri)
        ),
        getCubeDimensions: new DataLoader<
          string,
          ResolvedDimension[] | undefined,
          unknown
        >((cubeIri) =>
          getCubeDimensions(sparqlClient, datasource.url, cubeIri)
        ),
      },
    };
    const runCheck = async (check: Check) => {
      const start = Date.now();
      const result = await check.run(context);
      const end = Date.now();
      console.log("Check", check.name, "ran in", end - start, "ms");
      return {
        check: omit(check, "run"),
        result,
      };
    };

    const propChecks = await Promise.all(checks.map(runCheck));
    return {
      props: {
        cubeIri: cubeIri,
        checks: propChecks,
      },
    };
  }
  return {
    props: {
      cubeIri: "",
      checks: [],
    },
  };
};

export default Page;
