import produce from "immer";
import { InteractiveFiltersConfig } from "../config-types";

export const toggleInteractiveFilter = produce(
  (
    IFConfig: InteractiveFiltersConfig,
    { path, value }: { path: "legend" | "time"; value: boolean }
  ): InteractiveFiltersConfig => {
    if (!IFConfig[path]) {
      return IFConfig;
    }
    IFConfig[path].active = value;
    return IFConfig;
  }
);
