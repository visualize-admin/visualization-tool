import { format } from "d3-format";
import { NumberValue } from "d3-scale";
import { timeDay, timeHour, timeMinute, timeMonth, timeYear } from "d3-time";
import { timeParse } from "d3-time-format";
import keyBy from "lodash/keyBy";
import memoize from "lodash/memoize";
import { useMemo } from "react";

import { parseDate } from "@/configurator/components/ui-helpers";
import {
  Component,
  isNumericalMeasure,
  isTemporalDimension,
  NumericalMeasure,
  TemporalDimension,
  TemporalEntityDimension,
} from "@/domain/data";
import { TimeUnit } from "@/graphql/query-hooks";
import { getD3FormatLocale, getD3TimeFormatLocale } from "@/locales/locales";
import { useLocale } from "@/locales/use-locale";

const DIMENSION_VALUE_UNDEFINED = "https://cube.link/Undefined";
const NO_AVAILABLE_VALUE_RETURN_REPLACEMENT = "–";

const isNamedNodeDimension = (d: Component) => {
  const first = d.values?.[0];
  return first && first.label !== first.value;
};

const isDataCubeNamedNodeDimension = (d: Component) => {
  return isNamedNodeDimension(d as Component);
};

const namedNodeFormatter = (d: Component) => {
  const valuesByIri = keyBy(d.values, (x) => x.value);
  return (v: string) => {
    return valuesByIri[v]?.label || v;
  };
};

const currencyFormatter = (d: NumericalMeasure) => {
  const formatLocale = getD3FormatLocale();
  const minDecimals = d.resolution ?? d.currencyExponent ?? 2;
  const maxDecimals = 8;
  const baseFormatter = formatLocale.format(`,.${maxDecimals}f`);
  return (v: number) => {
    const formatted = baseFormatter(v);
    const l = formatted.length;

    // TODO Decimal separator should be based on locale
    const dot = formatted.indexOf(".");

    let lastSignificantIndex = formatted.length - maxDecimals + minDecimals - 1;
    for (let i = l - maxDecimals + minDecimals; i < l; i++) {
      if (formatted[i] !== "0") {
        lastSignificantIndex = i;
      }
    }
    return formatted.substring(
      0,
      lastSignificantIndex +
        (minDecimals === 0 || dot === lastSignificantIndex ? 0 : 1)
    );
  };
};

export const getFormattersForLocale = memoize((locale) => {
  const { format } = getD3TimeFormatLocale(locale);
  return {
    empty: () => "-",
    second: format("%d.%m.%Y %H:%M:%S"),
    minute: format("%d.%m.%Y %H:%M"),
    hour: format("%d.%m.%Y %H:%M"),
    day: format("%d.%m.%Y"),
    month: format("%m.%Y"),
    year: format("%Y"),
  };
});

const useLocalFormatters = () => {
  const locale = useLocale();
  return getFormattersForLocale(locale);
};

export const dateFormatterFromDimension = (
  dim: TemporalDimension | TemporalEntityDimension,
  localFormatters: LocalDateFormatters,
  formatDateAuto: (d: Date | string | null) => string
) => {
  if (
    dim.timeFormat &&
    dim.timeUnit &&
    localFormatters[dim.timeUnit.toLowerCase() as keyof typeof localFormatters]
  ) {
    const formatter =
      localFormatters[
        dim.timeUnit.toLowerCase() as keyof typeof localFormatters
      ];
    const parser = timeParse(dim.timeFormat);
    const timezoneParser = timeParse(`${dim.timeFormat}%Z`);

    return (d: string | null) => {
      if (!d) {
        return localFormatters.empty();
      }

      const parsed = parser(d) ?? timezoneParser(d);

      return parsed ? formatter(parsed) : localFormatters.empty();
    };
  }

  return formatDateAuto;
};

type Formatter = (x: string) => string;

export const formatIdentity = (x: string | number | Date | null) => {
  return x !== DIMENSION_VALUE_UNDEFINED && x !== null
    ? `${x}`
    : NO_AVAILABLE_VALUE_RETURN_REPLACEMENT;
};

const decimalFormatter = (dim: NumericalMeasure, formatNumber: Formatter) => {
  const res = dim.resolution;
  const hasResolution = typeof res === "number";
  const formatting = `${hasResolution ? `.${res}` : ""}~e`;
  const expFormatter = format(formatting);
  return (v: string) => {
    const p = parseFloat(v);
    const a = Math.abs(p);
    if (p === 0) {
      return formatNumber(v);
    } else if (a > 999_999_999 || a < 0.0001) {
      return expFormatter(p);
    } else {
      return v;
    }
  };
};

const getDimensionFormatters = ({
  components,
  formatNumber,
  formatDateAuto,
  dateFormatters,
}: {
  components: Component[];
  formatNumber: (d: number | string) => string;
  formatDateAuto: (d: Date | string | null) => string;
  dateFormatters: LocalDateFormatters;
}) => {
  return Object.fromEntries(
    components.map((d) => {
      let formatter: (s: any) => string;
      if (isNumericalMeasure(d)) {
        if (d.isCurrency) {
          formatter = currencyFormatter(d);
        } else if (d.isDecimal) {
          formatter = decimalFormatter(d, formatNumber);
        } else {
          formatter = formatNumber;
        }
      } else if (isTemporalDimension(d)) {
        formatter = dateFormatterFromDimension(
          d,
          dateFormatters,
          formatDateAuto
        );
      } else if (isDataCubeNamedNodeDimension(d)) {
        formatter = namedNodeFormatter(d);
      } else if (
        // It makes no sense to format numeric values of ordinal dimensions
        // as numbers.
        d.isNumerical &&
        d.__typename !== "OrdinalDimension" &&
        d.__typename !== "OrdinalMeasure"
      ) {
        formatter = formatNumber;
      } else {
        formatter = formatIdentity;
      }

      return [d.id, formatter];
    })
  );
};

