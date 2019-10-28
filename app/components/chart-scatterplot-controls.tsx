import { Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { ColorPalette, ControlList, ControlSection } from "./chart-controls";
import { Field } from "./field";

export const ChartScatterplotControls = ({
  chartId,
  measuresDimensions,
  categoricalDimensions,
  timeDimensions
}: {
  chartId: string;
  measuresDimensions: Dimension[];
  categoricalDimensions: Dimension[];
  timeDimensions: Dimension[];
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
            options={measuresDimensions.map(dim => ({
              value: dim.iri.value,
              label: dim.labels[0].value
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
            options={measuresDimensions.map(dim => ({
              value: dim.iri.value,
              label: dim.labels[0].value
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
            options={categoricalDimensions.map(dim => ({
              value: dim.iri.value,
              label: dim.labels[0].value
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
            options={timeDimensions.map(dim => ({
              value: dim.iri.value,
              label: dim.labels[0].value
            }))}
          />
        </ControlList>
      </ControlSection>
      <ControlSection title="Darstellung">
        <ControlList>
          <ColorPalette
            type="select"
            chartId={chartId}
            path={"palette"}
            label={"Farbpalette:"}
          />
        </ControlList>
      </ControlSection>
    </>
  );
};
