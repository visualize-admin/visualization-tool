import { interpolate } from "d3-interpolate";

import { ChartConfig, isAreaConfig } from "@/config-types";

export const interpolateZerosValue = () => {
  return 0;
};

export const interpolateTemporalLinearValue = ({
  previousValue,
  nextValue,
  previousTime,
  currentTime,
  nextTime,
}: {
  previousValue: number;
  nextValue: number;
  previousTime: number;
  currentTime: number;
  nextTime: number;
}) => {
  return interpolate(
    previousValue,
    nextValue
  )((currentTime - previousTime) / (nextTime - previousTime));
};

interface TemporalSeriesBeforeImputationEntry {
  date: Date;
  value: number | null;
}

interface TemporalSeriesAfterImputationEntry {
  date: Date;
  value: number;
}

export const imputeTemporalLinearSeries = ({
  dataSortedByX,
}: {
  dataSortedByX: Array<TemporalSeriesBeforeImputationEntry>;
}): Array<TemporalSeriesAfterImputationEntry> => {
  const presentDataIndexes = [];
  const missingDataIndexes = [];

  for (let i = 0; i < dataSortedByX.length; i++) {
    if (dataSortedByX[i].value !== null) {
      presentDataIndexes.push(i);
    } else {
      missingDataIndexes.push(i);
    }
  }

  for (const missingDataIndex of missingDataIndexes) {
    const nextPresentDataIndex = presentDataIndexes.findIndex(
      (d) => d > missingDataIndex
    );

    if (nextPresentDataIndex) {
      const previousPresentDataIndex = nextPresentDataIndex - 1;

      if (previousPresentDataIndex >= 0) {
        const previous =
          dataSortedByX[presentDataIndexes[previousPresentDataIndex]];
        const next = dataSortedByX[presentDataIndexes[nextPresentDataIndex]];

        dataSortedByX[missingDataIndex] = {
          date: dataSortedByX[missingDataIndex].date,
          value: interpolateTemporalLinearValue({
            previousValue: previous.value!,
            nextValue: next.value!,
            previousTime: previous.date.getTime(),
            nextTime: next.date.getTime(),
            currentTime: dataSortedByX[missingDataIndex].date.getTime(),
          }),
        };

        continue;
      }
    }

    dataSortedByX[missingDataIndex] = {
      date: dataSortedByX[missingDataIndex].date,
      value: 0,
    };
  }

  return dataSortedByX as Array<TemporalSeriesAfterImputationEntry>;
};

export const isUsingImputation = (chartConfig: ChartConfig): boolean => {
  if (isAreaConfig(chartConfig)) {
    const imputationType = chartConfig.fields.y.imputationType || "";

    return ["zeros", "linear"].includes(imputationType);
  }

  return false;
};
