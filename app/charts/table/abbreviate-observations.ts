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

export const abbreviateObservations = ({
  observations,
  fields,
  components,
}: {
  observations: Observation[];
  fields: TableFields;
  components: Component[];
}) => {
  const abbreviatedColumns = components
    .filter((component) =>
      usesAbbreviations({ column: fields[component.id], component })
    )
    .map((component) => ({
      dimensionId: component.id,
      ...makeDimensionValueLookups(component.values),
    }));

  if (abbreviatedColumns.length === 0) {
    return observations;
  }

  return observations.map((observation) => {
    const abbreviated = { ...observation };

    for (const column of abbreviatedColumns) {
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
