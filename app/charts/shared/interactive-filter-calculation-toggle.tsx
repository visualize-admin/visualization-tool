import { t } from "@lingui/macro";
import { useCallback } from "react";

import { Switch } from "@/components/form";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";

export const CalculationToggle = () => {
  const calculation = useChartInteractiveFilters((d) => d.calculation);
  const setCalculationType = useChartInteractiveFilters(
    (d) => d.setCalculationType
  );

  const onChange = useCallback(() => {
    setCalculationType(calculation.type === "percent" ? "identity" : "percent");
  }, [calculation.type, setCalculationType]);

  return (
    <Switch
      label={t({
        id: "controls.calculation.show-in-percentage",
        message: "Show in %",
      })}
      checked={calculation.type === "percent"}
      onChange={onChange}
      smaller
      sx={{ mr: 0 }}
    />
  );
};
