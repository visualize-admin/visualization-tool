import { t } from "@lingui/macro";

import { ChartConfig } from "@/config-types";
import { Dimension, Measure } from "@/domain/data";

export function generateChartTitle(
  chartInfo: ChartConfig,
  dimensionsByIri: Record<string, Dimension | Measure>
): string {
  const { chartType } = chartInfo;
  const getLabel = (type: "x" | "y" | "segment") => {
    const field = chartInfo.fields[type as keyof (typeof chartInfo)["fields"]];
    // @ts-ignore
    const iri = field?.componentIri;
    const dimension = dimensionsByIri[iri];
    return dimension?.label ?? "";
  };

  // prettier-ignore
  const chartTitleLocales = {
      column: t({ id: "columnChart", message: `${getLabel("y")} per ${getLabel("x")}` }),
      line: t({ id: "lineChart", message: `Evolution of the ${getLabel("y")}` }),
      area: t({ id: "areaChart", message: `Distribution of ${getLabel("y")} over ${getLabel("x")}` }),
      areaSegmented: t({ id: `Shares of ${getLabel("y")} by ${getLabel("segment")}` }),
      pie: t({ id: "pieChart", message: `${getLabel("y")} per ${getLabel("segment")}` }),
      map: t({ id: "mapChart", message: `Geographical distribution of ${getLabel("y")}` }),
      scatterplot: t({ id: "scatterplotChart", message: `${getLabel("y")} against ${getLabel("x")}` }),
      table: t({ id: "tableChart", message: `Table` }),
      comboLineSingle: t({ id: "comboLineSingleChart", message: `Combo line single chart` }),
      comboLineDual: t({ id: "comboLineDuoChart", message: `Combo line dual chart` }),
      comboLineColumn: t({ id: "comboLineSingleChart", message: `Combo line column chart` }),
  };

  const defaultChartTitle = `${chartType} Chart`;
  const chartTitle = chartTitleLocales[chartType] || defaultChartTitle;
  return chartTitle;
}
