import { DataCube } from "@zazuko/query-rdf-data-cube";
import React from "react";
import {
  getComponentIri,
  getDimensionLabel,
  useDimensionValues,
  isTimeDimension,
  DimensionWithMeta
} from "../domain";
import { Field } from "./field";
import { Loading } from "./hint";
import { ControlSection, ControlList } from "./chart-controls";
import { useConfiguratorState } from "../domain/configurator-state";
import { Literal, NamedNode } from "rdf-js";
import { Text } from "rebass";
import { Trans } from "@lingui/macro";

export const Filters = ({
  chartId,
  dataSet,
  dimensions
}: {
  chartId: string;
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
}) => {
  return (
    <>
      {dimensions.map(dimension => {
        return (
          <ControlSection
            key={getComponentIri(dimension)}
            title={getDimensionLabel(dimension)}
          >
            <ControlList>
              <DimensionValues
                chartId={chartId}
                dataSet={dataSet}
                dimension={dimension}
              />
            </ControlList>
          </ControlSection>
        );
      })}
    </>
  );
};

const DimensionValues = ({
  chartId,
  dataSet,
  dimension
}: {
  chartId: string;
  dataSet: DataCube;
  dimension: DimensionWithMeta;
}) => {
  // FIXME: SIMPLIFY
  const dimensionValues = useDimensionValues({ dataSet, dimension:dimension.component });
  const dimensionIri = getComponentIri(dimension);
  const [, dispatch] = useConfiguratorState();

  const [all, toggleAll] = React.useState(false);

  const toggle = (
    dimIri: string,
    dimVal: {
      label: Literal;
      value: NamedNode;
    }[]
  ) => {
    toggleAll(!all);
    dispatch({
      type: "CHART_CONFIG_CHANGED",
      value: {
        path: `filters["${dimIri}"]`,
        value: all
          ? { [dimVal[0].value.value]: true }
          : Object.values(dimVal).reduce(
              (obj, cur, i) => ({ ...obj, [cur.value.value]: true }),
              {}
            )
      }
    });
  };

  if (dimensionValues.state === "loaded") {
    return (
      <>
        {!isTimeDimension(dimension) && (
          <Text
            variant="paragraph2"
            mb={4}
            onClick={() => toggle(dimensionIri, dimensionValues.data)}
            sx={{ textDecoration: "underline", cursor: "pointer" }}
          >
            {all ? (
              <Trans>Nur erste auswählen</Trans>
            ) : (
              <Trans>Alle auswählen</Trans>
            )}
          </Text>
        )}
        {dimensionValues.data.map(dv => {
          return (
            <Field
              key={dv.value.value}
              type="checkbox"
              chartId={chartId}
              path={`filters["${dimensionIri}"]["${dv.value.value}"]`}
              label={
                isTimeDimension(dimension) ? dv.value.value : dv.label.value
              }
              value={dv.value.value}
            />
          );
        })}
      </>
    );
  } else {
    return <Loading />;
  }
};
