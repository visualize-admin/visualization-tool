import { t } from "@lingui/macro";
import React from "react";

import { Switch } from "@/components/form";
import { useInteractiveFilters } from "@/stores/interactive-filters";

export const CalculationToggle = () => {
  const calculation = useInteractiveFilters((d) => d.calculation);
  const setCalculationType = useInteractiveFilters((d) => d.setCalculationType);

  const onChange = React.useCallback(() => {
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
      sx={{ mr: 0 }}
    />
  );
};
