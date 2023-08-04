import { t } from "@lingui/macro";
import React from "react";

import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { Switch } from "@/components/form";

export const CalculationToggle = () => {
  const [state, dispatch] = useInteractiveFilters();

  const onChange = React.useCallback(() => {
    dispatch({
      type: "SET_CALCULATION_TYPE",
      value: state.calculation.type === "percent" ? "identity" : "percent",
    });
  }, [dispatch, state.calculation.type]);

  return (
    <Switch
      label={t({
        id: "controls.calculation.show-in-percentage",
        message: "Show in %",
      })}
      checked={state.calculation.type === "percent"}
      onChange={onChange}
      sx={{ mr: 0 }}
    />
  );
};