export const useDimensionFormatters = (components: Component[]) => {
  const formatNumber = useFormatNumber() as unknown as (
    d: number | string
  ) => string;
  const formatDateAuto = useFormatFullDateAuto();
  const dateFormatters = useLocalFormatters();

  return useMemo(() => {
    return getDimensionFormatters({
      components,
      formatNumber,
      formatDateAuto,
      dateFormatters,
    });
  }, [components, formatNumber, formatDateAuto, dateFormatters]);
};

export const getFormatFullDateAuto = (formatters: LocalDateFormatters) => {
  return (dateInput: Date | string | null) => {
    if (dateInput === null) {
      return formatters.empty();
    }

    const date =
      typeof dateInput === "string" ? parseDate(dateInput) : dateInput;

    return (
      timeMinute(date) < date
        ? formatters.second
        : timeHour(date) < date
          ? formatters.minute
          : timeDay(date) < date
            ? formatters.hour
            : timeMonth(date) < date
              ? formatters.day
              : timeYear(date) < date
                ? formatters.month
                : formatters.year
    )(date);
  };
};

type LocalDateFormatters = ReturnType<typeof getFormattersForLocale>;

/**
 * Formats dates automatically based on their precision in LONG form.
 *
 * Use wherever dates are displayed without being in context of other dates (e.g. in tooltips)
 */
export const useFormatFullDateAuto = () => {
  const formatters = useLocalFormatters();

  return useMemo(() => {
    return getFormatFullDateAuto(formatters);
  }, [formatters]);
};

/**
 * Parses and formats ISO *dates* of form 2002-01-01.
 */
export const useFormatDate = () => {
  const locale = useLocale();
  const formatter = useMemo(() => {
    const { format, parse } = getD3TimeFormatLocale(locale);

    const parseDate = parse("%Y-%m-%d");
    const formatDate = format("%d.%m.%Y");

    return (date: string) => {
      const d = parseDate(date);
      return d ? formatDate(d) : null;
    };
  }, [locale]);

  return formatter;
};

/**
 * Parses and formats ISO *dates* of form 2002-01-01.
 */
export const useTimeFormatLocale = () => {
  const locale = useLocale();
  const formatter = useMemo(() => {
    return getD3TimeFormatLocale(locale);
  }, [locale]);

  return formatter;
};

const timeFormats = new Map<TimeUnit, string>([
  [TimeUnit.Year, "%Y"],
  [TimeUnit.Month, "%b %Y"],
  [TimeUnit.Week, "%d.%m.%Y"],
  [TimeUnit.Day, "%d.%m.%Y"],
  [TimeUnit.Hour, "%d.%m.%Y %H:%M"],
  [TimeUnit.Minute, "%d.%m.%Y %H:%M"],
  [TimeUnit.Second, "%d.%m.%Y %H:%M:%S"],
]);

export const useTimeFormatUnit = () => {
  const locale = useLocale();
  const formatter = useMemo(() => {
    const { format } = getD3TimeFormatLocale(locale);

    return (dateInput: Date | string, timeUnit: TimeUnit) => {
      const date =
        typeof dateInput === "string" ? parseDate(dateInput) : dateInput;

      const timeFormat =
        timeFormats.get(timeUnit) ?? timeFormats.get(TimeUnit.Day)!;
      const f = format(timeFormat);

      return f(date);
    };
  }, [locale]);

  return formatter;
};

const getFormatNumber = (props?: { decimals: number | "auto" }) => {
  const { decimals = 2 } = props ?? {};
  const { format } = getD3FormatLocale();
  // Only valid for up to 6 decimals!
  // See https://262.ecma-international.org/6.0/#sec-number.prototype.toprecision, 12c.
  const specifier = decimals === "auto" ? ",~f" : `,.${decimals}~f`;
  const formatter = format(specifier);

  return (d: NumberValue | null | undefined) => {
    if (d === null || d === undefined) {
      return "–";
    }
    return `${formatter(d)}`;
  };
};

export const useFormatNumber = (props?: { decimals: number | "auto" }) => {
  return useMemo(() => {
    return getFormatNumber(props);
  }, [props]);
};

export const useFormatInteger = () => {
  return useMemo(() => {
    const { format } = getD3FormatLocale();
    const formatter = format(",.0~f");
    return (x: NumberValue | null | undefined) => {
      if (x === null || x === undefined) {
        return "–";
      }
      return formatter(x);
    };
  }, []);
};

/**
 * Formats dates automatically based on their precision in SHORT form.
 *
 * Use wherever dates are displayed in context of other dates (e.g. on time axes)
 */
export const useFormatShortDateAuto = () => {
  const locale = useLocale();
  const formatter = useMemo(() => {
    const { format } = getD3TimeFormatLocale(locale);

    const formatSecond = format(":%S");
    const formatMinute = format("%H:%M");
    const formatHour = format("%H");
    const formatDay = format("%d");
    const formatMonth = format("%b");
    const formatYear = format("%Y");

    return (date: Date) => {
      return (
        timeMinute(date) < date
          ? formatSecond
          : timeHour(date) < date
            ? formatMinute
            : timeDay(date) < date
              ? formatHour
              : timeMonth(date) < date
                ? formatDay
                : timeYear(date) < date
                  ? formatMonth
                  : formatYear
      )(date);
    };
  }, [locale]);

  return formatter;
};

export const formatNumberWithUnit = (
  nb: number | null,
  formatter: (n: number) => string,
  unit?: string | null
) => {
  if (nb === null || nb === undefined) {
    return "-";
  }
  return `${formatter(nb)}${unit ? ` ${unit}` : ""}`;
};
