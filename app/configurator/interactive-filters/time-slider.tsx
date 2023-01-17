import { bisect, scaleLinear } from "d3";
import React, { ChangeEvent } from "react";

import { ChartState, useChartState } from "@/charts/shared/use-chart-state";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { TableChartState } from "@/charts/table/table-state";
import { Slider } from "@/components/form";
import { parseDate } from "@/configurator/components/ui-helpers";
import useEvent from "@/utils/use-event";

export const TimeSlider = ({ componentIri }: { componentIri?: string }) => {
  const [IFState, dispatch] = useInteractiveFilters();
  const [t, setT] = React.useState(0);
  const chartState = useChartState() as NonNullable<
    Exclude<ChartState, TableChartState>
  >;

  const sortedMs = React.useMemo(() => {
    // FIXME: enable interactive filters for maps!
    if (componentIri && chartState.chartType !== "map") {
      const uniqueValues = [
        ...new Set(
          chartState.allData.map((d) => d[componentIri]).filter(Boolean)
        ),
      ] as string[];
      const sortedMs = uniqueValues
        .sort()
        .map(parseDate)
        .map((d) => d.getTime());

      return sortedMs;
    }

    return [];
    // @ts-ignore - allData is not yet there for the maps
  }, [chartState.chartType, chartState.allData, componentIri]);

  const msScale = React.useMemo(() => {
    if (sortedMs.length) {
      const [min, max] = [sortedMs[0], sortedMs[sortedMs.length - 1]];
      return scaleLinear().range([min, max]);
    }
  }, [sortedMs]);

  const onChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    const t = +e.target.value;
    setT(t);

    if (msScale) {
      const tMs = Math.round(msScale(t));
      const i = bisect(sortedMs, tMs);
      const updateMs = sortedMs[i - 1];

      if (IFState.timeSlider.value?.getTime() !== updateMs) {
        dispatch({
          type: "SET_TIME_SLIDER_FILTER",
          value: new Date(updateMs),
        });
      }
    }
  });

  React.useEffect(() => {
    onChange({ target: { value: "0" } } as ChangeEvent<HTMLInputElement>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedMs]);

  return (
    <Slider
      name="time-slider"
      min={0}
      max={1}
      step={0.0001}
      value={t}
      onChange={onChange}
    />
  );
};
