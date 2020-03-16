import { Trans } from "@lingui/macro";
import { Button } from "@theme-ui/components";
import { csvFormat } from "d3-dsv";
import { saveAs } from "file-saver";
import React, { memo, useMemo, ReactNode } from "react";
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
      <DownloadButton onClick={() => saveAs(blob, `${title}.csv`)}>
        <Trans id="button.download.data">Download data</Trans>
      </DownloadButton>
    );
  }
);

export const DownloadButton = ({
  onClick,
  children
}: {
  onClick?: () => void;
  children: ReactNode;
}) => (
  <Button
    variant="reset"
    sx={{
      background: "transparent",
      color: "primary",
      textAlign: "left",
      fontFamily: "body",
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [1, 2, 2],
      border: "none",
      cursor: "pointer",
      mt: 2,
      p: 0,
      ":disabled": {
        cursor: "initial",
        color: "monochrome500"
      }
    }}
    onClick={onClick}
  >
    {children}
  </Button>
);
