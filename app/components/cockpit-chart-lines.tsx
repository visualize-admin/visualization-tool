import { DataCube, Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React, { useEffect } from "react";
import { useObservations } from "../domain/data-cube";
import { ChartLines } from "./charts-lines";
import { Field } from "./field";
import { Loader } from "./loader";
import { useConfiguratorState } from "../domain/configurator-state";

export const ChartLinesControls = ({
  chartId,
  timeDimensions,
  categoricalDimensions,
  measuresDimensions,
  initialState
}: {
  chartId: string;
  timeDimensions: Dimension[];
  categoricalDimensions: Dimension[];
  measuresDimensions: Dimension[];
  initialState: any;
}) => {
  const [state, dispatch] = useConfiguratorState({ chartId });
  useEffect(() => {
    dispatch({
      type: "CHART_CONFIG_INITIALIZED",
      value: {
        path: "chartConfig",
        value: initialState
      }
    });
  }, [
    categoricalDimensions,
    dispatch,
    initialState,
    measuresDimensions,
    timeDimensions
  ]);

  return (
    <>
      <h5>X Axis (Time)</h5>
      {timeDimensions.map(td => (
        <Field
          key={td.iri.value}
          type="radio"
          chartId={chartId}
          path={"x"}
          label={td.labels[0].value}
          value={td.iri.value}
        />
      ))}
      <h5>Y Axis (Values)</h5>
      {measuresDimensions.map(md => (
        <Field
          key={md.iri.value}
          type="radio"
          chartId={chartId}
          path={"height"}
          label={md.labels[0].value}
          value={md.iri.value}
        />
      ))}
      <h5>Color (Categories)</h5>
      {categoricalDimensions.map(cd => (
        <Field
          key={cd.iri.value}
          type="radio"
          chartId={chartId}
          path={"color"}
          label={cd.labels[0].value}
          value={cd.iri.value}
        />
      ))}
    </>
  );
};

export const ChartLinesVisualization = ({
  dataSet,
  dimensions,
  measures,
  filters,
  xField,
  groupByField,
  heightField
}: {
  dataSet: DataCube;
  dimensions: Dimension[];
  measures: Measure[];
  filters?: any;
  xField: string;
  groupByField: string;
  heightField: string;
}) => {
  const observations = useObservations({
    dataSet,
    measures,
    dimensions,
    xField,
    heightField,
    groupByField,
    filters
  });

  if (observations.state === "loaded") {
    return (
      <ChartLines
        observations={observations.data.results}
        dimensions={dimensions}
        xField={xField}
        groupByField={groupByField}
        heightField={heightField}
        aggregationFunction={"sum"}
      />
    );
  } else {
    return <Loader body="Updating data..." />;
  }
};
