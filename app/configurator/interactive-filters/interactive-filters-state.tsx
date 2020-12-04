import produce from "immer";
import { InteractiveFiltersConfig } from "../config-types";
import { InteractveFilterType } from "./interactive-filters-configurator";

export const toggleInteractiveFilter = produce(
  (
    IFConfig: InteractiveFiltersConfig,
    { path, value }: { path: InteractveFilterType; value: boolean }
  ): InteractiveFiltersConfig => {
    if (!IFConfig[path]) {
      return IFConfig;
    }
    IFConfig[path].active = value;
    return IFConfig;
  }
);
export const toggleInteractiveFilterDataDimension = produce(
  (
    IFConfig: InteractiveFiltersConfig,
    cIri: string
  ): InteractiveFiltersConfig => {
    console.log("cIri", cIri);
    console.log(
      "IFConfig.dataFilters.componentIris",
      IFConfig.dataFilters.componentIris
    );
    if (!IFConfig.dataFilters || !IFConfig.dataFilters.componentIris) {
      return IFConfig;
    }
    if (IFConfig.dataFilters.componentIris.includes(cIri)) {
      const newComponentIris = IFConfig.dataFilters.componentIris.filter(
        (d) => d !== cIri
      );
      const newDataFilters = {
        ...IFConfig.dataFilters,
        componentIris: newComponentIris,
      };
      return { ...IFConfig, dataFilters: newDataFilters };
    } else if (!IFConfig.dataFilters.componentIris.includes(cIri)) {
      const newComponentIris = [...IFConfig.dataFilters.componentIris, cIri];
      const newDataFilters = {
        ...IFConfig.dataFilters,
        componentIris: newComponentIris,
      };
      console.log("add filter", newDataFilters);
      return { ...IFConfig, dataFilters: newDataFilters };
    } else {
      return IFConfig;
    }
  }
);
