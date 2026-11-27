import { useMemo } from "react";

import {
  findDimensionValue,
  makeDimensionValueLookups,
} from "@/charts/shared/abbreviations";
import { TableColumn, TableFields } from "@/configurator";
import {
  canUseAbbreviations,
  Component,
  getDimensionValueLabel,
  Observation,
} from "@/domain/data";
import { useStableIds } from "@/utils/use-stable-ids";

export const useAbbreviatedComponents = ({
  fields,
  components,
}: {
  fields: TableFields;
  components: Component[];
}) => {
  const ids = useStableIds(
    getAbbreviatedComponents({ fields, components }).map(
      (component) => component.id
    )
  );

  return useMemo(() => {
    const abbreviatedIds = new Set(ids);

    return components.filter((component) => abbreviatedIds.has(component.id));
  }, [components, ids]);
};

export const getAbbreviatedComponents = ({
  fields,
  components,
}: {
  fields: TableFields;
  components: Component[];
}) => {
  return components.filter((component) =>
    usesAbbreviations({ column: fields[component.id], component })
  );
};

export const abbreviateObservations = ({
  observations,
  components,
}: {
  observations: Observation[];
  components: Component[];
}) => {
  if (components.length === 0) {
    return observations;
  }

  const columns = components.map((component) => ({
    dimensionId: component.id,
    ...makeDimensionValueLookups(component.values),
  }));

  return observations.map((observation) => {
    const abbreviated = { ...observation };

    for (const column of columns) {
      const dimensionValue = findDimensionValue({ observation, ...column });
      abbreviated[column.dimensionId] = dimensionValue
        ? getDimensionValueLabel({ dimensionValue, useAbbreviations: true })
        : observation[column.dimensionId];
    }

    return abbreviated;
  });
};

export const usesAbbreviations = ({
  column,
  component,
}: {
  column: TableColumn | undefined;
  component: Component;
}) => {
  return !!column?.useAbbreviations && canUseAbbreviations(component);
};
