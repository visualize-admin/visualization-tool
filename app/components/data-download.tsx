import { Trans } from "@lingui/macro";
import { DataCube } from "@zazuko/query-rdf-data-cube";
import { csvFormat } from "d3-dsv";
import { saveAs } from "file-saver";
import React, { memo, useMemo } from "react";
import { Button } from "@theme-ui/components";
import {
  ChartFields,
  DimensionWithMeta,
  MeasureWithMeta,
  Observations
} from "../domain";

export interface ChartFieldsWithLabel {
  [x: string]: string;
}
export const DataDownload = memo(
  ({
    dataSet,
    dimensions,
    measures,
    fields,
    observations
  }: {
    dataSet: DataCube;
    dimensions: DimensionWithMeta[];
    measures: MeasureWithMeta[];
    fields: ChartFields;
    observations: Observations<ChartFields>;
  }) => {
    const fieldsWithLabel: ChartFieldsWithLabel = useMemo(
      () =>
        Object.entries(fields).reduce(
          (obj, [key, value]) => ({
            ...obj,
            [key]: [...dimensions, ...measures].find(
              c => c.component.iri.value === value?.componentIri
            )?.component.label.value
          }),
          {}
        ),
      [dimensions, fields, measures]
    );

    const data = useMemo(
      () =>
        observations.map(obs =>
          Object.keys(obs).reduce(
            (acc, key) => ({
              ...acc,
              ...{ [fieldsWithLabel[key]]: obs[key] }
            }),
            {}
          )
        ),
      [fieldsWithLabel, observations]
    );

    const csvData = csvFormat(data);

    const blob = new Blob([csvData], {
      type: "text/plain;charset=utf-8"
    });
    return (
      <Button
        variant="downloadButton"
        onClick={() => saveAs(blob, `${dataSet.label.value}.csv`)}
      >
        <Trans id="button.download.data">Download data</Trans>
      </Button>
    );
  }
);
