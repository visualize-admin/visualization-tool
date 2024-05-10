import { Slider, sliderClasses } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { useState } from "react";

import { ChartConfig } from "@/configurator";
import { useDashboardInteractiveFilters } from "@/stores/interactive-filters";
import { assert } from "@/utils/assert";

const useStyles = makeStyles((theme: Theme) => ({
  slider: {
    maxWidth: 800,
    margin: theme.spacing(6, 4, 2),

    [`& .${sliderClasses.track}`]: {
      height: 1,
    },
    [`& .${sliderClasses.rail}.${sliderClasses.rail}`]: {
      backgroundColor: theme.palette.grey[600],
    },
  },
}));

export const DashboardInteractiveFilters = ({
  chartConfigs,
}: {
  chartConfigs: ChartConfig[];
}) => {
  const classes = useStyles();
  const dashboardInteractiveFilters = useDashboardInteractiveFilters();
  const [timeRange, setTimeRange] = useState(() => {
    return dashboardInteractiveFilters.sharedFilters.find(
      (x) => x.type === "timeRange"
    )?.value?.presets;
  });

  const handleChangeSlider = (
    componentIri: string,
    value: number | number[]
  ) => {
    assert(Array.isArray(value), "Value should be an array of two numbers");
    if (!componentIri) {
      return;
    }
    for (const [_getState, _useStore, store] of Object.values(
      dashboardInteractiveFilters.stores
    )) {
      store.setState(() => {
        return {
          timeRange: {
            // TODO infer from the values
            from: new Date(value[0], 0, 1),
            to: new Date(value[1], 11, 31),
          },
        };
      });
      setTimeRange({
        type: "range",
        from: `${value[0]}`,
        to: `${value[1]}`,
      });
    }
  };

  return (
    <>
      {dashboardInteractiveFilters.sharedFilters.map((filter) => {
        if (filter.type !== "timeRange" || !filter.value || !timeRange) {
          return null;
        }

        return (
          <Slider
            className={classes.slider}
            key={filter.iri}
            onChange={(_ev, value) => handleChangeSlider(filter.iri, value)}
            min={Number(filter.value.presets.from)}
            max={Number(filter.value.presets.to)}
            valueLabelDisplay="on"
            value={[Number(timeRange.from), Number(timeRange.to)]}
            marks
          />
        );
      })}
    </>
  );
};
