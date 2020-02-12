import { Trans } from "@lingui/macro";
import { Button } from "@theme-ui/components";
import { csvFormat } from "d3-dsv";
import { saveAs } from "file-saver";
import React, { memo, useMemo } from "react";
import { ChartFields, Observation } from "../domain";
import { ComponentFieldsFragment } from "../graphql/query-hooks";

export interface ChartFieldsWithLabel {
  [x: string]: string;
}
export const DataDownload = memo(
  ({
    title,
    dimensions,
    measures,
    fields,
    observations
  }: {
    title: string;
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: ChartFields;
    observations: Observation[];
  }) => {
    const data = useMemo(() => {
      const columns = [...dimensions, ...measures];
      return observations.map(obs => {
        return Object.keys(obs).reduce((acc, key) => {
          const col = columns.find(d => d.iri === key);

          return col
            ? {
                ...acc,
                ...{ [col.label]: obs[key] }
              }
            : acc;
        }, {});
      });
    }, [dimensions, measures, observations]);

    const csvData = csvFormat(data);

    const blob = new Blob([csvData], {
      type: "text/plain;charset=utf-8"
    });
    return (
      <Button
        variant="downloadButton"
        onClick={() => saveAs(blob, `${title}.csv`)}
      >
        <Trans id="button.download.data">Download data</Trans>
      </Button>
    );
  }
);
