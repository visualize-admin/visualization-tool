import { formatLocale } from "d3-format";

import { Locale } from "@/locales/locales";

export const formatInteger = formatLocale({
  decimal: ".",
  thousands: "\u00a0",
  grouping: [3],
  currency: ["", "\u00a0 CHF"],
  minus: "\u2212",
  percent: "%",
}).format(",d");

export const formatYearMonth = (date: Date, { locale }: { locale: Locale }) => {
  const year = date.getFullYear();
  const month = date.toLocaleDateString(locale, { month: "short" });

  return `${year} ${month}`;
};
