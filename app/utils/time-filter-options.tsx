import {
  DimensionValue,
  getTemporalEntityValue,
  ObservationValue,
  TemporalDimension,
  TemporalEntityDimension,
} from "@/domain/data";
import { useTimeFormatLocale, useTimeFormatUnit } from "@/formatters";

export const getTimeFilterOptions = ({
  dimension,
  formatLocale,
  timeFormatUnit,
}: {
  dimension: TemporalDimension | TemporalEntityDimension;
  formatLocale: ReturnType<typeof useTimeFormatLocale>;
  timeFormatUnit: ReturnType<typeof useTimeFormatUnit>;
}) => {
  const { timeFormat, timeUnit } = dimension;
  const parseDate = getMaybeTimezoneDateParser({ formatLocale, timeFormat });
  const formatDate = formatLocale.format(timeFormat);
  const options: {
    value: ObservationValue;
    label: string;
    date: Date;
  }[] = [];

  for (const dimensionValue of [
    ...dimension.values,
    // TODO: could be improved to be scoped to only currently activated limits
    ...dimension.relatedLimitValues,
  ]) {
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

    const date = parseDate(value);

    if (date) {
      options.push({
        // By formatting the date, we remove potential timezone.
        // FIXME: This might lead to issues with SPARQL filtering.
        value: formatDate(date),
        label: timeFormatUnit(date, timeUnit),
        date,
      });
    }
  }

  const sortedOptions = options.sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return {
    sortedOptions,
    sortedValues: sortedOptions.map((d) => d.value),
  };
};

const getMaybeTimezoneDateParser = ({
  formatLocale,
  timeFormat,
}: {
  formatLocale: ReturnType<typeof useTimeFormatLocale>;
  timeFormat: string;
}) => {
  const parse = formatLocale.parse(timeFormat);
  const timezoneParse = formatLocale.parse(`${timeFormat}%Z`);

  return (v: string | number | null) => {
    return (parse(`${v}`) ?? timezoneParse(`${v}`)) as Date;
  };
};
