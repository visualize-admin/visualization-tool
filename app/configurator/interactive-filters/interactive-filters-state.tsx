import produce from "immer";
import { InteractiveFilters } from "../config-types";

export const toggleInteractiveFilter = produce(
  (
    IFConfig: InteractiveFilters,
    { path, value }: { path: "legend" | "time"; value: boolean }
  ): InteractiveFilters => {
    if (!IFConfig[path]) {
      return IFConfig;
    }
    IFConfig[path].active = !value;
    return IFConfig;
  }
);
