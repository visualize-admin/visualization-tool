import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { useMemo } from "react";
import { BarChartFields, useObservations } from "../domain";
import { Filters } from "../domain/config-types";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observations
} from "../domain/data";
import { useResizeObserver } from "../lib/use-resize-observer";
import { Bars } from "./charts-generic/bars";
import { Loading } from "./hint";
import { A11yTable } from "./a11y-table";

export const ChartBarsVisualization = ({
  dataSet,
  dimensions,
  measures,
  filters,
  fields,
  palette
}: {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  filters?: Filters;
  fields: BarChartFields;
  palette: string;
}) => {
  // Explicitly specify all dimension fields.
  // TODO: Improve/optimize/generalize this
  const allFields = useMemo(() => {
    const fieldIris = new Set(Object.values(fields));
    const restDimensions = dimensions.reduce<{ [k: string]: string }>(
      (acc, d, i) => {
        if (!fieldIris.has(d.component.iri.value)) {
          acc[`dim${i}`] = d.component.iri.value;
        }
        return acc;
      },
      {}
    );

    return { ...restDimensions, ...fields };
  }, [fields, dimensions]);

  const observations = useObservations<BarChartFields>({
    dataSet,
    measures,
    dimensions,
    fields: allFields,
    filters
  });

  if (observations.state === "loaded") {
    // const formattedData = formatDataForBarChart({
    //   observations: observations.data.results,
    //   dimensions,
    //   measures,
    //   fields
    // });

    return (
      <>
        <A11yTable
          dataSet={dataSet}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
          observations={observations.data}
        />
        <ChartBars
          observations={observations.data}
          palette={palette}
          dimensions={dimensions}
          measures={measures}
          fields={allFields}
        />
      </>
    );
  } else {
    return <Loading />;
  }
};

export const ChartBars = ({
  observations,
  dimensions,
  measures,
  palette,
  fields
}: {
  observations: Observations<BarChartFields>;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];

  palette: string;
  fields: BarChartFields;
}) => {
  const [resizeRef, width] = useResizeObserver();

  return (
    <div ref={resizeRef} aria-hidden="true">
      <Bars
        data={observations}
        width={width}
        xField={"xField"}
        heightField="heightField"
        groupBy={"groupByField"}
        aggregateFunction={"sum"}
        dimensions={dimensions}
        measures={measures}
        fields={fields}
        palette={palette}
      />
    </div>
  );
};
