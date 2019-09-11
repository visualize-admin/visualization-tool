import DataSet from "@zazuko/query-rdf-data-cube/dist/node/dataset";
import { Literal } from "rdf-js";
import React from "react";
import { AppLayout } from "./layout";
import {
  DataCubeProvider,
  useDataSetMetadata,
  useDataSets,
  useDataSetData
} from "../domain/data-cube";
import { useLocale } from "../lib/use-locale";
import {
  Measure,
  Dimension
} from "@zazuko/query-rdf-data-cube/dist/node/components";

export const DSData = ({
  dataset,
  dimensions,
  measures
}: {
  dataset: DataSet;
  dimensions: Dimension[];
  measures: Measure[];
}) => {
  const locale = useLocale();
  const meta = useDataSetMetadata(dataset);
  const data = useDataSetData({ dataset, dimensions, measures });
  console.log(data.data);
  return data.state === "loaded" ? (
    <>
      <h3>Results</h3>
      <pre>{JSON.stringify(data.data, null, 2)}</pre>
    </>
  ) : null;
};
