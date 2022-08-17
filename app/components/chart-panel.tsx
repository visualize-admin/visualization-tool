import { BoxProps } from "@mui/material";
import { ReactNode } from "react";

import Flex from "@/components/flex";
import {
  ChartType,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateDescribingChart,
  ConfiguratorStatePublishing,
} from "@/configurator";
import { useConfiguratorState } from "@/src";

import { ChartSelectionTabs } from "./chart-selection-tabs";

type ChartPanelProps = { children: ReactNode } & BoxProps;

export const ChartPanelConfigurator = (props: ChartPanelProps) => {
  // This type of chart panel can only appear for below steps.
  const [state] = useConfiguratorState() as unknown as [
    | ConfiguratorStateConfiguringChart
    | ConfiguratorStateDescribingChart
    | ConfiguratorStatePublishing
  ];

  return (
    <>
      <ChartSelectionTabs
        editable={false}
        chartType={state.chartConfig.chartType}
      />
      <ChartPanelInner showTabs {...props} />
    </>
  );
};

export const ChartPanelPublished = (
  props: ChartPanelProps & { chartType: ChartType }
) => {
  const { chartType, ...rest } = props;

  return (
    <>
      {/* TODO: Re-enable in the future, when chart composition is implemented */}
      {/* <ChartSelectionTabs editable={false} chartType={chartType} /> */}
      <ChartPanelInner showTabs={false} {...rest} />
    </>
  );
};

const ChartPanelInner = ({
  children,
  showTabs = true,
  ...boxProps
}: ChartPanelProps & { showTabs: boolean }) => (
  <Flex
    {...boxProps}
    sx={{
      flexDirection: "column",
      backgroundColor: "grey.100",
      boxShadow: 6,
      borderRadius: 12,
      borderTopLeftRadius: showTabs ? 0 : 12,
      // TODO: Handle properly when chart composition is implemented (enable when
      // ChartSelectionTabs becomes scrollable)
      borderTopRightRadius: 12,
      overflow: "hidden",
      width: "auto",
      minHeight: [150, 300, 500],
      ...boxProps.sx,
    }}
  >
    {children}
  </Flex>
);
