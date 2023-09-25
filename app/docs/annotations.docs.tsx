import { Box } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { markdown, ReactSpecimen } from "catalog";
import keyBy from "lodash/keyBy";
import { ReactNode } from "react";

import { ColumnChart } from "@/charts/column/columns-state";
import { RulerContent } from "@/charts/shared/interaction/ruler";
import { TooltipBox } from "@/charts/shared/interaction/tooltip-box";
import {
  TooltipMultiple,
  TooltipSingle,
} from "@/charts/shared/interaction/tooltip-content";
import Flex from "@/components/flex";
import {
  dimensions,
  fields,
  margins,
  measures,
  observations,
} from "@/docs/fixtures";
import { InteractiveFiltersProvider } from "@/stores/interactive-filters";

export default () => markdown`



# Tooltips

> Tooltips are used to display information on user interaction with a visualization. They can be placed along 2 axis, vertical and horizontal, to define the placement that fits the viewport best.

### TooltipBox
${(
  <ReactSpecimen>
    <InteractiveFiltersProvider>
      <ColumnChart
        observations={observations}
        measures={measures}
        measuresByIri={keyBy(measures, (d) => d.iri)}
        dimensions={dimensions}
        dimensionsByIri={keyBy(dimensions, (d) => d.iri)}
        chartConfig={{
          version: "1.4.2",
          chartType: "column",
          fields,
          interactiveFiltersConfig: {
            legend: { active: false, componentIri: "" },
            timeRange: {
              active: false,
              componentIri: "",
              presets: { type: "range", from: "", to: "" },
            },
            dataFilters: { active: false, componentIris: [] },
            calculation: { active: false, type: "identity" },
          },
          filters: {},
        }}
        aspectRatio={0.4}
      >
        <Flex>
          <div style={{ width: 200, height: 150, position: "relative" }}>
            <Dot />
            <TooltipBox
              x={100}
              y={100}
              placement={{ x: "left", y: "top" }}
              margins={margins}
            >
              <TooltipContent>Left / Top </TooltipContent>
            </TooltipBox>
          </div>
          <div style={{ width: 200, height: 150, position: "relative" }}>
            <Dot />
            <TooltipBox
              x={100}
              y={100}
              placement={{ x: "center", y: "top" }}
              margins={margins}
            >
              <TooltipContent>Center / Top </TooltipContent>
            </TooltipBox>
          </div>
          <div style={{ width: 200, height: 150, position: "relative" }}>
            <Dot />
            <TooltipBox
              x={100}
              y={100}
              placement={{ x: "right", y: "top" }}
              margins={margins}
            >
              <TooltipContent>Right / Top </TooltipContent>
            </TooltipBox>
          </div>
        </Flex>
        <Flex>
          <div style={{ width: 200, height: 150, position: "relative" }}>
            <Dot />
            <TooltipBox
              x={100}
              y={100}
              placement={{ x: "left", y: "middle" }}
              margins={margins}
            >
              <TooltipContent>Left / Middle </TooltipContent>
            </TooltipBox>
          </div>
          <div style={{ width: 200, height: 150, position: "relative" }}>
            <Dot />
            <TooltipBox
              x={100}
              y={100}
              placement={{ x: "center", y: "middle" }}
              margins={margins}
            >
              <TooltipContent>Center / Middle </TooltipContent>
            </TooltipBox>
          </div>
          <div style={{ width: 200, height: 150, position: "relative" }}>
            <Dot />
            <TooltipBox
              x={100}
              y={100}
              placement={{ x: "right", y: "middle" }}
              margins={margins}
            >
              <TooltipContent>Right / Middle </TooltipContent>
            </TooltipBox>
          </div>
        </Flex>
        <Flex>
          <div style={{ width: 200, height: 150, position: "relative" }}>
            <Dot />
            <TooltipBox
              x={100}
              y={100}
              placement={{ x: "left", y: "bottom" }}
              margins={margins}
            >
              <TooltipContent>Left / Bottom </TooltipContent>
            </TooltipBox>
          </div>
          <div style={{ width: 200, height: 150, position: "relative" }}>
            <Dot />
            <TooltipBox
              x={100}
              y={100}
              placement={{ x: "center", y: "bottom" }}
              margins={margins}
            >
              <TooltipContent>Center / Bottom </TooltipContent>
            </TooltipBox>
          </div>
          <div style={{ width: 200, height: 150, position: "relative" }}>
            <Dot />
            <TooltipBox
              x={100}
              y={100}
              placement={{ x: "right", y: "bottom" }}
              margins={margins}
            >
              <TooltipContent>Right / Bottom </TooltipContent>
            </TooltipBox>
          </div>
        </Flex>
      </ColumnChart>
    </InteractiveFiltersProvider>
  </ReactSpecimen>
)}


In practice, the placement of tooltips is automatically calculated in the chart state, according to the mouse position and the anchor data point, with the constraint that tooltips never overflow the chart viewport.

The \`TooltipBox\` is only a container that defines the placement of the tooltip. Any component can be displayed within this container.

### Tooltip Content

There are two types of tooltips:
- \`single\`: when there is only one data point to display, in a column chart or a single line chart for instance,
- \`multiple\`: when several values must be displayed, in a stacked columns chart or an area chart for instance.

${(
  <ReactSpecimen span={2}>
    <InteractiveFiltersProvider>
      <ColumnChart
        observations={observations}
        measures={measures}
        measuresByIri={keyBy(measures, (d) => d.iri)}
        dimensions={dimensions}
        dimensionsByIri={keyBy(dimensions, (d) => d.iri)}
        chartConfig={{
          version: "1.4.2",
          chartType: "column",
          fields,
          interactiveFiltersConfig: {
            legend: { active: false, componentIri: "" },
            timeRange: {
              active: false,
              componentIri: "",
              presets: { type: "range", from: "", to: "" },
            },
            dataFilters: { active: false, componentIris: [] },
            calculation: { active: false, type: "identity" },
          },
          filters: {},
        }}
        aspectRatio={0.4}
      >
        <div style={{ width: 200, height: 150, position: "relative" }}>
          <Dot />
          <TooltipBox
            x={100}
            y={100}
            placement={{ x: "left", y: "top" }}
            margins={margins}
          >
            <TooltipSingle
              xValue="Jahr 2017"
              segment="10'987'372"
              yValue="Alpen"
            />
          </TooltipBox>
        </div>
      </ColumnChart>
    </InteractiveFiltersProvider>
  </ReactSpecimen>
)}

${(
  <ReactSpecimen span={2}>
    <InteractiveFiltersProvider>
      <ColumnChart
        observations={observations}
        measures={measures}
        measuresByIri={keyBy(measures, (d) => d.iri)}
        dimensions={dimensions}
        dimensionsByIri={keyBy(dimensions, (d) => d.iri)}
        chartConfig={{
          version: "1.4.2",
          chartType: "column",
          fields,
          interactiveFiltersConfig: {
            legend: { active: false, componentIri: "" },
            timeRange: {
              active: false,
              componentIri: "",
              presets: { type: "range", from: "", to: "" },
            },
            dataFilters: { active: false, componentIris: [] },
            calculation: { active: false, type: "identity" },
          },
          filters: {},
        }}
        aspectRatio={0.4}
      >
        <div style={{ width: 200, height: 150, position: "relative" }}>
          <Dot />
          <TooltipBox
            x={100}
            y={100}
            placement={{ x: "right", y: "middle" }}
            margins={margins}
          >
            <TooltipMultiple
              xValue="Jahr 2014"
              segmentValues={[
                { label: "Bern", value: "235", color: "Orchid" },
                { label: "Zürich", value: "450", color: "LightSeaGreen" },
                { label: "Lausanne", value: "435", color: "Orange" },
              ]}
            />
          </TooltipBox>
        </div>
      </ColumnChart>
    </InteractiveFiltersProvider>
  </ReactSpecimen>
)}


### How to use

~~~
import { TooltipBox, Tooltip } from "../components/charts-generic/annotations";

<TooltipBox
  x={100}
  y={100}
  placement={{
    x: "left" | "center" | "right" ,
    y: "top" | "middle" | "bottom"
  }}
  margins={margins}
>

  <TooltipSingle
    xValue="Jahr 2017"
    segment="10'987'372"
    yValue="Alpen"
  />

</TooltipBox>
~~~


# Ruler

> A ruler is used to highlight multiple values aligned on the horizontal axis. Tooltip and highlight dots are optional.


${(
  <ReactSpecimen span={2}>
    <div style={{ width: 200, height: 450, position: "relative" }}>
      <RulerContent
        xValue={"2014"}
        values={[
          { label: "Zürich", value: "450", color: "Orchid", yPos: 450 - 450 },
          {
            label: "Lausanne",
            value: "435",
            color: "LightSeaGreen",
            yPos: 450 - 435,
          },
          { label: "Bern", value: "235", color: "Orange", yPos: 450 - 235 },
        ]}
        chartHeight={450}
        margins={margins}
        xAnchor={100}
        datum={{
          label: "Zürich",
          value: "450",
          color: "Orchid",
        }}
        placement={{ x: "right", y: "middle" }}
      />
    </div>
  </ReactSpecimen>
)}
`;

const useStyles = makeStyles(() => ({
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "hotpink",

    position: "absolute",
    left: 100,
    top: 100,
    transform: "translate3d(-50%, -50%, 0)",

    pointerEvents: "none",
  },
}));

export const Dot = () => {
  const classes = useStyles();
  return <Box className={classes.dot} />;
};
const TooltipContent = ({ children }: { children: ReactNode }) => (
  <Box sx={{ fontSize: "0.875rem" }}>{children}</Box>
);
