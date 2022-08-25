import { BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
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
        editable={true}
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

const useChartPanelInnerStyles = makeStyles((theme: Theme) => ({
  root: {
    flexDirection: "column",
    backgroundColor: theme.palette.grey[100],
    boxShadow: theme.shadows[6],
    borderRadius: 12,
    // TODO: Handle properly when chart composition is implemented (enable when
    // ChartSelectionTabs becomes scrollable)
    borderTopRightRadius: 12,
    overflow: "hidden",
    width: "auto",
  },
}));

const ChartPanelInner = ({
  children,
  showTabs = true,
  ...boxProps
}: ChartPanelProps & { showTabs: boolean }) => {
  const classes = useChartPanelInnerStyles();
  return (
    <Flex
      {...boxProps}
      className={classes.root}
      sx={{
        borderTopLeftRadius: showTabs ? 0 : 12,
        minHeight: [150, 300, 500],
        ...boxProps.sx,
      }}
    >
      {children}
    </Flex>
  );
};
