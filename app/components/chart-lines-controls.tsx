import { Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { ColorPalette, ControlList, ControlSection } from "./chart-controls";
import { Field } from "./field";

export const ChartLinesControls = ({
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
  return (
    <>
      <ControlSection title="Horizontale Achse" note="x-Achse">
        <ControlList>
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
        </ControlList>
      </ControlSection>
      <ControlSection title="Vertikale Achse" note="y-Achse">
        <ControlList>
          <Field
            type="select"
            chartId={chartId}
            path={"height"}
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
