import React from "react";
import { DimensionWithMeta, MeasureWithMeta } from "../domain/data";
import {
  ColorPalette,
  ControlList,
  CollapsibleSection
} from "./chart-controls";
import { Field } from "./field";

export const ChartColumnsControls = ({
  timeDimensions,
  categoricalDimensions,
  measuresDimensions
}: {
  timeDimensions: DimensionWithMeta[];
  categoricalDimensions: DimensionWithMeta[];
  measuresDimensions: MeasureWithMeta[];
}) => {
  return (
    <>
      <CollapsibleSection title="Horizontale Achse">
        <ControlList>
          <Field
            type="select"
            path={"x"}
            label={"Dimension wählen"}
            options={[...timeDimensions, ...categoricalDimensions].map(
              ({ component }) => ({
                value: component.iri.value,
                label: component.labels[0].value
              })
            )}
          />
        </ControlList>
      </CollapsibleSection>
      <CollapsibleSection title="Vertikale Achse">
        <ControlList>
          <Field
            type="select"
            path={"height"}
            label={"Werte wählen"}
            options={measuresDimensions.map(({ component }) => ({
              value: component.iri.value,
              label: component.labels[0].value
            }))}
          />
        </ControlList>
      </CollapsibleSection>
      <CollapsibleSection title="Farbe">
        <ControlList>
          <Field
            type="select"
            path={"color"}
            label={"Dimension wählen"}
            options={[...timeDimensions, ...categoricalDimensions].map(
              ({ component }) => ({
                value: component.iri.value,
                label: component.labels[0].value
              })
            )}
          />
        </ControlList>
      </CollapsibleSection>
      <CollapsibleSection title="Darstellung">
        <ControlList>
          <ColorPalette />
        </ControlList>
      </CollapsibleSection>
    </>
  );
};
