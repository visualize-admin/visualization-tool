import { DataCube, Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import { format } from "d3-format";
import * as React from "react";
import { Box } from "rebass";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  ObservationPreview,
  usePreviewObservations
} from "../domain";
import { Loading } from "./hint";
import { useMemo } from "react";

interface Header {
  headerIndex: string;
  header: string;
  componentType: string;
}
const formatNumber = format(",.2~f");

const Table = ({
  title,
  headers,
  observations
}: {
  title: string;
  headers: Header[];
  observations: ObservationPreview[];
}) => {
  return (
    <Box
      as="table"
      sx={{
        minWidth: "100%",
        borderCollapse: "collapse"
      }}
    >
      <caption style={{ display: "none" }}>{title}</caption>
      <tbody>
        <Box as="tr" variant="datatable.headerRow">
          {headers.map(({ header, componentType }) => {
            return (
              <Box
                as="th"
                variant="datatable.headerCell"
                role="columnheader"
                scope="col"
                key={header}
                sx={{
                  textAlign: componentType === "measure" ? "right" : "left"
                }}
              >
                {header}
              </Box>
            );
          })}
        </Box>
        {observations.map((obs, i) => {
          return (
            <Box as="tr" variant="datatable.row" key={i}>
              {headers.map(({ headerIndex, componentType }) => (
                <Box
                  key={headerIndex}
                  as="td"
                  variant="datatable.cell"
                  sx={{
                    textAlign: componentType === "measure" ? "right" : "left"
                  }}
                >
                  {componentType === "measure"
                    ? formatNumber(+obs[headerIndex])
                    : obs[headerIndex]}
                </Box>
              ))}
            </Box>
          );
        })}
      </tbody>
    </Box>
  );
};

export const DataTable = ({
  dataSet,
  dimensions,
  measures
}: {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
}) => {
  const selection: [string, Dimension | Measure][] = useMemo(
    () =>
      [...dimensions, ...measures].map((comp, i) => [`${i}`, comp.component]),
    [dimensions, measures]
  );

  const observations = usePreviewObservations({
    dataSet,
    selection
  });

  const headers: Header[] = Object.entries(selection).map(([key, value]) => ({
    headerIndex: key,
    header: value[1].label.value,
    componentType: value[1].componentType
  }));

  if (observations.data) {
    return (
      <Table
        title={dataSet.labels[0].value}
        headers={headers}
        observations={observations.data}
      />
    );
  } else {
    return <Loading />;
  }
};
