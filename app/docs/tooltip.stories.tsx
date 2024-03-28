import { Box } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Meta } from "@storybook/react";
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
import { CHART_CONFIG_VERSION } from "@/utils/chart-config/versioning";

import { ReactSpecimen } from "./catalog";

const meta: Meta = {
  title: "components / Tooltip",
  component: TooltipBox,
};

export default meta;

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

const Dot = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const classes = useStyles();
  return <Box className={classes.dot} />;
};

const TooltipContent = ({ children }: { children: ReactNode }) => (
  <Box sx={{ fontSize: "0.875rem" }}>{children}</Box>
);

const TooltipBoxStory = () => (
  <ReactSpecimen>
    <InteractiveFiltersProvider>
      <ColumnChart
        observations={observations}
        measures={measures}
        measuresByIri={keyBy(measures, (d) => d.iri)}
        dimensions={dimensions}
        dimensionsByIri={keyBy(dimensions, (d) => d.iri)}
        chartConfig={{
          key: "column-chart",
          version: CHART_CONFIG_VERSION,
          meta: {
            title: {
              en: "",
              de: "",
              fr: "",
              it: "",
            },
            description: {
              en: "",
              de: "",
              fr: "",
              it: "",
            },
          },
          cubes: [
            {
              iri: "",
              filters: {},
            },
          ],
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
          activeField: undefined,
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
);

export { TooltipBoxStory as TooltipBox };

const TooltipContentStory = {
  render: () => (
    <InteractiveFiltersProvider>
      <ColumnChart
        observations={observations}
        measures={measures}
        measuresByIri={keyBy(measures, (d) => d.iri)}
        dimensions={dimensions}
        dimensionsByIri={keyBy(dimensions, (d) => d.iri)}
        chartConfig={{
          key: "column-chart",
          version: CHART_CONFIG_VERSION,
          meta: {
            title: {
              en: "",
              de: "",
              fr: "",
              it: "",
            },
            description: {
              en: "",
              de: "",
              fr: "",
              it: "",
            },
          },
          cubes: [
            {
              iri: "",
              filters: {},
            },
          ],
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
          activeField: undefined,
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
  ),
};

export { TooltipContentStory as TooltipContent };

export const TooltipContentStory2 = {
  render: () => (
    <InteractiveFiltersProvider>
      <ColumnChart
        observations={observations}
        measures={measures}
        measuresByIri={keyBy(measures, (d) => d.iri)}
        dimensions={dimensions}
        dimensionsByIri={keyBy(dimensions, (d) => d.iri)}
        chartConfig={{
          key: "column-chart",
          version: CHART_CONFIG_VERSION,
          meta: {
            title: {
              en: "",
              de: "",
              fr: "",
              it: "",
            },
            description: {
              en: "",
              de: "",
              fr: "",
              it: "",
            },
          },
          cubes: [
            {
              iri: "",
              filters: {},
            },
          ],
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
          activeField: undefined,
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
  ),
};

export { TooltipContentStory2 as TooltipContent2 };

const RulerStory = {
  render: () => {
    return (
      <div style={{ width: 200, height: 450, position: "relative" }}>
        <RulerContent
          rotate={false}
          xValue={"2014"}
          values={[
            {
              label: "Zürich",
              value: "450",
              color: "Orchid",
              yPos: 450 - 450,
            },
            {
              label: "Lausanne",
              value: "435",
              color: "LightSeaGreen",
              yPos: 450 - 435,
            },
            {
              label: "Bern",
              value: "235",
              color: "Orange",
              yPos: 450 - 235,
            },
          ]}
          chartHeight={450}
          margins={{ top: 10, right: 10, bottom: 10, left: 10 }}
          xAnchor={100}
          datum={{
            label: "Zürich",
            value: "450",
            color: "Orchid",
          }}
          placement={{ x: "right", y: "middle" }}
        />
      </div>
    );
  },
};

export { RulerStory as Ruler };
