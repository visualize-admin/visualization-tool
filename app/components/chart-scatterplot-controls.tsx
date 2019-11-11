import React from "react";
import { ColorPalette, ControlList, ControlSection } from "./chart-controls";
import { Field } from "./field";
import { DimensionWithMeta, MeasureWithMeta } from "../domain/data";

export const ChartScatterplotControls = ({
  chartId,
  measuresDimensions,
  categoricalDimensions,
  timeDimensions
}: {
  chartId: string;
  measuresDimensions: MeasureWithMeta[];
  categoricalDimensions: DimensionWithMeta[];
  timeDimensions: DimensionWithMeta[];
}) => {
  return (
    <>
      <ControlSection title="Horizontale Achse" note="x-Achse">
        <ControlList>
          <Field
            type="select"
            chartId={chartId}
            path={"x"}
            label={"Werte wählen"}
            options={measuresDimensions.map(({ component }) => ({
              value: component.iri.value,
              label: component.labels[0].value
            }))}
          />
        </ControlList>
      </ControlSection>
      <ControlSection title="Vertikale Achse" note="y-Achse">
        <ControlList>
          <Field
            type="select"
            chartId={chartId}
            path={"y"}
            label={"Werte wählen"}
            options={measuresDimensions.map(({ component }) => ({
              value: component.iri.value,
              label: component.labels[0].value
            }))}
          />
        </ControlList>
      </ControlSection>
      <ControlSection title="Farbe">
        <ControlList>
          <Field
            type="select"
            chartId={chartId}
            path={"color"}
            label={"Dimension wählen"}
            options={categoricalDimensions.map(({ component }) => ({
              value: component.iri.value,
              label: component.labels[0].value
            }))}
          />
        </ControlList>
      </ControlSection>
      <ControlSection title="Beschriftung">
        <ControlList>
          <Field
            type="select"
            chartId={chartId}
            path={"label"}
            label={"Dimension wählen"}
            options={[...categoricalDimensions, ...timeDimensions].map(
              ({ component }) => ({
                value: component.iri.value,
                label: component.labels[0].value
              })
            )}
          />
        </ControlList>
      </ControlSection>
      <ControlSection title="Darstellung">
        <ControlList>
          <ColorPalette />
        </ControlList>
      </ControlSection>
    </>
  );
};
