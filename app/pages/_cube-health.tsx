import { Button, Link, Stack, TextField, Typography } from "@mui/material";
import { DESCRIBE } from "@tpluscode/sparql-builder";
import clownface, { AnyPointer } from "clownface";
import DataLoader from "dataloader";
import { omit } from "lodash";
import { GetServerSideProps, NextPage } from "next";
import { parseBody } from "next/dist/server/api-utils";
import rdf from "rdf-ext";
import React from "react";

import { ContentLayout } from "@/components/layout";
import { fromStream, sparqlClientStream } from "@/rdf/sparql-client";

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

const describeCubes = async (cubeIris: readonly string[]) => {
  return Promise.all(
    cubeIris.map(async (cubeIri) => {
      console.log("DESCRIBING CUBE");
      const query = DESCRIBE`<${cubeIri}>`;
      const stream = await query.execute(sparqlClientStream.query);
      const dataset = await fromStream(rdf.dataset(), stream);
      console.log({ dataset });
      return clownface({ dataset });
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
    name: "Is viewable on visualize.admin",
    description:
      "Should have a predicate schema:workExample <https://ld.admin.ch/application/visualize>",
    run: async ({ cubeIri, loaders }) => {
      const cube = await loaders.describeCubes.load(cubeIri);
      const workExamples = cube.out(ns.schema.workExample).values;
      console.log(workExamples);
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
];

const Page: NextPage<PageProps> = ({ checks, cubeIri }) => {
  return (
    <>
      <ContentLayout>
        <Stack maxWidth={1024} mx="auto" mt={8} spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h1">Cube checker</Typography>
            <form method="post">
              <Stack spacing={1} alignItems="start">
                <TextField
                  type="text"
                  name="cubeIri"
                  defaultValue={cubeIri}
                  inputProps={{ size: 50 }}
                />
                <Button type="submit" variant="contained">
                  Check
                </Button>
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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (req.method === "POST") {
    // @ts-ignore TODO
    const { cubeIri } = await parseBody(req, "1mb");
    if (!cubeIri) {
      throw new Error("Form data should have cubeIri");
    }

    const context = {
      cubeIri,
      loaders: {
        describeCubes: new DataLoader(describeCubes),
      },
    };
    const propChecks = await Promise.all(
      checks.map(async (c) => ({
        check: omit(c, "run"),
        result: await c.run(context),
      }))
    );
    return {
      props: {
        cubeIri: cubeIri,
        checks: propChecks,
      },
    };
  }
  return {
    props: {
      checks: [],
    },
  };
};

export default Page;
