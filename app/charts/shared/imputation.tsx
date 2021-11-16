import { interpolate } from "d3-interpolate";

export const interpolateZerosValue = () => {
  return Number.MIN_VALUE;
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
  const indexedData: Array<[TemporalSeriesBeforeImputationEntry, number]> =
    dataSortedByX.map((d, i) => [d, i]);
  const presentDataIndexes = indexedData
    .filter((d) => d[0].value !== null)
    .map((d) => d[1]);
  const missingDataIndexes = indexedData
    .filter((d) => d[0].value === null)
    .map((d) => d[1]);

  for (const missingDataIndex of missingDataIndexes) {
    const nextIndex = presentDataIndexes.findIndex((d) => d > missingDataIndex);

    if (nextIndex) {
      const previousIndex = nextIndex - 1;

      if (previousIndex >= 0) {
        const previous = dataSortedByX[presentDataIndexes[previousIndex]];
        const next = dataSortedByX[presentDataIndexes[nextIndex]];

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
