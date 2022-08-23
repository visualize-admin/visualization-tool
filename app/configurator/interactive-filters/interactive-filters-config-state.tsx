import produce from "immer";

import { InteractiveFiltersConfig } from "@/configurator/config-types";
import { InteractiveFilterType } from "@/configurator/interactive-filters/interactive-filters-configurator";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

export const toggleInteractiveFilter = produce(
  (
    IFConfig: InteractiveFiltersConfig,
    { path, value }: { path: InteractiveFilterType; value: boolean }
  ): InteractiveFiltersConfig => {
    if (!IFConfig?.[path]) {
      return IFConfig;
    }
    IFConfig[path].active = value;
    return IFConfig;
  }
);

// Time
export const toggleInteractiveTimeFilter = produce(
  (
    IFConfig: InteractiveFiltersConfig,
    {
      path,
      value,
      timeExtent,
    }: {
      path: "time";
      value: boolean;
      timeExtent: string[];
    }
  ): InteractiveFiltersConfig => {
    if (!IFConfig?.[path]) {
      return IFConfig;
    }

    // Toggle time brush on/off
    IFConfig[path].active = value;

    // set min and max date as default presets for time brush
    if (value && !IFConfig[path].presets.from && !IFConfig[path].presets.to) {
      IFConfig[path].presets.from = timeExtent[0];
      IFConfig[path].presets.to = timeExtent[1];
    }
    return IFConfig;
  }
);
export const updateInteractiveTimeFilter = produce(
  (
    IFConfig: InteractiveFiltersConfig,
    {
      path,
      timeExtent,
    }: {
      path: "time";
      timeExtent: string[];
    }
  ): InteractiveFiltersConfig => {
    if (!IFConfig?.[path]) {
      return IFConfig;
    }

    IFConfig[path].presets.from = timeExtent[0];
    IFConfig[path].presets.to = timeExtent[1];

    return IFConfig;
  }
);

// Data filters
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
      dimensions: DimensionMetadataFragment[];
    }
  ): InteractiveFiltersConfig => {
    if (!IFConfig?.[path]) {
      return IFConfig;
    }

    // Toggle filters on/off
    IFConfig[path].active = value;

    // Default: toggle dimensions if none is selected, but they are set to true
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
    if (!IFConfig?.dataFilters.componentIris) {
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
