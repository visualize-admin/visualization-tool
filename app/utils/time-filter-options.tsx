import {
  DimensionValue,
  getTemporalEntityValue,
  ObservationValue,
  TemporalDimension,
  TemporalEntityDimension,
} from "@/domain/data";
import { useTimeFormatLocale, useTimeFormatUnit } from "@/formatters";

type GetTimeFilterOptionsProps = {
  dimension: TemporalDimension | TemporalEntityDimension;
  formatLocale: ReturnType<typeof useTimeFormatLocale>;
  timeFormatUnit: ReturnType<typeof useTimeFormatUnit>;
};

export const getTimeFilterOptions = (props: GetTimeFilterOptionsProps) => {
  const { dimension, formatLocale, timeFormatUnit } = props;
  const { timeFormat, timeUnit } = dimension;
  const parse = formatLocale.parse(timeFormat);
  const sortedOptions: {
    value: ObservationValue;
    label: string;
    date: Date;
  }[] = [];
  const sortedValues: ObservationValue[] = [];

  for (const dimensionValue of dimension.values) {
    let value: DimensionValue["value"];

    switch (dimension.__typename) {
      case "TemporalDimension":
        value = dimensionValue.value;
        break;
      case "TemporalEntityDimension":
        value = getTemporalEntityValue(dimensionValue);
        break;
      default:
        const _exhaustiveCheck: never = dimension;
        return _exhaustiveCheck;
    }

    const date = parse(`${value}`);

    if (date) {
      sortedOptions.push({
        value,
        label: timeFormatUnit(date, timeUnit),
        date,
      });
      sortedValues.push(value);
    }
  }

  return {
    sortedOptions,
    sortedValues,
  };
};
