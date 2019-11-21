import React from "react";
import {
  ColorPalette,
  ControlList,
  CollapsibleSection
} from "./chart-controls";
import { Field } from "./field";
import { DimensionWithMeta, MeasureWithMeta } from "../domain/data";

export const ChartScatterplotControls = ({
  measuresDimensions,
  categoricalDimensions,
  timeDimensions
}: {
  measuresDimensions: MeasureWithMeta[];
  categoricalDimensions: DimensionWithMeta[];
  timeDimensions: DimensionWithMeta[];
}) => {
  return (
    <>
      <CollapsibleSection title="Horizontale Achse">
        <ControlList>
          <Field
            type="select"
            path={"x"}
            label={"Werte wählen"}
            options={measuresDimensions.map(({ component }) => ({
              value: component.iri.value,
              label: component.label.value
            }))}
          />
        </ControlList>
      </CollapsibleSection>
      <CollapsibleSection title="Vertikale Achse">
        <ControlList>
          <Field
            type="select"
            path={"y"}
            label={"Werte wählen"}
            options={measuresDimensions.map(({ component }) => ({
              value: component.iri.value,
              label: component.label.value
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
            options={categoricalDimensions.map(({ component }) => ({
              value: component.iri.value,
              label: component.label.value
            }))}
          />
        </ControlList>
      </CollapsibleSection>
      <CollapsibleSection title="Beschriftung">
        <ControlList>
          <Field
            type="select"
            path={"label"}
            label={"Dimension wählen"}
            options={[...categoricalDimensions, ...timeDimensions].map(
              ({ component }) => ({
                value: component.iri.value,
                label: component.label.value
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
