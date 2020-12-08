import produce from "immer";
import { ComponentFieldsFragment } from "../../graphql/query-hooks";
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
export const toggleInteractiveDataFilter = produce(
  (
    IFConfig: InteractiveFiltersConfig,
    {
      path,
      value,
      dimensions,
    }: {
      path: "dataFilters";
      value: boolean;
      dimensions: ComponentFieldsFragment[];
    }
  ): InteractiveFiltersConfig => {
    if (!IFConfig[path]) {
      return IFConfig;
    }
    // Toggle filters on/off
    IFConfig[path].active = value;
    // Default: Check dimensions if none is selected, but they are set to true
    if (value && IFConfig[path].componentIris.length === 0) {
      IFConfig[path].componentIris = dimensions.map((d) => d.iri);
    }
    return IFConfig;
  }
);

// Add or remove a dimension from the interactive
// data filters dimensions list
export const toggleInteractiveFilterDataDimension = produce(
  (
    IFConfig: InteractiveFiltersConfig,
    cIri: string
  ): InteractiveFiltersConfig => {
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

      return { ...IFConfig, dataFilters: newDataFilters };
    } else {
      return IFConfig;
    }
  }
);
