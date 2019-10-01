import { DataCube, Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React, { useEffect } from "react";
import { useObservations, getDimensionIri } from "../domain/data-cube";
import { ChartBars } from "./charts-bars";
import { Field } from "./field";
import { Loader } from "./loader";
import { useConfiguratorState } from "../domain/configurator-state";

export const ChartBarsControls = ({
  chartId,
  timeDimensions,
  categoricalDimensions,
  measuresDimensions
}: {
  chartId: string;
  timeDimensions: Dimension[];
  categoricalDimensions: Dimension[];
  measuresDimensions: Dimension[];
}) => {
  const [state, dispatch] = useConfiguratorState({ chartId });

  useEffect(() => {
    dispatch({
      type: "CHART_CONFIG_CHANGED",
      value: {
        path: "x",
        value: getDimensionIri({ dimension: categoricalDimensions[0] })
      }
    });
    dispatch({
      type: "CHART_CONFIG_CHANGED",
      value: {
        path: "height",
        value: getDimensionIri({ dimension: measuresDimensions[0] })
      }
    });
    dispatch({
      type: "CHART_CONFIG_CHANGED",
      value: {
        path: "color",
        value: getDimensionIri({ dimension: categoricalDimensions[0] })
      }
    });
  }, [categoricalDimensions, dispatch, measuresDimensions]);

  return (
    <>
      <h5>X Axis (Categories)</h5>
      {categoricalDimensions.map(cd => (
        <Field
          key={cd.iri.value}
          type="radio"
          chartId={chartId}
          path={"x"}
          label={cd.labels[0].value}
          value={cd.iri.value}
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

export const ChartBarsVisualization = ({
  dataset,
  dimensions,
  measures,
  filters,
  xField,
  groupByField,
  heightField
}: {
  dataset: DataCube;
  dimensions: Dimension[];
  measures: Measure[];
  filters?: any;
  xField: string;
  groupByField: string;
  heightField: string;
}) => {
  const observations = useObservations({
    dataset,
    measures,
    dimensions,
    xField,
    heightField,
    groupByField,
    filters
  });

  if (observations.state === "loaded") {
    return (
      <ChartBars
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
