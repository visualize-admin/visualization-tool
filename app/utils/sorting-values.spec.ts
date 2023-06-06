import orderBy from "lodash/orderBy";

import { SortingField } from "@/configurator";
import {
  DimensionMetadataFragment,
  DimensionMetadataWithHierarchiesFragment,
} from "@/graphql/query-hooks";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

const dimension = {
  hierarchy: [
    {
      label: "Switzerland",
      value: "CH",
      identifier: "CH",
      depth: 0,
      children: [
        {
          label: "Production Regions",
          value: "CH-PROD",
          identifier: "CH-PROD",
          depth: 1,
          children: [
            {
              label: "West Production Region",
              value: "CH-PROD-WEST",
              identifier: "CH-PROD-WEST",
              depth: 2,
            },
            {
              label: "East Production Region",
              value: "CH-PROD-EAST",
              identifier: "CH-PROD-EAST",
              depth: 2,
            },
          ],
        },
      ],
    },
    {
      label: "Bern",
      value: "CH-BE",
      depth: -1,
      children: [],
    },
  ],
  values: [
    {
      label: "Switzerland",
      value: "CH",
      identifier: "CH",
    },
    {
      label: "Bern",
      value: "CH-BE",
      identifier: "CH-BE",
    },
    {
      label: "West Production Region",
      value: "CH-PROD-WEST",
      identifier: "CH-PROD-WEST",
    },
    {
      label: "East Production Region",
      value: "CH-PROD-EAST",
      identifier: "CH-PROD-EAST",
    },
  ],
} as unknown as DimensionMetadataWithHierarchiesFragment;

const measure = {
  __typename: "NumericalMeasure",
} as unknown as DimensionMetadataFragment;

describe("makeDimensionValueSorters", () => {
  const sorting: NonNullable<SortingField["sorting"]> = {
    sortingType: "byAuto",
    sortingOrder: "asc",
  };

  it("should correctly sort hierarchical dimensions byAuto", () => {
    const values = dimension.values.map((d) => d.value);
    const sorters = makeDimensionValueSorters(dimension, { sorting });
    const sortingOrders = getSortingOrders(sorters, sorting);
    expect(orderBy(values, sorters, sortingOrders)).toEqual([
      "CH",
      "CH-PROD-EAST",
      "CH-PROD-WEST",
      "CH-BE",
    ]);
  });

  it("should correctly sort numerical measures byAuto", () => {
    const values = [1, 10, 5, 100, 2];
    const sorters = makeDimensionValueSorters(measure, { sorting });
    const sortingOrders = getSortingOrders(sorters, sorting);
    expect(orderBy(values, sorters, sortingOrders)).toEqual([1, 2, 5, 10, 100]);
  });
});
